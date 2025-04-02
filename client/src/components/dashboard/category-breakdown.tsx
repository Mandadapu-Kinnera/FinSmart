import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, TooltipProps } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { Transaction, Category } from "@shared/schema";
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Time period options
type Period = "this-month" | "last-month" | "3-months" | "6-months" | "year";

export default function CategoryBreakdown() {
  const [period, setPeriod] = useState<Period>("this-month");
  
  const { data: transactions, isLoading: transactionsLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });
  
  const { data: categories, isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  // Process data for the chart
  const processData = () => {
    if (!transactions || !categories) return [];
    
    const now = new Date();
    let startDate = new Date();
    
    // Set the start date based on the selected period
    switch (period) {
      case "this-month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case "last-month":
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        break;
      case "3-months":
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        break;
      case "6-months":
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1);
        break;
      case "year":
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
    }
    
    // Filter transactions by date and only expenses
    const filteredTransactions = transactions.filter(
      t => new Date(t.date) >= startDate && t.isExpense
    );
    
    // Group expenses by category
    const expensesByCategory: Record<number, number> = {};
    
    filteredTransactions.forEach(transaction => {
      if (transaction.categoryId) {
        if (!expensesByCategory[transaction.categoryId]) {
          expensesByCategory[transaction.categoryId] = 0;
        }
        expensesByCategory[transaction.categoryId] += transaction.amount;
      }
    });
    
    // Convert to chart data format
    return Object.entries(expensesByCategory).map(([categoryId, amount]) => {
      const category = categories.find(c => c.id === parseInt(categoryId));
      return {
        name: category?.name || "Uncategorized",
        value: amount,
        color: category?.color || "#6B7280"
      };
    }).sort((a, b) => b.value - a.value);
  };

  const chartData = processData();

  // If no data, use demo data
  const demoData = [
    { name: "Housing", value: 1200, color: "#3B82F6" },
    { name: "Food", value: 450, color: "#10B981" },
    { name: "Transportation", value: 350, color: "#F59E0B" },
    { name: "Entertainment", value: 200, color: "#8B5CF6" },
    { name: "Utilities", value: 180, color: "#EC4899" },
    { name: "Other", value: 150, color: "#6B7280" }
  ];

  const data = chartData.length > 0 ? chartData : demoData;

  // Calculate total amount
  const totalAmount = data.reduce((sum, item) => sum + item.value, 0);

  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = ((data.value / totalAmount) * 100).toFixed(1);
      
      return (
        <div className="bg-white p-3 border border-gray-200 shadow-sm rounded-md">
          <p className="font-medium text-gray-900">{data.name}</p>
          <p className="text-gray-700">
            ${data.value.toFixed(2)} ({percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  const isLoading = transactionsLoading || categoriesLoading;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold">
            Category Breakdown
          </CardTitle>
          <Select
            value={period}
            onValueChange={(value) => setPeriod(value as Period)}
          >
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="this-month">This Month</SelectItem>
              <SelectItem value="last-month">Last Month</SelectItem>
              <SelectItem value="3-months">Last 3 Months</SelectItem>
              <SelectItem value="6-months">Last 6 Months</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-64 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  labelLine={false}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
