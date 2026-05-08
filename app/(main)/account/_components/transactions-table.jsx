"use client"
import { bulkDeleteTransactions } from "@/actions/accounts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { categoryColors } from "@/data/categories";
import useFetch from "@/hooks/use-fetch";

import { format } from "date-fns";
import { ChevronDown, ChevronUp, Clock, MoreHorizontal, RefreshCw, SearchIcon, Trash, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import React, { useEffect, useMemo, useState, useTransition } from "react";
import { BarLoader } from "react-spinners";
import { toast } from "sonner";


const RECURRING_INTERVALS = {
  DAILY: "Daily",
  WEEKLY: "Weekly",
  MONTHLY: "Monthly",
  YEARLY: "Yearly",
};

const TransactionTable = ({ transactions = [], pagination }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [selectedIds, setSelectedIds] = useState([]);
  const [sortConfig, setSortConfig] = useState(() => ({
    field: searchParams.get("sort") || "date",
    direction: searchParams.get("direction") || "desc",
  }));
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const typeFilter = searchParams.get("type") || "";
  const recurringFilter = searchParams.get("recurring") || "";


  useEffect(() => {
    setSearchTerm(searchParams.get("search") || "");
    setSortConfig({
      field: searchParams.get("sort") || "date",
      direction: searchParams.get("direction") || "desc",
    });
  }, [searchParams]);

  const updateQuery = (updates) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (!value || value === "all") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    if (!Object.prototype.hasOwnProperty.call(updates, "page")) {
      params.set("page", "1");
    }

    const queryString = params.toString();
    startTransition(() => {
      router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
    });
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      updateQuery({ search: searchTerm.trim() });
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const pageTransactions = useMemo(() => transactions, [transactions]);

  useEffect(() => {
    setSelectedIds([]);
  }, [transactions]);

  const handleSort = (field) => {
    const nextConfig = {
      field,
      direction: sortConfig.field === field && sortConfig.direction === "asc" ? "desc" : "asc",
    };
    setSortConfig(nextConfig);
    updateQuery({ sort: nextConfig.field, direction: nextConfig.direction });
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
    if(current.length === pageTransactions.length){
      return [];
    } else{
      return pageTransactions.map((t)=> t.id)
    }}
  )
    
  }

  const {
    loading: deleteLoading,
    fn: deleteFn,
    data: deleted,
  }= useFetch(bulkDeleteTransactions);
  

  const handleBulkDelete=async ()=>{
     if(
      !window.confirm(
        `Are you sure you want to delete ${selectedIds.length} transactions?`
      )
     ){
      return ;
     }
     await deleteFn(selectedIds);
  }

  useEffect(()=>{
    if(deleted && !deleteLoading){
      toast.error("Transactions Deleted Successfully");
      router.refresh();
    }
  },[deleted, deleteLoading]);

  const handleClearFilter= ()=>{
    setSearchTerm("");
    setSelectedIds([]);
    updateQuery({
      search: "",
      type: "",
      recurring: "",
      page: "1",
    });

  }

  const handleTypeFilter = (value) => {
    updateQuery({ type: value });
  };

  const handleRecurringFilter = (value) => {
    updateQuery({ recurring: value });
  };

  const handlePageChange = (nextPage) => {
    updateQuery({ page: String(nextPage) });
  };

  return (
    <div className="space-y-4 ">
      {deleteLoading && <BarLoader className="mt-4" width={"100%"} color="#9333ea"/>}
      {isPending && <BarLoader className="mt-4" width={"100%"} color="#9333ea"/>}
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
        <Select value={typeFilter || "all"} onValueChange={handleTypeFilter}>  
            <SelectTrigger>
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="INCOME">Income</SelectItem>
              <SelectItem value="EXPENSE">Expense</SelectItem>
             
            </SelectContent>
        </Select>

        <Select value={recurringFilter || "all"} onValueChange={handleRecurringFilter}>  
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All Transactions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Transactions</SelectItem>
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

        {(searchTerm || typeFilter || recurringFilter ) && (
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
                    pageTransactions.length) &&
                    pageTransactions.length > 0
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
              {pageTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    No Transactions Found
                  </TableCell>
                </TableRow>
              ):(
                pageTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      <Checkbox  onCheckedChange={()=> handleSelect(transaction.id)}
                        checked= {selectedIds.includes(transaction.id)}/>
                    </TableCell>
                    <TableCell>{format(new Date(transaction.date), "PP")}</TableCell>
                    <TableCell>{transaction.description || "Untitled Transaction"}</TableCell>

                    <TableCell className="capitalize">
                      <span
                        style={{background: categoryColors[transaction.category] || "#6b7280"}}
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
                                  new Date(transaction.nextRecurringDate || transaction.date),
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
                          onClick={async () => {
                            await deleteFn([transaction.id]);
                            router.refresh();
                          }}
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Page {pagination?.page || 1} of {pagination?.totalPages || 1}
          {typeof pagination?.totalCount === "number" ? ` (${pagination.totalCount} transactions)` : ""}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange((pagination?.page || 1) - 1)}
            disabled={!pagination?.hasPreviousPage || isPending || deleteLoading}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange((pagination?.page || 1) + 1)}
            disabled={!pagination?.hasNextPage || isPending || deleteLoading}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TransactionTable;
