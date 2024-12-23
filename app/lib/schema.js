import {z} from "zod"

export const accountShema= z.object({
    name: z.string().min(1, "Name is required"),
    type: z.enum(["SAVINGS", "CURRENT"]),
    balance: z.string().min(1, "Initial balance is required"),
    isDefault: z.boolean().default(false),
    
})