import { useState } from "react";
import { Sidebar } from "@/components/ui/sidebar";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Subscription, insertSubscriptionSchema } from "@shared/schema";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Menu, ChartLine, Plus, Pencil, Trash2, Loader2, Lightbulb } from "lucide-react";
import { FaYoutube, FaSpotify, FaFilm, FaAmazon, FaDumbbell, FaApple, FaDiscord, FaSlack } from "react-icons/fa";

export default function Subscriptions() {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null);
  const { toast } = useToast();

  const { data: subscriptions, isLoading } = useQuery<Subscription[]>({
    queryKey: ["/api/subscriptions"],
  });

  // Subscription categories with icons
  const subscriptionCategories = [
    { name: "Entertainment", icon: <FaFilm className="h-4 w-4" /> },
    { name: "Music", icon: <FaSpotify className="h-4 w-4" /> },
    { name: "Health", icon: <FaDumbbell className="h-4 w-4" /> },
    { name: "Shopping", icon: <FaAmazon className="h-4 w-4" /> },
    { name: "Productivity", icon: <FaSlack className="h-4 w-4" /> },
  ];

  // Subscription services with icons
  const subscriptionServices = [
    { name: "Netflix", icon: <FaFilm className="h-4 w-4 text-red-600" />, category: "Entertainment" },
    { name: "YouTube Premium", icon: <FaYoutube className="h-4 w-4 text-red-600" />, category: "Entertainment" },
    { name: "Spotify", icon: <FaSpotify className="h-4 w-4 text-green-600" />, category: "Music" },
    { name: "Apple Music", icon: <FaApple className="h-4 w-4 text-gray-800" />, category: "Music" },
    { name: "Amazon Prime", icon: <FaAmazon className="h-4 w-4 text-blue-600" />, category: "Shopping" },
    { name: "Fitness Plus", icon: <FaDumbbell className="h-4 w-4 text-purple-600" />, category: "Health" },
    { name: "Discord Nitro", icon: <FaDiscord className="h-4 w-4 text-indigo-600" />, category: "Entertainment" },
    { name: "Slack", icon: <FaSlack className="h-4 w-4 text-teal-600" />, category: "Productivity" },
  ];

  // Improved subscription form schema with validation
  const subscriptionFormSchema = insertSubscriptionSchema
    .omit({ userId: true })
    .extend({
      nextBillingDate: z.string().optional(),
    });

  type SubscriptionFormValues = z.infer<typeof subscriptionFormSchema>;

  // Add subscription form
  const addForm = useForm<SubscriptionFormValues>({
    resolver: zodResolver(subscriptionFormSchema),
    defaultValues: {
      name: "",
      amount: 0,
      billingCycle: "monthly",
      category: "Entertainment",
      status: "active",
      nextBillingDate: new Date().toISOString().split("T")[0],
    },
  });

  // Edit subscription form
  const editForm = useForm<SubscriptionFormValues>({
    resolver: zodResolver(subscriptionFormSchema),
    defaultValues: {
      name: "",
      amount: 0,
      billingCycle: "monthly",
      category: "Entertainment",
      status: "active",
      nextBillingDate: new Date().toISOString().split("T")[0],
    },
  });

  // Subscription mutations
  const createMutation = useMutation({
    mutationFn: async (data: SubscriptionFormValues) => {
      // Convert the string date to a proper Date object if it exists
      const formattedData = {
        ...data,
        nextBillingDate: data.nextBillingDate ? new Date(data.nextBillingDate) : undefined,
      };
      
      const res = await apiRequest("POST", "/api/subscriptions", formattedData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subscriptions"] });
      setIsAddOpen(false);
      addForm.reset();
      toast({
        title: "Subscription created",
        description: "Your subscription has been successfully added.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create subscription: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: SubscriptionFormValues }) => {
      // Convert the string date to a proper Date object if it exists
      const formattedData = {
        ...data,
        nextBillingDate: data.nextBillingDate ? new Date(data.nextBillingDate) : undefined,
      };
      
      const res = await apiRequest("PUT", `/api/subscriptions/${id}`, formattedData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subscriptions"] });
      setIsEditOpen(false);
      editForm.reset();
      setCurrentSubscription(null);
      toast({
        title: "Subscription updated",
        description: "Your subscription has been successfully updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update subscription: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/subscriptions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subscriptions"] });
      toast({
        title: "Subscription cancelled",
        description: "Your subscription has been successfully cancelled.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to cancel subscription: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Form submission handlers
  const onAddSubmit = (data: SubscriptionFormValues) => {
    createMutation.mutate(data);
  };

  const onEditSubmit = (data: SubscriptionFormValues) => {
    if (currentSubscription) {
      updateMutation.mutate({ id: currentSubscription.id, data });
    }
  };

  const handleEditClick = (subscription: Subscription) => {
    setCurrentSubscription(subscription);
    
    // Convert date format for input if it exists
    let formattedDate = "";
    if (subscription.nextBillingDate) {
      const dateObj = new Date(subscription.nextBillingDate);
      formattedDate = dateObj.toISOString().split("T")[0];
    }
    
    editForm.reset({
      name: subscription.name,
      amount: subscription.amount,
      billingCycle: subscription.billingCycle,
      category: subscription.category,
      status: subscription.status,
      icon: subscription.icon,
      nextBillingDate: formattedDate,
    });
    
    setIsEditOpen(true);
  };

  const handleCancelSubscription = (id: number) => {
    if (window.confirm("Are you sure you want to cancel this subscription?")) {
      const subscription = subscriptions?.find(s => s.id === id);
      if (subscription) {
        // Instead of deleting, change the status to cancelled
        updateMutation.mutate({
          id,
          data: {
            ...subscription,
            status: "cancelled",
            nextBillingDate: subscription.nextBillingDate?.toString(),
          }
        });
      }
    }
  };

  const handleDeleteClick = (id: number) => {
    if (window.confirm("Are you sure you want to delete this subscription completely?")) {
      deleteMutation.mutate(id);
    }
  };

  // Helper function to get subscription icon
  const getSubscriptionIcon = (name: string) => {
    const service = subscriptionServices.find(s => 
      name.toLowerCase().includes(s.name.toLowerCase())
    );
    
    if (service) return service.icon;
    
    // Default icon based on category
    const category = currentSubscription?.category || "Entertainment";
    const categoryService = subscriptionServices.find(s => s.category === category);
    
    return categoryService?.icon || <FaFilm className="h-4 w-4 text-gray-600" />;
  };

  // Helper function to format subscription status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
            Active
          </Badge>
        );
      case "cancelled":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-200">
            Cancelled
          </Badge>
        );
      case "paused":
        return (
          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">
            Paused
          </Badge>
        );
      default:
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
            Active
          </Badge>
        );
    }
  };

  // Format date for display
  const formatDate = (dateString?: string | Date) => {
    if (!dateString) return "No date";
    
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    };
    
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Sort subscriptions by status (active first) and then by name
  const sortedSubscriptions = subscriptions?.sort((a, b) => {
    if (a.status === 'active' && b.status !== 'active') return -1;
    if (a.status !== 'active' && b.status === 'active') return 1;
    return a.name.localeCompare(b.name);
  });

  // Calculate total monthly cost
  const calculateTotalCost = () => {
    if (!subscriptions || subscriptions.length === 0) return 0;
    
    return subscriptions.reduce((sum, sub) => {
      if (sub.status === 'active') {
        if (sub.billingCycle === 'yearly') {
          return sum + (sub.amount / 12); // Convert yearly to monthly
        }
        return sum + sub.amount;
      }
      return sum;
    }, 0);
  };

  const totalMonthlyCost = calculateTotalCost();

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Calculate next subscription dates and potential savings
  const getInsights = () => {
    if (!subscriptions || subscriptions.length === 0) {
      return {
        monthlySpending: 0,
        potentialSavings: 0,
        lowUsageSubscriptions: [],
      };
    }
    
    // In a real app, we would get usage patterns from an API
    // For now, let's assume Fitness Plus is low usage
    const lowUsageSubscriptions = subscriptions.filter(
      s => s.status === 'active' && 
           (s.name.includes('Fitness') || s.category === 'Health')
    );
    
    const potentialSavings = lowUsageSubscriptions.reduce(
      (sum, sub) => sum + sub.amount, 0
    );
    
    return {
      monthlySpending: totalMonthlyCost,
      potentialSavings,
      lowUsageSubscriptions,
    };
  };

  const insights = getInsights();

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
              <h1 className="text-2xl font-bold text-gray-900">Subscriptions</h1>
              <p className="text-gray-600 mt-1">
                Manage your recurring subscriptions
              </p>
            </div>
            
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> Add Subscription
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Subscription</DialogTitle>
                </DialogHeader>
                
                <Form {...addForm}>
                  <form onSubmit={addForm.handleSubmit(onAddSubmit)} className="space-y-4">
                    <FormField
                      control={addForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Service Name</FormLabel>
                          <Select 
                            onValueChange={(value) => {
                              field.onChange(value);
                              const service = subscriptionServices.find(s => s.name === value);
                              if (service) {
                                addForm.setValue("category", service.category);
                              }
                            }}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a service" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {subscriptionServices.map((service, index) => (
                                <SelectItem 
                                  key={index} 
                                  value={service.name}
                                >
                                  <div className="flex items-center">
                                    {service.icon}
                                    <span className="ml-2">{service.name}</span>
                                  </div>
                                </SelectItem>
                              ))}
                              <SelectItem value="Other">
                                <div className="flex items-center">
                                  <span className="ml-2">Other (Custom)</span>
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {addForm.watch("name") === "Other" && (
                      <FormField
                        control={addForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Custom Service Name</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Disney+" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    <FormField
                      control={addForm.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Amount</FormLabel>
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
                      name="billingCycle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Billing Cycle</FormLabel>
                          <Select 
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select billing cycle" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="monthly">Monthly</SelectItem>
                              <SelectItem value="yearly">Yearly</SelectItem>
                            </SelectContent>
                          </Select>
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
                              {subscriptionCategories.map((category, index) => (
                                <SelectItem 
                                  key={index} 
                                  value={category.name}
                                >
                                  <div className="flex items-center">
                                    {category.icon}
                                    <span className="ml-2">{category.name}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={addForm.control}
                      name="nextBillingDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Next Billing Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <DialogFooter>
                      <Button type="submit" disabled={createMutation.isPending}>
                        {createMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                          </>
                        ) : (
                          "Save Subscription"
                        )}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Subscription Insights */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex items-start bg-blue-50 p-4 rounded-lg border border-blue-100">
                <div className="bg-primary bg-opacity-10 p-2 rounded-full mr-3 flex-shrink-0">
                  <Lightbulb className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Subscription Insights</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    You're spending {formatCurrency(insights.monthlySpending)}/month on subscriptions.
                    {insights.potentialSavings > 0 && 
                      ` We found a potential savings of ${formatCurrency(insights.potentialSavings)} based on usage patterns.`
                    }
                  </p>
                  {insights.lowUsageSubscriptions.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs font-medium text-gray-700">Low Usage Subscriptions:</p>
                      <ul className="text-xs text-gray-600 mt-1 list-disc pl-4">
                        {insights.lowUsageSubscriptions.map((sub, index) => (
                          <li key={index}>
                            {sub.name} ({formatCurrency(sub.amount)}/{sub.billingCycle})
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active Subscriptions */}
          <Card className="mb-6">
            <CardHeader className="py-4">
              <CardTitle className="text-lg">Active Subscriptions</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-64 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sortedSubscriptions && sortedSubscriptions.filter(s => s.status === "active").length > 0 ? (
                    sortedSubscriptions
                      .filter(s => s.status === "active")
                      .map((subscription) => (
                        <div
                          key={subscription.id}
                          className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="bg-gray-100 p-2 rounded-lg mr-3">
                                {getSubscriptionIcon(subscription.name)}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{subscription.name}</p>
                                <p className="text-xs text-gray-500">{subscription.category}</p>
                              </div>
                            </div>
                            {getStatusBadge(subscription.status)}
                          </div>
                          <div className="mt-3 flex justify-between items-center">
                            <p className="font-semibold text-gray-900">
                              {formatCurrency(subscription.amount)} <span className="text-xs font-normal text-gray-500">/{subscription.billingCycle}</span>
                            </p>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2"
                                onClick={() => handleEditClick(subscription)}
                              >
                                <Pencil className="h-3.5 w-3.5 mr-1" />
                                <span className="text-xs">Edit</span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                                onClick={() => handleCancelSubscription(subscription.id)}
                              >
                                <span className="text-xs">Cancel</span>
                              </Button>
                            </div>
                          </div>
                          {subscription.nextBillingDate && (
                            <div className="mt-2 text-xs text-gray-500">
                              Next billing: {formatDate(subscription.nextBillingDate)}
                            </div>
                          )}
                        </div>
                      ))
                  ) : (
                    <div className="col-span-full flex flex-col items-center justify-center py-8">
                      <FaSpotify className="h-12 w-12 text-gray-300 mb-4" />
                      <p className="text-gray-500 mb-2">No active subscriptions</p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setIsAddOpen(true)}
                      >
                        <Plus className="h-4 w-4 mr-1" /> Add your first subscription
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Cancelled/Paused Subscriptions */}
          {!isLoading && sortedSubscriptions && sortedSubscriptions.some(s => s.status !== "active") && (
            <Card>
              <CardHeader className="py-4">
                <CardTitle className="text-lg">Cancelled & Paused Subscriptions</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subscription</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedSubscriptions
                      .filter(s => s.status !== "active")
                      .map((subscription) => (
                        <TableRow key={subscription.id}>
                          <TableCell>
                            <div className="flex items-center">
                              <div className="bg-gray-100 p-2 rounded-lg mr-3">
                                {getSubscriptionIcon(subscription.name)}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{subscription.name}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{subscription.category}</TableCell>
                          <TableCell>{getStatusBadge(subscription.status)}</TableCell>
                          <TableCell>
                            {formatCurrency(subscription.amount)}/{subscription.billingCycle}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8"
                                onClick={() => {
                                  // Reactivate subscription
                                  updateMutation.mutate({
                                    id: subscription.id,
                                    data: {
                                      ...subscription,
                                      status: "active",
                                      nextBillingDate: subscription.nextBillingDate?.toString(),
                                    }
                                  });
                                }}
                              >
                                Reactivate
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleDeleteClick(subscription.id)}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Edit Subscription Dialog */}
          <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Subscription</DialogTitle>
              </DialogHeader>
              
              <Form {...editForm}>
                <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
                  <FormField
                    control={editForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subscription Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editForm.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount</FormLabel>
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
                    control={editForm.control}
                    name="billingCycle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Billing Cycle</FormLabel>
                        <Select 
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select billing cycle" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="yearly">Yearly</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editForm.control}
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
                            {subscriptionCategories.map((category, index) => (
                              <SelectItem 
                                key={index} 
                                value={category.name}
                              >
                                <div className="flex items-center">
                                  {category.icon}
                                  <span className="ml-2">{category.name}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editForm.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select 
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="paused">Paused</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editForm.control}
                    name="nextBillingDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Next Billing Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <DialogFooter>
                    <Button type="submit" disabled={updateMutation.isPending}>
                      {updateMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...
                        </>
                      ) : (
                        "Update Subscription"
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  );
}
