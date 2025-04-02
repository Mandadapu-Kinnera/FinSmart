import { useQuery } from "@tanstack/react-query";
import { Budget, Transaction } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/currency";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Link } from "wouter";

export function BudgetOverview() {
  // Fetch budgets and transactions data
  const { data: budgets, isLoading: budgetsLoading } = useQuery<Budget[]>({
    queryKey: ["/api/budgets"],
  });
  
  const { data: transactions, isLoading: transactionsLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });
  
  const isLoading = budgetsLoading || transactionsLoading;
  
  // Calculate spending for each budget
  const calculateBudgetSpending = (budget: Budget) => {
    if (!transactions) return 0;
    
    // Get relevant transactions for this budget
    // For simplicity, we're just looking at the current month
    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    
    // Filter transactions by category and date
    const relevantTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      const matchesCategory = t.categoryId === budget.categoryId;
      const isCurrentMonth = transactionDate >= firstDayOfMonth;
      
      return t.isExpense && matchesCategory && isCurrentMonth;
    });
    
    // Sum the amounts
    return relevantTransactions.reduce((total, t) => total + t.amount, 0);
  };
  
  // Function to determine progress bar color based on spending percentage
  const getProgressColor = (spending: number, budget: number) => {
    const percentage = (spending / budget) * 100;
    
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-amber-500';
    return 'bg-green-500';
  };
  
  // Check if any budget is close to or exceeding its limit
  const hasWarnings = () => {
    if (!budgets || budgets.length === 0) return false;
    
    return budgets.some(budget => {
      const spending = calculateBudgetSpending(budget);
      return (spending / budget.amount) * 100 >= 80;
    });
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!budgets || budgets.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Budget Tracking</CardTitle>
          <CardDescription>
            Set budgets to monitor your spending
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-gray-500 mb-4">No budgets have been set up yet</p>
            <Link
              to="/budgets" 
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Create Budget
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget Tracking</CardTitle>
        <CardDescription>
          Monitor your spending against budget limits
        </CardDescription>
      </CardHeader>
      <CardContent>
        {hasWarnings() && (
          <Alert className="mb-4 border-amber-500 bg-amber-50">
            <AlertCircle className="h-4 w-4 text-amber-500" />
            <AlertTitle className="text-amber-800">Warning</AlertTitle>
            <AlertDescription className="text-amber-700">
              Some of your budgets are close to or exceeding their limits
            </AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-4">
          {budgets.map(budget => {
            const spending = calculateBudgetSpending(budget);
            const percentage = Math.min(100, (spending / budget.amount) * 100);
            const progressColor = getProgressColor(spending, budget.amount);
            
            return (
              <div key={budget.id} className="space-y-2">
                <div className="flex justify-between">
                  <h3 className="font-medium">{budget.name}</h3>
                  <span className={percentage >= 100 ? 'text-red-600 font-medium' : 'text-gray-600'}>
                    {formatCurrency(spending)} / {formatCurrency(budget.amount)}
                  </span>
                </div>
                <Progress 
                  value={percentage} 
                  className="h-2"
                  style={{ 
                    '--progress-foreground': percentage >= 90 ? 'rgb(239, 68, 68)' : 
                                            percentage >= 75 ? 'rgb(245, 158, 11)' : 
                                            'rgb(34, 197, 94)' 
                  } as React.CSSProperties}
                />
                <p className="text-xs text-gray-500 flex justify-between">
                  <span>{Math.round(percentage)}% used</span>
                  <span>{budget.period}</span>
                </p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}