"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import React, { useState } from "react";

const DashboardOverview = ({ accounts, transactions }) => {
  const [selectedAccountId, setSelectedAccountId] = useState(
    accounts?.find((a) => a.isDefault)?.id || accounts[0]?.id
  );

  // Filter transactions by selected account
  const accountTransactions = transactions.filter(
    (t) => t.accountId === selectedAccountId
  );

  const recentTransactions = accountTransactions.slice(0, 5);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader className="flex flex-row justify-between items-center space-y-0 pb-4">
          <CardTitle className="text-base font-normal"> 
            Recent Transactions
          </CardTitle>
          <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
                <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Select Account" />
                </SelectTrigger>
                <SelectContent>
                    {
                        accounts.map((account)=>(
                            <SelectItem key={account.id} value={account.id}>
                                {account.name}
                            </SelectItem>
                        ))
                    }
                   
                </SelectContent>
           </Select>
          
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
                {recentTransactions.length ===0 ? (
                    <p className="text-center text-muted-foreground py-4">
                        No recent transactions
                    </p>
                ):(
                    recentTransactions.map((transaction)=>{
                        return(
                            <div key={transaction.id} className="flex justify-between items-center">

                                <div className="space-y-1">
                                    <p className="text-sm font-medium leading-none">
                                        {transaction.description || "Untitled Transaction"}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {format(new Date(transaction.date), "PP")}
                                    </p>

                                </div>

                                <div className="flex items-center gap-2">
                                    <div className={cn(
                                        "flex items-center",
                                        transaction.type === "EXPENSE" ? "text-red-500" : "text-green-500"
                                    )}
                                    >
                                        {transaction.type === "EXPENSE" ? (
                                            <ArrowDownRight className="mr-1 h-4 w-4"/>
                                        ):(
                                            <ArrowUpRight className=" mr-1 h-4 w-4"/>
                                        )}
                                        <p className="text-sm font-medium">
                                            ₹{transaction.amount.toFixed(2)}
                                        </p>
                                        
                                    </div>
                                </div>
                            </div>
                        )              
                    })
                )}
          </div>
        </CardContent>
      
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
      
        </CardHeader>
        <CardContent>
          <p>Card Content</p>
        </CardContent>
       
      </Card>
    </div>
  );
};

export default DashboardOverview;
