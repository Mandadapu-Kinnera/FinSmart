import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { Transaction, Category } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { Eye, ArrowUpRight, Loader2, ShoppingCart, Utensils, FilmIcon, Zap, Car, Building, Music } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export default function RecentTransactions() {
  const { data: transactions, isLoading: transactionsLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });
  
  const { data: categories, isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const isLoading = transactionsLoading || categoriesLoading;

  // Helper function to get transaction icon based on category
  const getTransactionIcon = (categoryId?: number) => {
    if (!categories || !categoryId) return <ShoppingCart className="h-4 w-4" />;
    
    const category = categories.find(c => c.id === categoryId);
    if (!category) return <ShoppingCart className="h-4 w-4" />;
    
    switch (category.icon) {
      case 'utensils':
        return <Utensils className="h-4 w-4" />;
      case 'film':
        return <FilmIcon className="h-4 w-4" />;
      case 'bolt':
        return <Zap className="h-4 w-4" />;
      case 'car':
        return <Car className="h-4 w-4" />;
      case 'home':
        return <Building className="h-4 w-4" />;
      case 'calendar-alt':
        return <Music className="h-4 w-4" />;
      default:
        return <ShoppingCart className="h-4 w-4" />;
    }
  };
  
  // Helper function to get category background color
  const getCategoryBgColor = (categoryId?: number) => {
    if (!categories || !categoryId) return "bg-blue-100";
    
    const category = categories.find(c => c.id === categoryId);
    if (!category) return "bg-blue-100";
    
    // Extract the color and make it lighter for the background
    const colorMap: Record<string, string> = {
      "#3B82F6": "bg-blue-100",
      "#10B981": "bg-green-100",
      "#F59E0B": "bg-amber-100",
      "#8B5CF6": "bg-purple-100",
      "#EC4899": "bg-pink-100",
      "#6366F1": "bg-indigo-100",
      "#EF4444": "bg-red-100",
      "#14B8A6": "bg-teal-100",
      "#F97316": "bg-orange-100",
      "#A855F7": "bg-purple-100",
      "#22C55E": "bg-green-100"
    };
    
    return colorMap[category.color] || "bg-blue-100";
  };
  
  // Helper function to get category text color
  const getCategoryTextColor = (categoryId?: number) => {
    if (!categories || !categoryId) return "text-blue-800";
    
    const category = categories.find(c => c.id === categoryId);
    if (!category) return "text-blue-800";
    
    // Extract the color and make it darker for the text
    const colorMap: Record<string, string> = {
      "#3B82F6": "text-blue-800",
      "#10B981": "text-green-800",
      "#F59E0B": "text-amber-800",
      "#8B5CF6": "text-purple-800",
      "#EC4899": "text-pink-800",
      "#6366F1": "text-indigo-800",
      "#EF4444": "text-red-800",
      "#14B8A6": "text-teal-800",
      "#F97316": "text-orange-800",
      "#A855F7": "text-purple-800",
      "#22C55E": "text-green-800"
    };
    
    return colorMap[category.color] || "text-blue-800";
  };

  // Format date to display
  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Sort transactions by date (most recent first) and take the last 5
  const getRecentTransactions = () => {
    if (!transactions) return [];
    
    return [...transactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  };

  const recentTransactions = getRecentTransactions();

  // Sample transactions for demo if no data
  const demoTransactions = [
    {
      id: 1,
      merchant: "Amazon",
      category: "Shopping",
      date: "Jul 12, 2023",
      amount: 78.50,
      isExpense: true,
      icon: <ShoppingCart className="text-blue-600" />,
      bgColor: "bg-blue-100"
    },
    {
      id: 2,
      merchant: "Starbucks",
      category: "Food & Dining",
      date: "Jul 11, 2023",
      amount: 5.75,
      isExpense: true,
      icon: <Utensils className="text-green-600" />,
      bgColor: "bg-green-100"
    },
    {
      id: 3,
      merchant: "Netflix",
      category: "Subscription",
      date: "Jul 10, 2023",
      amount: 14.99,
      isExpense: true,
      icon: <FilmIcon className="text-purple-600" />,
      bgColor: "bg-purple-100"
    },
    {
      id: 4,
      merchant: "Shell",
      category: "Transportation",
      date: "Jul 09, 2023",
      amount: 42.67,
      isExpense: true,
      icon: <Car className="text-red-600" />,
      bgColor: "bg-red-100"
    },
    {
      id: 5,
      merchant: "Payroll",
      category: "Income",
      date: "Jul 08, 2023",
      amount: 1925.00,
      isExpense: false,
      icon: <Building className="text-green-600" />,
      bgColor: "bg-green-100"
    }
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold">
            Recent Transactions
          </CardTitle>
          <Link href="/transactions">
            <a className="text-primary text-sm hover:underline flex items-center">
              <span>View All</span>
              <ArrowUpRight className="ml-1 h-4 w-4" />
            </a>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-64 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-3 px-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Merchant</th>
                  <th className="py-3 px-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="py-3 px-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="py-3 px-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentTransactions.length > 0 ? (
                  recentTransactions.map((transaction) => {
                    const category = categories?.find(c => c.id === transaction.categoryId);
                    return (
                      <tr key={transaction.id} className="hover:bg-gray-50">
                        <td className="py-4 px-2">
                          <div className="flex items-center">
                            <div className={cn("p-2 rounded-lg mr-3 flex-shrink-0", getCategoryBgColor(transaction.categoryId))}>
                              {getTransactionIcon(transaction.categoryId)}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{transaction.merchant}</p>
                              <p className="text-xs text-gray-500">{category?.name || "Uncategorized"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-2">
                          <Badge variant="outline" className={cn("px-2.5 py-0.5 rounded-full text-xs font-medium", 
                            getCategoryBgColor(transaction.categoryId), 
                            getCategoryTextColor(transaction.categoryId)
                          )}>
                            {category?.name || "Uncategorized"}
                          </Badge>
                        </td>
                        <td className="py-4 px-2 text-sm text-gray-500">
                          {formatDate(transaction.date)}
                        </td>
                        <td className={`py-4 px-2 text-sm font-medium text-right ${transaction.isExpense ? 'text-red-500' : 'text-green-500'}`}>
                          {transaction.isExpense ? '-' : '+'}${transaction.amount.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  demoTransactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="py-4 px-2">
                        <div className="flex items-center">
                          <div className={cn("p-2 rounded-lg mr-3 flex-shrink-0", transaction.bgColor)}>
                            {transaction.icon}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{transaction.merchant}</p>
                            <p className="text-xs text-gray-500">{transaction.category}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-2">
                        <Badge variant="outline" className={cn("px-2.5 py-0.5 rounded-full text-xs font-medium", 
                          transaction.bgColor,
                          transaction.category === "Income" ? "text-green-800" : "text-blue-800"
                        )}>
                          {transaction.category}
                        </Badge>
                      </td>
                      <td className="py-4 px-2 text-sm text-gray-500">
                        {transaction.date}
                      </td>
                      <td className={`py-4 px-2 text-sm font-medium text-right ${transaction.isExpense ? 'text-red-500' : 'text-green-500'}`}>
                        {transaction.isExpense ? '-' : '+'}${transaction.amount.toFixed(2)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
