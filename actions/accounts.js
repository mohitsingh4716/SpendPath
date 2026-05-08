"use server"

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

const serializeTransaction = (obj) => {
  const serialized = { ...obj };

  if (obj.balance !== undefined && obj.balance !== null) {
    serialized.balance = obj.balance.toNumber();
  }
  if (obj.amount !== undefined && obj.amount !== null) {
    serialized.amount = obj.amount.toNumber();
  }

  return serialized;
};

const TRANSACTIONS_PAGE_SIZE = 20;
const DATE_RANGES = {
  "7D": 7,
  "1M": 30,
  "3M": 90,
  "6M": 180,
  All: null,
};

function buildTransactionWhere({ accountId, userId, search, type, recurring }) {
  const where = {
    accountId,
    userId,
  };

  if (search?.trim()) {
    where.description = {
      contains: search.trim(),
      mode: "insensitive",
    };
  }

  if (type === "INCOME" || type === "EXPENSE") {
    where.type = type;
  }

  if (recurring === "recurring") {
    where.isRecurring = true;
  }

  if (recurring === "non-recurring") {
    where.isRecurring = false;
  }

  return where;
}

function buildTransactionOrderBy(sortField = "date", sortDirection = "desc") {
  const direction = sortDirection === "asc" ? "asc" : "desc";

  if (["date", "amount", "category"].includes(sortField)) {
    return [{ [sortField]: direction }, { createdAt: "desc" }];
  }

  return [{ date: "desc" }, { createdAt: "desc" }];
}

export async function updateDefaultAccount(accountId) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const user = await db.user.findUnique({
      where: {
        clerkUserId: userId,
      },
    });
    if (!user) {
      throw new Error("user Not found");
    }

    await db.account.updateMany({
        where:{ userId: user.id, isDefault: true},
        data: {isDefault: false},
    });

    const account = await db.account.update({
        where:{
            id: accountId,
            userId: user.id,
        },
        data:{ isDefault: true},

    });

    revalidatePath("/dashboard");
    return {success: true, data: serializeTransaction(account)};


  } catch (error) {
    return { success: false, error: error.message};
  }
}


export async function getAccountWithTransactions(accountId, options = {}){
  
     const { userId } = await auth();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const user = await db.user.findUnique({
      where: {
        clerkUserId: userId,
      },
    });
    if (!user) {
      throw new Error("user Not found");
    }

    const page = Math.max(Number(options.page) || 1, 1);
    const pageSize = TRANSACTIONS_PAGE_SIZE;
    const where = buildTransactionWhere({
      accountId,
      userId: user.id,
      search: options.search,
      type: options.type,
      recurring: options.recurring,
    });

    const account= await db.account.findUnique({
        where:{id: accountId, userId: user.id },
        include:{
            _count:{
                select: {transactions: true},
            },
        },
       
    });

    if(!account){
        return null;
    }

    const filteredCount = await db.transaction.count({ where });
    const totalPages = Math.max(Math.ceil(filteredCount / pageSize), 1);
    const currentPage = Math.min(page, totalPages);
    const transactions = await db.transaction.findMany({
      where,
      orderBy: buildTransactionOrderBy(options.sort, options.direction),
      skip: (currentPage - 1) * pageSize,
      take: pageSize,
    });

    return {
        ...serializeTransaction(account),
        transactions: transactions.map(serializeTransaction),
        pagination: {
          page: currentPage,
          pageSize,
          totalPages,
          totalCount: filteredCount,
          hasNextPage: currentPage < totalPages,
          hasPreviousPage: currentPage > 1,
        },
    }
    
}

export async function getAccountChartData(accountId, rangeKey = "1M") {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    select: { id: true },
  });
  if (!user) {
    throw new Error("user Not found");
  }

  const days = Object.prototype.hasOwnProperty.call(DATE_RANGES, rangeKey)
    ? DATE_RANGES[rangeKey]
    : DATE_RANGES["1M"];

  const dateFilter = {};
  if (days) {
    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    startDate.setDate(startDate.getDate() - days);
    dateFilter.gte = startDate;
  }

  const transactions = await db.transaction.findMany({
    where: {
      accountId,
      userId: user.id,
      ...(Object.keys(dateFilter).length ? { date: dateFilter } : {}),
    },
    select: {
      id: true,
      type: true,
      amount: true,
      date: true,
    },
    orderBy: { date: "asc" },
  });

  return transactions.map(serializeTransaction);
}


export async function bulkDeleteTransactions(transactionIds) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const user = await db.user.findUnique({
      where: {
        clerkUserId: userId,
      },
    });
    if (!user) {
      throw new Error("user Not found");
    }

    const transactions = await db.transaction.findMany({
      where:{
        id: {in: transactionIds},
        userId:user.id,
      }

    });

    const accountBalanceChanges= transactions.reduce((acc, transaction)=>{
      const change= 
         transaction.type === "EXPENSE" ? transaction.amount.toNumber() : -transaction.amount.toNumber();

         acc[transaction.accountId] = (acc[transaction.accountId] || 0) + change;
         return acc;
    },{});

    // Delete transactions  and update account balances in transaction
    await db.$transaction(async (tx)=>{
      // Delete Transaction
      await tx.transaction.deleteMany({
        where:{
          id: {in: transactionIds},
          userId: user.id,
        },
      })

      for(const [accountId, balanceChange] of Object.entries(accountBalanceChanges)){
        await tx.account.update({
          where:{
            id: accountId
          },
          data:{
            balance:{
              increment: balanceChange,
            },
          },
        });
      }
    });




    revalidatePath("/dashboard");
    revalidatePath("/account/[id]");
    return { success: true};
  } catch (error) {
    return { success: false, error: error.message };
  }
}
