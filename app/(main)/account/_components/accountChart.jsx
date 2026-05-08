"use client";
import { getAccountChartData } from "@/actions/accounts";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { Download } from "lucide-react";
import React, { useEffect, useMemo, useState, useTransition } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

const DATE_RANGES = {
  "7D": { label: "Last 7 Days", days: 7 },
  "1M": { label: "Last 1 Month", days: 30 },
  "3M": { label: "Last 3 Months", days: 90 },
  "6M": { label: "Last 6 Months", days: 180 },
  All: { label: "All Time", days: null },
};

const AccountChart = ({ accountId, initialTransactions }) => {
  const [dateRange, setDateRange] = useState("1M");
  const [transactions, setTransactions] = useState(initialTransactions || []);
  const [mounted, setMounted] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    startTransition(async () => {
      try {
        const nextTransactions = await getAccountChartData(accountId, dateRange);
        setTransactions(nextTransactions || []);
      } catch (error) {
        console.error("Failed to load chart data:", error);
        setTransactions([]);
      }
    });
  }, [accountId, dateRange, mounted]);

  const filterData = useMemo(() => {
    const grouped = transactions.reduce((acc, transaction) => {
      const transactionDate = new Date(transaction.date);
      if (Number.isNaN(transactionDate.getTime())) return acc;

      const dateKey = format(transactionDate, "yyyy-MM-dd");
      const date = format(transactionDate, "MMM dd");

      if (!acc[dateKey]) {
        acc[dateKey] = { date, dateKey, income: 0, expense: 0 };
      }

      if (transaction.type === "INCOME") {
        acc[dateKey].income += transaction.amount || 0;
      } else {
        acc[dateKey].expense += transaction.amount || 0;
      }
      return acc;
    }, {});

    // convert the data to array sort by date
    return Object.values(grouped).sort(
      (a, b) => new Date(a.dateKey) - new Date(b.dateKey)
    );
  }, [transactions]);

  //   console.log(filterData);

  const totals = useMemo(() => {
    return filterData.reduce(
      (acc, day) => ({
        income: acc.income + day.income,
        expense: acc.expense + day.expense,
      }),
      { income: 0, expense: 0 }
    );
  }, [filterData]);

  //  console.log(totals);

  const handleDownloadPDF = async () => {
    setIsDownloading(true);

    try {
      const response = await fetch(
        `/api/accounts/${accountId}/report?range=${encodeURIComponent(dateRange)}`
      );

      if (!response.ok) {
        throw new Error("Failed to generate PDF");
      }

      const pdfBlob = await response.blob();
      const pdfUrl = URL.createObjectURL(pdfBlob);

      const link = document.createElement("a");
      link.href = pdfUrl;
      link.download = "SpendPath_transactions.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(pdfUrl);
    } catch (error) {
      console.error("PDF download failed:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
        <CardTitle className="text-base font-normal">
          Transactions Overview
        </CardTitle>
      <div className="flex items-center gap-2">
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Select Range" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(DATE_RANGES).map(([key, { label }]) => {
              return (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>

        {/* Download pdf of Transactions */}
        <Button variant="outline" onClick={handleDownloadPDF} disabled={isDownloading}>
          <Download className="h-6 w-6"/>
          {isDownloading ? "Preparing..." : "Download PDF"}
        </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex justify-around mb-6 text-sm">
          <div className="text-center">
            <p className="text-muted-foreground">Total Income</p>
            <p className="text-sm md:text-lg font-bold text-green-500">
              ₹ {totals.income.toFixed(2)}
            </p>
          </div>

          <div className="text-center">
            <p className="text-muted-foreground">Total Expenses</p>
            <p className="text-sm md:text-lg font-bold text-red-500">
              ₹ {totals.expense.toFixed(2)}
            </p>
          </div>

          <div className="text-center">
            <p className="text-muted-foreground">Net</p>
            <p
              className={`text-sm md:text-lg font-bold ${
                totals.income - totals.expense >= 0
                  ? "text-green-500"
                  : "text-red-500"
              }`}
            >
              {" "}
              ₹ {(totals.income - totals.expense).toFixed(2)}
            </p>
          </div>
        </div>

        <div className="h-[300px]">
          {!mounted || isPending ? (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Loading chart...
            </div>
          ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={filterData}
              margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="date"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `₹${value}`}
              />
              <Tooltip
                formatter={(value) => [`₹ ${value}`, undefined]}
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)",
                }}
              />
              <Legend />
              <Bar
                dataKey="income"
                name="Income"
                fill="#22c55e"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="expense"
                name="Expense"
                fill="#ef4444"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AccountChart;
