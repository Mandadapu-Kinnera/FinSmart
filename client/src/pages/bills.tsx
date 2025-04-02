import { useState, useEffect } from "react";
import { Sidebar } from "@/components/ui/sidebar";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Bill, insertBillSchema } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { formatCurrency } from '@/lib/currency';
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { BillPaymentAlert } from "@/components/bill-payment-alert";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
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
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Menu, ChartLine, Plus, Pencil, Trash2, Loader2, Receipt, Home, Zap, Wifi, Car } from "lucide-react";

export default function Bills() {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [currentBill, setCurrentBill] = useState<Bill | null>(null);
  const { toast } = useToast();

  const { data: bills, isLoading } = useQuery<Bill[]>({
    queryKey: ["/api/bills"],
  });

  // Bill categories with icons
  const billCategories = [
    { name: "Housing", icon: <Home className="h-4 w-4" /> },
    { name: "Utilities", icon: <Zap className="h-4 w-4" /> },
    { name: "Internet", icon: <Wifi className="h-4 w-4" /> },
    { name: "Transportation", icon: <Car className="h-4 w-4" /> },
    { name: "Insurance", icon: <Receipt className="h-4 w-4" /> },
  ];

  // Define a complete validation schema matching the server model
  const billFormSchema = z.object({
    name: z.string().min(1, "Bill name is required"),
    amount: z.number().min(0, "Amount must be a positive number"),
    dueDate: z.string().min(1, "Due date is required"),
    isPaid: z.boolean().default(false),
    category: z.string().min(1, "Category is required"),
    icon: z.string().optional(),
  });

  type BillFormValues = z.infer<typeof billFormSchema>;

  // Add bill form
  const addForm = useForm<BillFormValues>({
    resolver: zodResolver(billFormSchema),
    defaultValues: {
      name: "",
      amount: 0,
      dueDate: new Date().toISOString().split("T")[0],
      isPaid: false,
      category: "Utilities",
      icon: "receipt",
    },
  });

  // Edit bill form
  const editForm = useForm<BillFormValues>({
    resolver: zodResolver(billFormSchema),
    defaultValues: {
      name: "",
      amount: 0,
      dueDate: new Date().toISOString().split("T")[0],
      isPaid: false,
      category: "Utilities",
      icon: "receipt",
    },
  });

  // Bill mutations
  const createMutation = useMutation({
    mutationFn: async (data: BillFormValues) => {
      // Convert the string date to a proper Date object and add icon based on category
      const iconMap: Record<string, string> = {
        'Housing': 'home',
        'Utilities': 'zap',
        'Internet': 'wifi',
        'Transportation': 'car',
        'Insurance': 'receipt'
      };
      
      const formattedData = {
        ...data,
        icon: iconMap[data.category] || 'receipt',
        dueDate: new Date(data.dueDate),
      };
      
      const res = await apiRequest("POST", "/api/bills", formattedData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bills"] });
      setIsAddOpen(false);
      addForm.reset();
      toast({
        title: "Bill created",
        description: "Your bill has been successfully created.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create bill: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: BillFormValues }) => {
      // Convert the string date to a proper Date object and add icon based on category
      const iconMap: Record<string, string> = {
        'Housing': 'home',
        'Utilities': 'zap',
        'Internet': 'wifi',
        'Transportation': 'car',
        'Insurance': 'receipt'
      };
      
      const formattedData = {
        ...data,
        icon: iconMap[data.category] || 'receipt',
        dueDate: new Date(data.dueDate),
      };
      
      const res = await apiRequest("PUT", `/api/bills/${id}`, formattedData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bills"] });
      setIsEditOpen(false);
      editForm.reset();
      setCurrentBill(null);
      toast({
        title: "Bill updated",
        description: "Your bill has been successfully updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update bill: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/bills/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bills"] });
      toast({
        title: "Bill deleted",
        description: "Your bill has been successfully deleted.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete bill: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Toggle bill payment status
  const togglePaidMutation = useMutation({
    mutationFn: async ({ id, isPaid }: { id: number; isPaid: boolean }) => {
      const res = await apiRequest("PUT", `/api/bills/${id}`, { isPaid });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bills"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update payment status: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Form submission handlers
  const onAddSubmit = (data: BillFormValues) => {
    createMutation.mutate(data);
  };

  const onEditSubmit = (data: BillFormValues) => {
    if (currentBill) {
      updateMutation.mutate({ id: currentBill.id, data });
    }
  };

  const handleEditClick = (bill: Bill) => {
    setCurrentBill(bill);
    
    // Convert date format for input
    const dateObj = new Date(bill.dueDate);
    const formattedDate = dateObj.toISOString().split("T")[0];
    
    editForm.reset({
      name: bill.name,
      amount: bill.amount,
      dueDate: formattedDate,
      isPaid: bill.isPaid,
      category: bill.category,
      icon: bill.icon,
    });
    
    setIsEditOpen(true);
  };

  const handleDeleteClick = (id: number) => {
    if (window.confirm("Are you sure you want to delete this bill?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleTogglePaid = (id: number, currentStatus: boolean) => {
    togglePaidMutation.mutate({ id, isPaid: !currentStatus });
  };

  // Helper function to get bill icon
  const getBillIcon = (category: string) => {
    switch (category) {
      case 'Housing':
        return <Home className="text-red-600" />;
      case 'Utilities':
        return <Zap className="text-yellow-600" />;
      case 'Internet':
        return <Wifi className="text-blue-600" />;
      case 'Transportation':
        return <Car className="text-green-600" />;
      default:
        return <Receipt className="text-gray-600" />;
    }
  };

  // Helper function to get background color
  const getBgColor = (category: string) => {
    switch (category) {
      case 'Housing':
        return "bg-red-100";
      case 'Utilities':
        return "bg-yellow-100";
      case 'Internet':
        return "bg-blue-100";
      case 'Transportation':
        return "bg-green-100";
      default:
        return "bg-gray-100";
    }
  };

  // Format date for display
  const formatDate = (dateString: string | Date) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Calculate days until due or overdue days
  const getDueStatus = (dueDate: Date | string, isPaid: boolean) => {
    if (isPaid) return { text: "Paid", status: "paid" };
    
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { 
        text: `Overdue by ${Math.abs(diffDays)} days`, 
        status: "overdue" 
      };
    } else if (diffDays === 0) {
      return { text: "Due today", status: "due-today" };
    } else if (diffDays <= 3) {
      return { text: `Due in ${diffDays} days`, status: "due-soon" };
    } else {
      return { text: `Due in ${diffDays} days`, status: "upcoming" };
    }
  };

  // Sort bills by due date (most urgent first)
  const sortedBills = bills?.sort((a, b) => {
    // Put paid bills at the bottom
    if (a.isPaid && !b.isPaid) return 1;
    if (!a.isPaid && b.isPaid) return -1;
    
    // Sort unpaid bills by due date
    if (!a.isPaid && !b.isPaid) {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }
    
    // Sort paid bills by due date (most recent first)
    return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
  });

  // Use the imported currency formatter

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
              <h1 className="text-2xl font-bold text-gray-900">Bills</h1>
              <p className="text-gray-600 mt-1">
                Track and manage your upcoming bills
              </p>
            </div>
            
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> Add Bill
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Bill</DialogTitle>
                </DialogHeader>
                
                <Form {...addForm}>
                  <form onSubmit={addForm.handleSubmit(onAddSubmit)} className="space-y-4">
                    <FormField
                      control={addForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bill Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Rent" {...field} />
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
                      name="dueDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Due Date</FormLabel>
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
                              {billCategories.map((category, index) => (
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
                      name="isPaid"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              Already Paid
                            </FormLabel>
                            <p className="text-sm text-gray-500">
                              Check this if you've already paid this bill
                            </p>
                          </div>
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
                          "Save Bill"
                        )}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Bills Table */}
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-lg">Upcoming & Past Bills</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-64 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">Status</TableHead>
                        <TableHead>Bill</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Due Status</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedBills && sortedBills.length > 0 ? (
                        sortedBills.map((bill) => {
                          const dueStatus = getDueStatus(bill.dueDate, bill.isPaid);
                          let statusBadge;
                          
                          if (bill.isPaid) {
                            statusBadge = <Badge className="bg-green-100 text-green-800">Paid</Badge>;
                          } else if (dueStatus.status === 'overdue') {
                            statusBadge = <Badge className="bg-red-100 text-red-800">Overdue</Badge>;
                          } else if (dueStatus.status === 'due-today') {
                            statusBadge = <Badge className="bg-amber-100 text-amber-800">Due Today</Badge>;
                          } else if (dueStatus.status === 'due-soon') {
                            statusBadge = <Badge className="bg-orange-100 text-orange-800">Due Soon</Badge>;
                          } else {
                            statusBadge = <Badge className="bg-blue-100 text-blue-800">Upcoming</Badge>;
                          }
                          
                          return (
                            <TableRow key={bill.id} className={bill.isPaid ? 'opacity-70' : ''}>
                              <TableCell>
                                <Checkbox 
                                  checked={bill.isPaid}
                                  onCheckedChange={() => handleTogglePaid(bill.id, bill.isPaid)}
                                />
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center">
                                  <div className={`${getBgColor(bill.category)} p-2 rounded-lg mr-3`}>
                                    {getBillIcon(bill.category)}
                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-900">{bill.name}</p>
                                    <p className="text-xs text-gray-500">{bill.category}</p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>{formatDate(bill.dueDate)}</TableCell>
                              <TableCell>{statusBadge}</TableCell>
                              <TableCell className="text-right font-medium">
                                {formatCurrency(bill.amount)}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    onClick={() => handleEditClick(bill)}
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    onClick={() => handleDeleteClick(bill.id)}
                                  >
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center h-24">
                            <div className="flex flex-col items-center justify-center py-4">
                              <Receipt className="h-8 w-8 text-gray-300 mb-2" />
                              <p className="text-gray-500">No bills found</p>
                              <Button 
                                variant="link" 
                                onClick={() => setIsAddOpen(true)}
                                className="mt-2"
                              >
                                Add your first bill
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Edit Bill Dialog */}
          <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Bill</DialogTitle>
              </DialogHeader>
              
              <Form {...editForm}>
                <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
                  <FormField
                    control={editForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bill Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Rent" {...field} />
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
                    name="dueDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Due Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
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
                            {billCategories.map((category, index) => (
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
                    name="isPaid"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Mark as Paid
                          </FormLabel>
                          <p className="text-sm text-gray-500">
                            Check this if you've paid this bill
                          </p>
                        </div>
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
                        "Update Bill"
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </main>
      </div>
      
      {/* Bill Payment Alarms */}
      {bills && bills.length > 0 && (
        <BillPaymentAlert bills={bills} />
      )}
    </div>
  );
}
