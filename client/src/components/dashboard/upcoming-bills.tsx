import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { ArrowUpRight, Home, Zap, Wifi, Car } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Bill } from "@shared/schema";
import { Loader2 } from "lucide-react";

export default function UpcomingBills() {
  const { data: bills, isLoading } = useQuery<Bill[]>({
    queryKey: ["/api/bills"],
  });

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
        return <Home className="text-gray-600" />;
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

  // Calculate days remaining until the due date
  const getDaysRemaining = (dueDate: Date | string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Sort bills by due date and take the next 4
  const getUpcomingBills = () => {
    if (!bills) return [];
    
    return [...bills]
      .filter(bill => !bill.isPaid)
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 4);
  };

  const upcomingBills = getUpcomingBills();

  // Demo bills if no data
  const demoBills = [
    {
      id: 1,
      name: "Rent",
      dueIn: "3 days",
      amount: 1200.00,
      category: "Housing",
    },
    {
      id: 2,
      name: "Electricity",
      dueIn: "5 days",
      amount: 87.50,
      category: "Utilities",
    },
    {
      id: 3,
      name: "Internet",
      dueIn: "8 days",
      amount: 59.99,
      category: "Internet",
    },
    {
      id: 4,
      name: "Car Insurance",
      dueIn: "12 days",
      amount: 95.75,
      category: "Transportation",
    }
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold">
            Upcoming Bills
          </CardTitle>
          <Link href="/bills">
            <a className="text-primary text-sm hover:underline flex items-center">
              <span>Manage Bills</span>
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
          <div className="space-y-4">
            {upcomingBills.length > 0 ? (
              upcomingBills.map((bill) => {
                const daysRemaining = getDaysRemaining(bill.dueDate);
                return (
                  <div 
                    key={bill.id} 
                    className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center">
                      <div className={`${getBgColor(bill.category)} p-2 rounded-lg mr-3`}>
                        {getBillIcon(bill.category)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{bill.name}</p>
                        <p className="text-xs text-gray-500">
                          Due in {daysRemaining} days
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {formatCurrency(bill.amount)}
                      </p>
                      <Button 
                        variant="link" 
                        className="mt-1 h-auto p-0 text-xs text-primary font-medium"
                      >
                        Pay now
                      </Button>
                    </div>
                  </div>
                );
              })
            ) : (
              demoBills.map((bill) => (
                <div 
                  key={bill.id} 
                  className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center">
                    <div className={`${getBgColor(bill.category)} p-2 rounded-lg mr-3`}>
                      {getBillIcon(bill.category)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{bill.name}</p>
                      <p className="text-xs text-gray-500">Due in {bill.dueIn}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {formatCurrency(bill.amount)}
                    </p>
                    <Button 
                      variant="link" 
                      className="mt-1 h-auto p-0 text-xs text-primary font-medium"
                    >
                      Pay now
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
