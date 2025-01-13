import {z} from "zod"

export const accountShema= z.object({
    name: z.string().min(1, "Name is required"),
    type: z.enum(["SAVINGS", "CURRENT"]),
    balance: z.string().min(1, "Initial balance is required"),
    isDefault: z.boolean().default(false),
    
})

export const transactionSchema= z.object({
    accountId: z.string().min(1, "Account is required"),
    type: z.enum(["EXPENSE", "INCOME"]),
    amount: z.string().min(1, "Amount is required"),
    date: z.date({required_error: "Date is required"}),
    description: z.string().optional(),
    category: z.string().min(1, "Category is required"),
    isRecurring: z.boolean().default(false),
    recurringInterval: z.enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"]).optional(),
})
.superRefine((data, ctx)=>{
    if(data.isRecurring && !data.recurringInterval){
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Recurring interval is required for recurring transactions",
            path: ["recurringInterval"],
        });
    }
    
})