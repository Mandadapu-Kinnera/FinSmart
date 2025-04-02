import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from "recharts";
import { Transaction } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

// Colors for the charts
const COLORS = {
  income: "#4ade80", // green-400
  expense: "#f87171", // red-400
  savings: "#60a5fa", // blue-400
  investment: "#a78bfa", // purple-400
  other: "#fbbf24", // amber-400
};

const PIE_COLORS = [
  "#4ade80", // green-400
  "#f87171", // red-400
  "#60a5fa", // blue-400
  "#a78bfa", // purple-400
  "#fbbf24", // amber-400
  "#a3e635", // lime-400
  "#fb923c", // orange-400
  "#38bdf8", // sky-400
  "#2dd4bf", // teal-400
  "#e879f9", // fuchsia-400
];

type Period = "week" | "month" | "year";

export default function IncomeExpenseGraph() {
  const [period, setPeriod] = useState<Period>("month");
  
  const { data: transactions, isLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });
  
  if (isLoading) {
    return (
      <Card className="col-span-full">
        <CardContent className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }
  
  if (!transactions || transactions.length === 0) {
    return (
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Income vs. Expenses</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center min-h-[300px] text-gray-500">
          <p>No transaction data available</p>
          <p className="text-sm mt-2">Add some transactions to see your financial patterns</p>
        </CardContent>
      </Card>
    );
  }
  
  // Filter transactions based on selected period
  const filteredTransactions = filterTransactionsByPeriod(transactions, period);
  
  // Calculate summary data
  const summary = getSummaryData(filteredTransactions);
  
  // Prepare data for line/bar chart (income vs expenses over time)
  const timeSeriesData = getTimeSeriesData(filteredTransactions, period);
  
  // Prepare data for pie charts (category breakdowns)
  const incomeCategoryData = getCategoryBreakdown(
    filteredTransactions.filter(t => t.type === "income")
  );
  
  const expenseCategoryData = getCategoryBreakdown(
    filteredTransactions.filter(t => t.type === "expense")
  );
  
  return (
    <Card className="col-span-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Income vs. Expenses</CardTitle>
        <Tabs defaultValue={period} onValueChange={(v) => setPeriod(v as Period)}>
          <TabsList>
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="month">Month</TabsTrigger>
            <TabsTrigger value="year">Year</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-2 md:col-span-3 mb-6">
            <SummaryCard 
              title="Total Income" 
              amount={summary.totalIncome} 
              change={calculatePercentageChange(summary.previousIncome, summary.totalIncome)}
              type="income"
            />
            <SummaryCard 
              title="Total Expenses" 
              amount={summary.totalExpenses} 
              change={calculatePercentageChange(summary.previousExpenses, summary.totalExpenses)}
              type="expense"
            />
            <SummaryCard 
              title="Net Savings" 
              amount={summary.netSavings} 
              change={calculatePercentageChange(summary.previousSavings, summary.netSavings)}
              type="savings"
            />
          </div>
          
          {/* Time Series Chart */}
          <div className="md:col-span-2">
            <h3 className="text-base font-medium mb-4">Income & Expenses over Time</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={timeSeriesData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
                <Legend />
                <Bar dataKey="income" name="Income" fill={COLORS.income} />
                <Bar dataKey="expense" name="Expenses" fill={COLORS.expense} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          {/* Pie Charts */}
          <div>
            <h3 className="text-base font-medium mb-4">Breakdown by Category</h3>
            <Tabs defaultValue="expense">
              <TabsList className="mb-4">
                <TabsTrigger value="expense">Expenses</TabsTrigger>
                <TabsTrigger value="income">Income</TabsTrigger>
              </TabsList>
              <TabsContent value="expense" className="mt-0">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={expenseCategoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={renderCustomizedLabel}
                    >
                      {expenseCategoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </TabsContent>
              <TabsContent value="income" className="mt-0">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={incomeCategoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={renderCustomizedLabel}
                    >
                      {incomeCategoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Helper function to filter transactions by period
function filterTransactionsByPeriod(transactions: Transaction[], period: Period): Transaction[] {
  const now = new Date();
  let cutoffDate = new Date();
  
  switch (period) {
    case "week":
      cutoffDate.setDate(now.getDate() - 7);
      break;
    case "month":
      cutoffDate.setMonth(now.getMonth() - 1);
      break;
    case "year":
      cutoffDate.setFullYear(now.getFullYear() - 1);
      break;
  }
  
  return transactions.filter(t => {
    if (!t.date) return false;
    const transactionDate = new Date(t.date);
    return transactionDate >= cutoffDate;
  });
}

// Helper function to get summary data
function getSummaryData(transactions: Transaction[]) {
  const now = new Date();
  const previousPeriodStart = new Date();
  previousPeriodStart.setMonth(now.getMonth() - 2);
  const currentPeriodStart = new Date();
  currentPeriodStart.setMonth(now.getMonth() - 1);
  
  const previousPeriodTransactions = transactions.filter(t => {
    if (!t.date) return false;
    const transactionDate = new Date(t.date);
    return transactionDate >= previousPeriodStart && transactionDate < currentPeriodStart;
  });
  
  const currentPeriodTransactions = transactions.filter(t => {
    if (!t.date) return false;
    const transactionDate = new Date(t.date);
    return transactionDate >= currentPeriodStart;
  });
  
  const totalIncome = currentPeriodTransactions
    .filter(t => t.type === "income" || (t.isExpense !== null && !t.isExpense))
    .reduce((sum, t) => sum + t.amount, 0);
    
  const totalExpenses = currentPeriodTransactions
    .filter(t => t.type === "expense" || (t.isExpense !== null && t.isExpense))
    .reduce((sum, t) => sum + t.amount, 0);
    
  const previousIncome = previousPeriodTransactions
    .filter(t => t.type === "income" || (t.isExpense !== null && !t.isExpense))
    .reduce((sum, t) => sum + t.amount, 0);
    
  const previousExpenses = previousPeriodTransactions
    .filter(t => t.type === "expense" || (t.isExpense !== null && t.isExpense))
    .reduce((sum, t) => sum + t.amount, 0);
  
  return {
    totalIncome,
    totalExpenses,
    netSavings: totalIncome - totalExpenses,
    previousIncome,
    previousExpenses,
    previousSavings: previousIncome - previousExpenses
  };
}

// Helper function to get time series data
function getTimeSeriesData(transactions: Transaction[], period: Period) {
  const result: { date: string; income: number; expense: number }[] = [];
  const dateFormat = period === "year" ? "MMM" : period === "month" ? "MMM D" : "ddd";
  
  // Create a map of dates to aggregate values
  const dateMap = new Map<string, { income: number; expense: number }>();
  
  // Initialize with dates for the given period
  const now = new Date();
  let current = new Date();
  
  switch (period) {
    case "week":
      current.setDate(now.getDate() - 7);
      break;
    case "month":
      current.setDate(now.getDate() - 30);
      break;
    case "year":
      current.setMonth(now.getMonth() - 11);
      break;
  }
  
  while (current <= now) {
    const dateKey = formatDate(current, dateFormat);
    dateMap.set(dateKey, { income: 0, expense: 0 });
    
    switch (period) {
      case "week":
        current.setDate(current.getDate() + 1);
        break;
      case "month":
        current.setDate(current.getDate() + 3); // Show every 3 days for a month
        break;
      case "year":
        current.setMonth(current.getMonth() + 1);
        break;
    }
  }
  
  // Aggregate transaction data
  transactions.forEach(transaction => {
    if (!transaction.date) return;
    
    // Safely create a date object
    let date: Date;
    try {
      date = new Date(transaction.date);
      // Check if date is valid
      if (isNaN(date.getTime())) return;
    } catch (error) {
      return; // Skip this transaction if date parsing fails
    }
    
    const dateKey = formatDate(date, dateFormat);
    
    if (dateMap.has(dateKey)) {
      const entry = dateMap.get(dateKey)!;
      
      if (transaction.type === "income" || (transaction.isExpense !== null && !transaction.isExpense)) {
        entry.income += transaction.amount;
      } else {
        entry.expense += transaction.amount;
      }
      
      dateMap.set(dateKey, entry);
    }
  });
  
  // Convert map to array
  dateMap.forEach((value, key) => {
    result.push({
      date: key,
      income: value.income,
      expense: value.expense
    });
  });
  
  return result.sort((a, b) => {
    // Custom sorting based on period
    if (period === "week") {
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      return days.indexOf(a.date.substring(0, 3)) - days.indexOf(b.date.substring(0, 3));
    }
    // For month and year, let's assume the data is already in chronological order
    return 0;
  });
}

// Helper function to get category breakdown
function getCategoryBreakdown(transactions: Transaction[]) {
  const categoryMap = new Map<string, number>();
  
  transactions.forEach(transaction => {
    // Handle null categoryId
    const categoryId = transaction.categoryId || 0;
    const categoryName = categoryId.toString(); // In a real app, you'd get the category name
    const currentAmount = categoryMap.get(categoryName) || 0;
    categoryMap.set(categoryName, currentAmount + transaction.amount);
  });
  
  const result: { name: string; value: number }[] = [];
  categoryMap.forEach((value, key) => {
    result.push({
      name: key,
      value: value
    });
  });
  
  return result;
}

// Helper function to calculate percentage change
function calculatePercentageChange(previous: number, current: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

// Helper function to format currency
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount);
}

// Helper function to format dates
function formatDate(date: Date, format: string): string {
  const options: Intl.DateTimeFormatOptions = {};
  
  if (format.includes("MMM")) {
    options.month = "short";
  }
  
  if (format.includes("D")) {
    options.day = "numeric";
  }
  
  if (format.includes("ddd")) {
    options.weekday = "short";
  }
  
  return new Intl.DateTimeFormat('en-US', options).format(date);
}

// Custom label renderer for pie chart
const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent
}: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

// Summary Card component
function SummaryCard({
  title,
  amount,
  change,
  type
}: {
  title: string;
  amount: number;
  change: number;
  type: "income" | "expense" | "savings";
}) {
  let bgColor, textColor, changeColor;
  
  if (type === "income") {
    bgColor = "bg-green-50";
    textColor = "text-green-700";
  } else if (type === "expense") {
    bgColor = "bg-red-50";
    textColor = "text-red-700";
  } else {
    bgColor = "bg-blue-50";
    textColor = "text-blue-700";
  }
  
  changeColor = change >= 0 ? "text-green-600" : "text-red-600";
  
  return (
    <div className={`${bgColor} p-4 rounded-lg`}>
      <h4 className="text-sm font-medium text-gray-500">{title}</h4>
      <p className={`text-2xl font-bold ${textColor} mt-1`}>{formatCurrency(amount)}</p>
      <div className="flex items-center mt-2">
        <span className={`text-xs font-medium ${changeColor}`}>
          {change >= 0 ? "+" : ""}{change.toFixed(1)}%
        </span>
        <span className="text-xs text-gray-500 ml-1">vs. previous</span>
      </div>
    </div>
  );
}