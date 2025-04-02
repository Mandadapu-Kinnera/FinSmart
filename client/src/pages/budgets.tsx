import { useState } from "react";
import { Sidebar } from "@/components/ui/sidebar";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Budget, Category, insertBudgetSchema } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Menu, ChartLine, Plus, Pencil, Loader2, AlertTriangle, Wallet } from "lucide-react";
import { Transaction } from "@shared/schema";

export default function Budgets() {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const { toast } = useToast();

  const { data: budgets, isLoading: budgetsLoading } = useQuery<Budget[]>({
    queryKey: ["/api/budgets"],
  });
  
  const { data: categories, isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: transactions, isLoading: transactionsLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });

  // Form schema for budget
  const budgetFormSchema = insertBudgetSchema
    .omit({ userId: true });

  type BudgetFormValues = z.infer<typeof budgetFormSchema>;

  // Add budget form
  const addForm = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetFormSchema),
    defaultValues: {
      name: "",
      amount: 0,
      period: "monthly",
    },
  });

  // Budget mutations
  const createMutation = useMutation({
    mutationFn: async (data: BudgetFormValues) => {
      const res = await apiRequest("POST", "/api/budgets", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/budgets"] });
      setIsAddOpen(false);
      addForm.reset();
      toast({
        title: "Budget created",
        description: "Your budget has been successfully created.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create budget: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Form submission handlers
  const onAddSubmit = (data: BudgetFormValues) => {
    createMutation.mutate(data);
  };

  // Calculate spending for a budget
  const calculateSpending = (budget: Budget) => {
    if (!transactions) return 0;
    
    const now = new Date();
    const startDate = new Date();
    
    // Set start date based on budget period
    if (budget.period === "monthly") {
      startDate.setDate(1); // First day of current month
    } else if (budget.period === "weekly") {
      // Set to beginning of current week (Sunday)
      const day = startDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
      startDate.setDate(startDate.getDate() - day);
    } else if (budget.period === "yearly") {
      startDate.setMonth(0, 1); // January 1st of current year
    }
    
    // Filter transactions by date, category, and expense type
    const relevantTransactions = transactions.filter(transaction => 
      new Date(transaction.date) >= startDate &&
      new Date(transaction.date) <= now &&
      transaction.isExpense &&
      (
        // If budget has a category, filter by it, otherwise include all
        budget.categoryId ? transaction.categoryId === budget.categoryId : true
      )
    );
    
    // Sum up amounts
    return relevantTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Format period for display
  const formatPeriod = (period: string) => {
    switch (period) {
      case "monthly": return "Monthly";
      case "weekly": return "Weekly";
      case "yearly": return "Yearly";
      default: return period;
    }
  };

  const isLoading = budgetsLoading || categoriesLoading || transactionsLoading;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ChartLine className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold text-gray-900 hidden md:inline-block">FinSmart</h1>
          </div>
          
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden" 
              onClick={() => setShowMobileMenu(!showMobileMenu)}
            >
              <Menu className="h-5 w-5 text-gray-500" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-64px)]">
        {/* Sidebar (Desktop) */}
        <div className="hidden md:block">
          <Sidebar />
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="fixed inset-0 z-40 md:hidden">
            <div className="fixed inset-0 bg-gray-900 bg-opacity-50" onClick={() => setShowMobileMenu(false)}></div>
            <div className="relative h-full w-4/5 max-w-xs bg-white">
              <Sidebar />
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Budgets</h1>
              <p className="text-gray-600 mt-1">
                Create and manage your spending budgets
              </p>
            </div>
            
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> Create Budget
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Budget</DialogTitle>
                </DialogHeader>
                
                <Form {...addForm}>
                  <form onSubmit={addForm.handleSubmit(onAddSubmit)} className="space-y-4">
                    <FormField
                      control={addForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Budget Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Groceries Budget" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={addForm.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Budget Amount</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.01" 
                              placeholder="0.00" 
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={addForm.control}
                      name="period"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Period</FormLabel>
                          <Select 
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a period" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="monthly">Monthly</SelectItem>
                              <SelectItem value="weekly">Weekly</SelectItem>
                              <SelectItem value="yearly">Yearly</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={addForm.control}
                      name="categoryId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category (Optional)</FormLabel>
                          <Select 
                            onValueChange={(value) => field.onChange(parseInt(value))}
                            value={field.value?.toString()}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categories?.map((category) => (
                                <SelectItem 
                                  key={category.id} 
                                  value={category.id.toString()}
                                >
                                  {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <DialogFooter>
                      <Button type="submit" disabled={createMutation.isPending}>
                        {createMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...
                          </>
                        ) : (
                          "Create Budget"
                        )}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Budgets Grid */}
          {isLoading ? (
            <div className="h-64 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {budgets && budgets.length > 0 ? (
                budgets.map((budget) => {
                  const category = categories?.find(c => c.id === budget.categoryId);
                  const spent = calculateSpending(budget);
                  const progress = Math.min(100, (spent / budget.amount) * 100);
                  const remaining = Math.max(0, budget.amount - spent);
                  const isOverBudget = spent > budget.amount;
                  
                  return (
                    <Card key={budget.id} className="overflow-hidden">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle>{budget.name}</CardTitle>
                            <CardDescription>
                              {formatPeriod(budget.period)} budget 
                              {category ? ` for ${category.name}` : ''}
                            </CardDescription>
                          </div>
                          <Button variant="ghost" size="icon">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="mt-2">
                          <div className="flex justify-between items-end mb-1">
                            <p className="text-sm text-gray-500">Spent {formatCurrency(spent)}</p>
                            <p className="text-sm font-medium">{formatCurrency(budget.amount)}</p>
                          </div>
                          <Progress 
                            value={progress} 
                            className={`h-2 ${isOverBudget ? 'bg-red-200' : 'bg-gray-200'}`}
                            indicatorClassName={isOverBudget ? 'bg-red-500' : 'bg-primary'}
                          />
                        </div>
                        
                        <div className="mt-4 flex justify-between items-center">
                          <div>
                            <p className="text-sm text-gray-500">Remaining</p>
                            <p className={`text-xl font-bold ${isOverBudget ? 'text-red-500' : 'text-gray-900'}`}>
                              {isOverBudget ? '-' : ''}{formatCurrency(Math.abs(remaining))}
                            </p>
                          </div>
                          
                          <div className={`p-2 rounded-full ${isOverBudget ? 'bg-red-100' : 'bg-blue-100'}`}>
                            {isOverBudget ? (
                              <AlertTriangle className="h-5 w-5 text-red-500" />
                            ) : (
                              <Wallet className="h-5 w-5 text-primary" />
                            )}
                          </div>
                        </div>
                        
                        {isOverBudget && (
                          <div className="mt-3 text-sm text-red-500 flex items-center">
                            <AlertTriangle className="h-4 w-4 mr-1" />
                            You've exceeded your budget by {formatCurrency(Math.abs(remaining))}
                          </div>
                        )}
                      </CardContent>
                      <CardFooter className="border-t bg-gray-50 flex justify-between px-6 py-3">
                        <p className="text-sm text-gray-500">
                          {Math.round(progress)}% of budget used
                        </p>
                      </CardFooter>
                    </Card>
                  );
                })
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-12 px-4">
                  <div className="bg-blue-50 p-3 rounded-full mb-4">
                    <Wallet className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No budgets yet</h3>
                  <p className="text-gray-500 text-center mb-6 max-w-md">
                    Create your first budget to start tracking your spending and stay on top of your financial goals.
                  </p>
                  <Button onClick={() => setIsAddOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Create Your First Budget
                  </Button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
