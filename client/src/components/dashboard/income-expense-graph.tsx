import { useQuery } from "@tanstack/react-query";
import { Transaction, Bill, Budget } from "@shared/schema";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { formatCurrency } from "@/lib/currency";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

// For pie chart colors
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1'];

export function IncomeExpenseGraph() {
  const [period, setPeriod] = useState<'weekly' | 'monthly' | 'yearly'>('monthly');
  
  // Fetch all required data
  const { data: transactions, isLoading: transactionsLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });
  
  const { data: bills, isLoading: billsLoading } = useQuery<Bill[]>({
    queryKey: ["/api/bills"],
  });
  
  const { data: budgets, isLoading: budgetsLoading } = useQuery<Budget[]>({
    queryKey: ["/api/budgets"],
  });
  
  // Check if data is loading
  const isLoading = transactionsLoading || billsLoading || budgetsLoading;
  
  // Function to prepare data for charts
  const prepareChartData = () => {
    if (!transactions || !bills || !budgets) return { barData: [], pieData: [] };
    
    // Filter transactions based on the selected period
    const filteredTransactions = filterDataByPeriod(transactions);
    
    // Calculate totals for income and expenses
    const income = filteredTransactions
      .filter(t => !t.isExpense)
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = filteredTransactions
      .filter(t => t.isExpense)
      .reduce((sum, t) => sum + t.amount, 0);
    
    // Calculate total bills amount
    const billsTotal = bills.reduce((sum, b) => sum + b.amount, 0);
    
    // Group expenses by category (if available)
    const expensesByCategory: Record<string, number> = {};
    filteredTransactions
      .filter(t => t.isExpense)
      .forEach(t => {
        const category = t.type || 'Other';
        expensesByCategory[category] = (expensesByCategory[category] || 0) + t.amount;
      });
    
    // Prepare data for bar chart (Income vs Expenses overview)
    const barData = [
      { name: 'Income', amount: income },
      { name: 'Expenses', amount: expenses },
      { name: 'Bills', amount: billsTotal },
    ];
    
    // Prepare data for pie chart (Expense breakdown by category)
    const pieData = Object.entries(expensesByCategory).map(([name, value]) => ({
      name,
      value
    }));
    
    // If there are no categorized expenses, create a single entry
    if (pieData.length === 0 && expenses > 0) {
      pieData.push({ name: 'Uncategorized', value: expenses });
    }
    
    return { barData, pieData };
  };
  
  // Filter data based on the selected time period
  const filterDataByPeriod = (data: Transaction[]) => {
    const now = new Date();
    let startDate: Date;
    
    switch(period) {
      case 'weekly':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case 'yearly':
        startDate = new Date(now);
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      case 'monthly':
      default:
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
    }
    
    return data.filter(item => {
      const itemDate = new Date(item.date);
      return itemDate >= startDate && itemDate <= now;
    });
  };
  
  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border shadow-sm rounded-md">
          <p className="font-medium">{label}</p>
          <p className="text-primary">{formatCurrency(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };
  
  // Prepare the chart data
  const { barData, pieData } = prepareChartData();
  
  // Calculate total balance
  const calculateBalance = () => {
    if (!transactions) return 0;
    
    return transactions.reduce((balance, t) => {
      return balance + (t.isExpense ? -t.amount : t.amount);
    }, 0);
  };
  
  const balance = calculateBalance();
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Financial Overview</CardTitle>
            <CardDescription>
              Track your income, expenses, and financial balance
            </CardDescription>
          </div>
          <Select value={period} onValueChange={(value: 'weekly' | 'monthly' | 'yearly') => setPeriod(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">Last 7 days</SelectItem>
              <SelectItem value="monthly">Last 30 days</SelectItem>
              <SelectItem value="yearly">Last 12 months</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-1">Current Balance</h3>
          <p className={`text-3xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(balance)}
          </p>
        </div>
        
        <Tabs defaultValue="bar" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="bar">Income vs Expenses</TabsTrigger>
            <TabsTrigger value="pie">Expense Breakdown</TabsTrigger>
          </TabsList>
          
          <TabsContent value="bar" className="mt-0">
            <div className="w-full h-64">
              {barData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={barData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => `₹${value}`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar 
                      dataKey="amount" 
                      name="Amount" 
                      fill="#4f46e5" 
                      radius={[4, 4, 0, 0]} 
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-gray-500">No transaction data available</p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="pie" className="mt-0">
            <div className="w-full h-64">
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => [formatCurrency(value), 'Amount']} 
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-gray-500">No expense data available</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}