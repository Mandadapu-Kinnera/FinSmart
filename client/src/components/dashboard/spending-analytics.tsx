import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, TooltipProps } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { Transaction } from "@shared/schema";
import { BarChart3, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Filter periods
type Period = "30" | "90" | "180" | "365";

export default function SpendingAnalytics() {
  const [period, setPeriod] = useState<Period>("30");
  
  const { data: transactions, isLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });

  // Process transaction data for the chart
  const processTransactions = () => {
    if (!transactions) return [];
    
    const now = new Date();
    const periodStartDate = new Date();
    periodStartDate.setDate(now.getDate() - parseInt(period));
    
    // Filter transactions for the selected period
    const filteredTransactions = transactions.filter(
      t => new Date(t.date) >= periodStartDate
    );
    
    // Group transactions by date
    const transactionsByDate = filteredTransactions.reduce<Record<string, { income: number; spending: number }>>((acc, transaction) => {
      const date = new Date(transaction.date).toISOString().split("T")[0];
      
      if (!acc[date]) {
        acc[date] = { income: 0, spending: 0 };
      }
      
      if (transaction.isExpense) {
        acc[date].spending += transaction.amount;
      } else {
        acc[date].income += transaction.amount;
      }
      
      return acc;
    }, {});
    
    // Fill in missing dates and sort by date
    const dates: string[] = [];
    const currentDate = new Date(periodStartDate);
    
    while (currentDate <= now) {
      dates.push(currentDate.toISOString().split("T")[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Generate the chart data array
    return dates.map(date => {
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const displayDate = new Date(date);
      const formattedDate = `${monthNames[displayDate.getMonth()]} ${displayDate.getDate()}`;
      
      return {
        date: formattedDate,
        income: transactionsByDate[date]?.income || 0,
        spending: transactionsByDate[date]?.spending || 0
      };
    });
  };

  const chartData = processTransactions();

  // If no transactions, use demo data
  const demoData = [
    { date: "Jun 15", income: 3500, spending: 2100 },
    { date: "Jun 30", income: 3700, spending: 2300 },
    { date: "Jul 15", income: 3600, spending: 2200 },
    { date: "Jul 30", income: 3850, spending: 2400 },
    { date: "Aug 15", income: 3800, spending: 2150 },
    { date: "Aug 30", income: 3850, spending: 2250 },
    { date: "Sep 15", income: 3850, spending: 2254 },
  ];

  const data = chartData.length > 0 ? chartData : demoData;

  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 shadow-sm rounded-md">
          <p className="font-medium text-gray-900">{label}</p>
          <p className="text-green-600">
            Income: ${payload[0].value?.toFixed(2)}
          </p>
          <p className="text-red-600">
            Expenses: ${payload[1].value?.toFixed(2)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-primary" />
            Spending Analytics
          </CardTitle>
          <Select
            value={period}
            onValueChange={(value) => setPeriod(value as Period)}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30">Last 30 Days</SelectItem>
              <SelectItem value="90">Last 90 Days</SelectItem>
              <SelectItem value="180">Last 6 Months</SelectItem>
              <SelectItem value="365">This Year</SelectItem>
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
              <LineChart
                data={data}
                margin={{
                  top: 10,
                  right: 20,
                  left: 0,
                  bottom: 0,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#64748b' }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="income"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ r: 0 }}
                  activeDot={{ r: 4 }}
                  name="Income"
                />
                <Line
                  type="monotone"
                  dataKey="spending"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={{ r: 0 }}
                  activeDot={{ r: 4 }}
                  name="Expenses"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
