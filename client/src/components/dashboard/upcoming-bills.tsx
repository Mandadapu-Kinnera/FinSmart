import { useQuery } from "@tanstack/react-query";
import { Bill } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/currency";
import { Loader2, Calendar, Check } from "lucide-react";
import { format, isAfter, isBefore, addDays } from "date-fns";

export function UpcomingBills() {
  // Fetch bills data
  const { data: bills, isLoading } = useQuery<Bill[]>({
    queryKey: ["/api/bills"],
  });
  
  // Sort and filter bills
  const sortedBills = bills?.filter(bill => !bill.isPaid)
    .sort((a, b) => {
      const dateA = new Date(a.dueDate);
      const dateB = new Date(b.dueDate);
      return dateA.getTime() - dateB.getTime();
    })
    .slice(0, 5); // Show only 5 upcoming bills
  
  // Get the bill status
  const getBillStatus = (dueDate: Date) => {
    const today = new Date();
    const dueDateObj = new Date(dueDate);
    
    if (isBefore(dueDateObj, today)) {
      return { label: "Overdue", variant: "destructive", className: "bg-red-100 text-red-800 border-red-200" };
    }
    
    if (isBefore(dueDateObj, addDays(today, 3))) {
      return { label: "Due Soon", variant: "warning", className: "bg-amber-100 text-amber-800 border-amber-200" };
    }
    
    return { label: "Upcoming", variant: "outline", className: "bg-blue-50 text-blue-800 border-blue-200" };
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!sortedBills || sortedBills.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Bills</CardTitle>
          <CardDescription>
            Track your bills and due dates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-gray-500 mb-4">No pending bills found</p>
            <a 
              href="/bills" 
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Manage Bills
            </a>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Bills</CardTitle>
        <CardDescription>
          Bills due in the coming days
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedBills.map(bill => {
            const status = getBillStatus(bill.dueDate);
            const dueDate = new Date(bill.dueDate);
            
            return (
              <div key={bill.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="bg-gray-100 rounded-full p-2">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">{bill.name}</h3>
                    <p className="text-sm text-gray-500">
                      {format(dueDate, "MMMM d, yyyy")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <p className="font-semibold">{formatCurrency(bill.amount)}</p>
                  <Badge className={status.className}>
                    {status.label}
                  </Badge>
                </div>
              </div>
            );
          })}
          
          {sortedBills.length > 0 && (
            <div className="pt-3 text-center">
              <a 
                href="/bills" 
                className="text-primary hover:text-primary/90 text-sm font-medium inline-flex items-center"
              >
                View All Bills <Check className="ml-1 h-4 w-4" />
              </a>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}