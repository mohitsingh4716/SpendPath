"use client"
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { categoryColors } from "@/data/categories";

import { format, set } from "date-fns";
import { ChevronDown, ChevronUp, Clock, MoreHorizontal, RefreshCw, SearchIcon, Trash, X } from "lucide-react";
import { useRouter } from "next/navigation";

import React, { useMemo, useState } from "react";


const RECURRING_INTERVALS = {
  DAILY: "Daily",
  WEEKLY: "Weekly",
  MONTHLY: "Monthly",
  YEARLY: "Yearly",
};

const TransactionTable = ({ transactions }) => {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState([]);
  const [sortConfig, setSortConfig] = useState({
    field:"date",
    direction:"desc",
  })

  // console.log(selectedIds);

  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [recurringFilter, setRecurringFilter] = useState("");
 
  const filteredAndSortedTransactions = useMemo(()=>{
    let result = [...transactions];

    // Apply search filter
    if(searchTerm){
      const searchLower= searchTerm.toLowerCase();
      result= result.filter((transaction)=>
        transaction.description.toLowerCase().includes(searchLower)
      );
    }

    // Apply rescurring filter
    if(recurringFilter){
      result= result.filter((transaction)=>{
        if(recurringFilter === "recurring") return transaction.isRecurring;
        return !transaction.isRecurring;
      })
    }

    // Apply type filter
    if(typeFilter){
      result= result.filter((transaction)=> transaction.type === typeFilter);
    }

    // Apply sorting
    result.sort((a,b)=>{
      let comp=0;
      switch(sortConfig.field){
        case "date":
          comp= new Date(a.date) - new Date(b.date);
          break;

        case "amount":
          comp= a.amount - b.amount;
          break;
          
        case "category" :
          comp= a.category.localeCompare(b.category);
          break;
        
        default : comp= 0;
      }

      return sortConfig.direction === "asc" ? comp : - comp;
    });




    return result;

  },[
    transactions,
    searchTerm,
    typeFilter,
    recurringFilter,
    sortConfig
  ]);

  const handleSort = (field) => {
    setSortConfig((current)=>({
      field,
      direction: current.field == field && current.direction === "asc" ? "desc" : "asc"

    }));
  };

  const handleSelect = (id)=>{
    setSelectedIds((current)=>
     (current.includes(id))?
        current.filter((item)=> item !== id) :
       [...current, id]
    )

  }

  const handleSelectAll = ()=>{
    setSelectedIds((current)=>{
    if(current.length === filteredAndSortedTransactions.length){
      return [];
    } else{
      return filteredAndSortedTransactions.map((t)=> t.id)
    }}
  )
    
  }

  const handleBulkDelete=()=>{

  }

  const handleClearFilter= ()=>{
    setSearchTerm("");
    setTypeFilter("");
    setRecurringFilter("");
    setSelectedIds([]);

  }

  return (
    <div className="space-y-4 ">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground"/>
          <Input 
            className="pl-8"
            placeholder="Search transaction..."
            value={searchTerm}
            onChange={(e)=>setSearchTerm(e.target.value)}
            
          
          />
        </div>

        <div className="flex gap-2">
        <Select value={typeFilter} onValueChange={setTypeFilter}>  
            <SelectTrigger>
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="INCOME">Income</SelectItem>
              <SelectItem value="EXPENSE">Expense</SelectItem>
             
            </SelectContent>
        </Select>

        <Select value={recurringFilter} onValueChange={(value)=>setRecurringFilter(value)}>  
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All Transactions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recurring">Recurring Only</SelectItem>
              <SelectItem value="non-recurring">Non-recurring Only</SelectItem>
             
            </SelectContent>
        </Select>

        {selectedIds.length >0 && (
         <div> 
          <Button
            variant="destructive"
            size="sm"
            onClick={handleBulkDelete}
          >
            <Trash className="h-4 w-4 mr-2"/>
            Delete Selected ({selectedIds.length})
          </Button>
        </div>
        )}

        {(searchTerm || typeFilter || recurringFilter) && (
          <Button 
          variant="outline" 
          size="icon" 
          onClick={handleClearFilter}
          title="Clear Filters"
          >
            <X className="h-4 w-4"/>
          </Button>
        )}
        </div>
        
      </div>

      {/* Transactions */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox onCheckedChange={handleSelectAll}
                   checked= {
                   ( selectedIds.length === 
                    filteredAndSortedTransactions.length) &&
                    filteredAndSortedTransactions.length > 0
                   }
                />
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("date")}
              >
                <div className="flex items-center">
                  Date{" "}
                  {sortConfig.field === "date" && (
                    sortConfig.direction === "asc" ? (
                      <ChevronUp className="h-4 w-4 ml-1"/>
                    ): (
                      <ChevronDown className="h-4 w-4 ml-1"/>
                    )
                  )}

                </div>
               
              </TableHead>
              <TableHead>
                Description
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("category")}
              >
                <div className="flex items-center">
                  Category
                  {sortConfig.field === "category" && (
                    sortConfig.direction === "asc" ? (
                      <ChevronUp className="h-4 w-4 ml-1"/>
                    ): (
                      <ChevronDown className="h-4 w-4 ml-1"/>
                    )
                  )}
                  </div>
               
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("amount")}
              >
                <div className="flex items-center justify-end">
                  Amount
                  {sortConfig.field === "amount" && (
                    sortConfig.direction === "asc" ? (
                      <ChevronUp className="h-4 w-4 ml-1"/>
                    ): (
                      <ChevronDown className="h-4 w-4 ml-1"/>
                    )
                  )}
                  
                  </div>
               
              </TableHead>
              <TableHead>Recurring</TableHead>
              <TableHead className="w-[50px]"/>

            </TableRow>
          </TableHeader>
          <TableBody>
              {filteredAndSortedTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    No Transactions Found
                  </TableCell>
                </TableRow>
              ):(
                filteredAndSortedTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      <Checkbox  onCheckedChange={()=> handleSelect(transaction.id)}
                        checked= {selectedIds.includes(transaction.id)}/>
                    </TableCell>
                    <TableCell>{format(transaction.date, "PP")}</TableCell>
                    <TableCell>{transaction.description}</TableCell>

                    <TableCell className="capitalize">
                      <span
                        style={{background: categoryColors[transaction.category]}}
                        className="px-2 py-1 rounded text-white text-sm"
                      >
                         {transaction.category}
                      </span>
                    </TableCell>

                    <TableCell className="text-right font-medium"
                        style={{color: transaction.type === "INCOME" ? "green" : "red"}}>
                      {transaction.type === "INCOME" ? "+" : "-"}  ₹ {transaction.amount.toFixed(2)}
                    </TableCell>
                    <TableCell>
                    {transaction.isRecurring ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Badge
                              variant="secondary"
                              className="gap-1 bg-purple-100 text-purple-700 hover:bg-purple-200"
                            >
                              <RefreshCw className="h-3 w-3" />
                              {
                                RECURRING_INTERVALS[
                                  transaction.recurringInterval
                                ]
                              }
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="text-sm">
                              <div className="font-medium">Next Date:</div>
                              <div>
                                {format(
                                  new Date(transaction.nextRecurringDate),
                                  "PPP"
                                )}
                              </div>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ):(
                        <Badge variant="outline" className="gap-1">
                          <Clock className="w-3 h-3"/>
                          One-time
                        </Badge>
                      )}

                    </TableCell>
                    <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() =>
                            router.push(
                              `/transaction/create?edit=${transaction.id}`
                            )
                          }
                        >
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          // onClick={() => deleteFn([transaction.id])}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                  </TableRow>
                ))
              )}

          
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default TransactionTable;
