"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

const serializeTransaction= (obj)=>{
    const serialized= {...obj};

    if(obj.balance){
        serialized.balance= obj.balance.toNumber();
    }
};

export async function createAccount(data){
    try {
        const {userId}= await auth();
        if(!userId){
           throw new Error("Unauthorized")
        }

        const user = await db.findUnique({
            where:{
                clerkUserId: userId
            },
        });
        if(!user){
            throw new Error("user Not found")
        }

        // convert balance to float before saving
        const balanceFloat = parseFloat(data.balance);
        if(isNaN(balance)){
            throw new Error("Invalid balance")
        }

        // check if this is the user's first account
        const existingAccounts = await db.account.findMany({
            where:{
                userId: user.id
            }
        }); 

        const shouldBeDefault= existingAccounts.length === 0 ? true : data.isDefault;

        // if this account should be default, remove default from all other accounts
        if(shouldBeDefault){
            await db.account.updateMany({
                where:{
                    userId: user.id,
                    isDefault: true
                },
                data:{
                    isDefault: false
                }
            });
        }

        const account = await db.account.create({
            data:{
                ...data,
                balance: balanceFloat,
                isDefault: shouldBeDefault,
                userId: user.id
            }
        });

       const serializedAccount =  serializeTransaction(account);

       revalidatePath("/dashboard");
       
       return {
          success: true,
          data: serializedAccount
       };
        
    } catch (error) {
        console.log(error.message)
        throw new Error(error.message);
        
    }
}