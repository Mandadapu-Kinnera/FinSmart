import { useState } from "react";
import { Sidebar } from "@/components/ui/sidebar";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Goal, insertGoalSchema } from "@shared/schema";
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
import { Menu, ChartLine, Plus, Pencil, Loader2, Target, CalendarIcon, Check } from "lucide-react";

export default function Goals() {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const { toast } = useToast();

  const { data: goals, isLoading } = useQuery<Goal[]>({
    queryKey: ["/api/goals"],
  });

  // Improved goal form schema with validation
  const goalFormSchema = insertGoalSchema
    .omit({ userId: true })
    .extend({
      targetDate: z.string().optional(),
    });

  type GoalFormValues = z.infer<typeof goalFormSchema>;

  // Add goal form
  const addForm = useForm<GoalFormValues>({
    resolver: zodResolver(goalFormSchema),
    defaultValues: {
      name: "",
      targetAmount: 0,
      currentAmount: 0,
      targetDate: "",
      category: "",
      icon: "",
    },
  });

  // Goal mutations
  const createMutation = useMutation({
    mutationFn: async (data: GoalFormValues) => {
      // Convert the string date to a proper Date object if it exists
      const formattedData = {
        ...data,
        targetDate: data.targetDate ? new Date(data.targetDate) : undefined,
      };
      
      const res = await apiRequest("POST", "/api/goals", formattedData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      setIsAddOpen(false);
      addForm.reset();
      toast({
        title: "Goal created",
        description: "Your savings goal has been successfully created.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create goal: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Form submission handlers
  const onAddSubmit = (data: GoalFormValues) => {
    createMutation.mutate(data);
  };

  // Update goal with new contribution
  const updateGoalMutation = useMutation({
    mutationFn: async ({ id, amount }: { id: number; amount: number }) => {
      const goal = goals?.find(g => g.id === id);
      if (!goal) throw new Error("Goal not found");
      
      const newAmount = goal.currentAmount + amount;
      const res = await apiRequest("PUT", `/api/goals/${id}`, {
        currentAmount: newAmount
      });
      
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      toast({
        title: "Goal updated",
        description: "Your contribution has been added to your goal.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update goal: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Format date for display
  const formatDate = (dateString?: string | Date) => {
    if (!dateString) return "No target date";
    
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Calculate days remaining
  const getDaysRemaining = (targetDate?: Date | string) => {
    if (!targetDate) return null;
    
    const today = new Date();
    const target = new Date(targetDate);
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays > 0 ? diffDays : 0;
  };

  // Handle contribution dialog
  const [contributionAmount, setContributionAmount] = useState<number>(0);
  const [selectedGoalId, setSelectedGoalId] = useState<number | null>(null);
  const [isContributeOpen, setIsContributeOpen] = useState(false);

  const handleContribute = (goalId: number) => {
    setSelectedGoalId(goalId);
    setContributionAmount(0);
    setIsContributeOpen(true);
  };

  const submitContribution = () => {
    if (selectedGoalId && contributionAmount > 0) {
      updateGoalMutation.mutate({
        id: selectedGoalId,
        amount: contributionAmount
      });
      setIsContributeOpen(false);
    }
  };

  // Goal categories with icons
  const goalCategories = [
    { name: "Emergency Fund", icon: "shield" },
    { name: "Vacation", icon: "palm-tree" },
    { name: "Home Purchase", icon: "home" },
    { name: "Education", icon: "graduation-cap" },
    { name: "Retirement", icon: "piggy-bank" },
    { name: "Vehicle", icon: "car" },
    { name: "Wedding", icon: "heart" },
    { name: "Other", icon: "target" }
  ];

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
              <h1 className="text-2xl font-bold text-gray-900">Savings Goals</h1>
              <p className="text-gray-600 mt-1">
                Track progress towards your financial goals
              </p>
            </div>
            
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> New Goal
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Savings Goal</DialogTitle>
                </DialogHeader>
                
                <Form {...addForm}>
                  <form onSubmit={addForm.handleSubmit(onAddSubmit)} className="space-y-4">
                    <FormField
                      control={addForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Goal Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Vacation Fund" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={addForm.control}
                      name="targetAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Target Amount</FormLabel>
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
                      name="currentAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current Amount Saved</FormLabel>
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
                      name="targetDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Target Date (Optional)</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={addForm.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select 
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {goalCategories.map((category, index) => (
                                <SelectItem 
                                  key={index} 
                                  value={category.name}
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
                          "Create Goal"
                        )}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Goals Grid */}
          {isLoading ? (
            <div className="h-64 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {goals && goals.length > 0 ? (
                goals.map((goal) => {
                  const progress = Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);
                  const isCompleted = goal.currentAmount >= goal.targetAmount;
                  const daysRemaining = getDaysRemaining(goal.targetDate);
                  
                  return (
                    <Card key={goal.id} className={`overflow-hidden border-l-4 ${isCompleted ? 'border-l-green-500' : 'border-l-primary'}`}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="flex items-center">
                              <Target className="h-5 w-5 mr-2 text-primary" />
                              {goal.name}
                            </CardTitle>
                            <CardDescription>
                              {goal.category || 'Savings goal'}
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
                            <p className="text-sm text-gray-500">
                              Saved {formatCurrency(goal.currentAmount)}
                            </p>
                            <p className="text-sm font-medium">
                              {formatCurrency(goal.targetAmount)}
                            </p>
                          </div>
                          <Progress 
                            value={progress} 
                            className="h-2 bg-gray-200"
                            indicatorClassName={isCompleted ? 'bg-green-500' : 'bg-primary'}
                          />
                          <p className="text-right text-xs text-gray-500 mt-1">
                            {Math.round(progress)}% complete
                          </p>
                        </div>
                        
                        <div className="mt-4 flex items-center">
                          {goal.targetDate && (
                            <div className="flex items-center text-sm text-gray-600 mr-4">
                              <CalendarIcon className="h-4 w-4 mr-1" />
                              <span>{formatDate(goal.targetDate)}</span>
                            </div>
                          )}
                          
                          {daysRemaining !== null && daysRemaining > 0 && (
                            <div className="text-sm text-amber-600">
                              {daysRemaining} days left
                            </div>
                          )}
                          
                          {isCompleted && (
                            <div className="flex items-center text-sm text-green-600 ml-auto">
                              <Check className="h-4 w-4 mr-1" />
                              <span>Goal reached!</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                      <CardFooter className="border-t bg-gray-50 flex justify-between p-4">
                        {!isCompleted ? (
                          <Button 
                            variant="outline"
                            className="w-full"
                            onClick={() => handleContribute(goal.id)}
                          >
                            Add Contribution
                          </Button>
                        ) : (
                          <p className="text-sm text-center w-full text-green-600 font-medium">
                            Congratulations on reaching your goal!
                          </p>
                        )}
                      </CardFooter>
                    </Card>
                  );
                })
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-12 px-4">
                  <div className="bg-blue-50 p-3 rounded-full mb-4">
                    <Target className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No savings goals yet</h3>
                  <p className="text-gray-500 text-center mb-6 max-w-md">
                    Set your first savings goal to start tracking your progress toward your financial dreams.
                  </p>
                  <Button onClick={() => setIsAddOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Create Your First Goal
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Contribution Dialog */}
          <Dialog open={isContributeOpen} onOpenChange={setIsContributeOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Contribution</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="contribution" className="text-sm font-medium">
                    Contribution Amount
                  </label>
                  <Input
                    id="contribution"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={contributionAmount || ''}
                    onChange={(e) => setContributionAmount(parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                </div>
                <DialogFooter>
                  <Button 
                    onClick={submitContribution}
                    disabled={contributionAmount <= 0 || updateGoalMutation.isPending}
                  >
                    {updateGoalMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding...
                      </>
                    ) : (
                      "Add Contribution"
                    )}
                  </Button>
                </DialogFooter>
              </div>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  );
}
