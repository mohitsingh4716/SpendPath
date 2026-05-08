export const runtime = "nodejs";
export const maxDuration = 60;

import { generateHTMLTemplate } from "@/app/lib/htmlTemplate";
import { generatePDF } from "@/app/lib/pdfGenerator";
import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const DATE_RANGES = {
  "7D": 7,
  "1M": 30,
  "3M": 90,
  "6M": 180,
  All: null,
};

const serializeTransaction = (transaction) => ({
  ...transaction,
  amount: transaction.amount.toNumber(),
});

function getStartDate(rangeKey) {
  const days = Object.prototype.hasOwnProperty.call(DATE_RANGES, rangeKey)
    ? DATE_RANGES[rangeKey]
    : DATE_RANGES["1M"];

  if (!days) return null;

  const startDate = new Date();
  startDate.setHours(0, 0, 0, 0);
  startDate.setDate(startDate.getDate() - days);
  return startDate;
}

async function getTransactionsInChunks(where) {
  const pageSize = 500;
  const transactions = [];
  let cursor;

  while (true) {
    const chunk = await db.transaction.findMany({
      where,
      select: {
        id: true,
        type: true,
        amount: true,
        description: true,
        date: true,
        category: true,
      },
      orderBy: [{ date: "desc" }, { id: "desc" }],
      take: pageSize,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });

    if (chunk.length === 0) break;

    transactions.push(...chunk.map(serializeTransaction));

    if (chunk.length < pageSize) break;
    cursor = chunk[chunk.length - 1].id;
  }

  return transactions;
}

export async function GET(request, { params }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { accountId } = await params;
    const { searchParams } = new URL(request.url);
    const range = searchParams.get("range") || "1M";

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
      select: { id: true, name: true, email: true },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const account = await db.account.findUnique({
      where: { id: accountId, userId: user.id },
      select: { id: true },
    });

    if (!account) {
      return NextResponse.json({ message: "Account not found" }, { status: 404 });
    }

    const startDate = getStartDate(range);
    const where = {
      accountId,
      userId: user.id,
      ...(startDate ? { date: { gte: startDate } } : {}),
    };

    const transactions = await getTransactionsInChunks(where);
    const totals = transactions.reduce(
      (acc, transaction) => {
        if (transaction.type === "INCOME") {
          acc.income += transaction.amount;
        } else {
          acc.expense += transaction.amount;
        }
        return acc;
      },
      { income: 0, expense: 0 }
    );

    const htmlContent = generateHTMLTemplate(transactions, totals, {
      name: user.name,
      email: user.email,
    });
    const pdfBuffer = await generatePDF(htmlContent);

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=SpendPath_transactions.pdf",
        "Content-Length": pdfBuffer.length.toString(),
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Error generating account report PDF:", error);
    return NextResponse.json(
      { message: "Error generating PDF" },
      { status: 500 }
    );
  }
}
