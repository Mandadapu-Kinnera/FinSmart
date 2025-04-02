import { useQuery } from "@tanstack/react-query";
import { Subscription } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/currency";
import { Loader2, Calendar, CreditCard } from "lucide-react";
import { format, addMonths } from "date-fns";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

// Colors for pie chart
const COLORS = ['#4f46e5', '#0ea5e9', '#8b5cf6', '#ec4899', '#f97316', '#14b8a6'];

export function SubscriptionOverview() {
  // Fetch subscription data
  const { data: subscriptions, isLoading } = useQuery<Subscription[]>({
    queryKey: ["/api/subscriptions"],
  });
  
  // Calculate total monthly subscription cost
  const calculateMonthlyCost = () => {
    if (!subscriptions || subscriptions.length === 0) return 0;
    
    return subscriptions.reduce((total, subscription) => {
      // Convert yearly subscriptions to monthly equivalent
      const monthlyCost = subscription.billingCycle === 'yearly' 
        ? subscription.amount / 12 
        : subscription.amount;
        
      return total + monthlyCost;
    }, 0);
  };
  
  // Group subscriptions by category for pie chart
  const prepareChartData = () => {
    if (!subscriptions || subscriptions.length === 0) return [];
    
    const categories: Record<string, number> = {};
    
    subscriptions.forEach(subscription => {
      const category = subscription.category || 'Other';
      const monthlyCost = subscription.billingCycle === 'yearly' 
        ? subscription.amount / 12 
        : subscription.amount;
        
      categories[category] = (categories[category] || 0) + monthlyCost;
    });
    
    return Object.entries(categories).map(([name, value]) => ({
      name,
      value
    }));
  };
  
  const totalMonthlyCost = calculateMonthlyCost();
  const chartData = prepareChartData();
  
  // Find the next upcoming payment
  const getNextPayment = () => {
    if (!subscriptions || subscriptions.length === 0) return null;
    
    const today = new Date();
    const nextPayments = subscriptions
      .map(subscription => {
        let nextDate = subscription.nextBillingDate 
          ? new Date(subscription.nextBillingDate) 
          : addMonths(today, 1); // Default to one month from now if no date
          
        return {
          name: subscription.name,
          date: nextDate,
          amount: subscription.amount,
          cycle: subscription.billingCycle
        };
      })
      .filter(payment => payment.date > today)
      .sort((a, b) => a.date.getTime() - b.date.getTime());
      
    return nextPayments.length > 0 ? nextPayments[0] : null;
  };
  
  const nextPayment = getNextPayment();
  
  // Custom tooltip for pie chart
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border shadow-sm rounded-md">
          <p className="font-medium">{payload[0].name}</p>
          <p className="text-primary">{formatCurrency(payload[0].value)}/month</p>
        </div>
      );
    }
    return null;
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!subscriptions || subscriptions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Subscription Management</CardTitle>
          <CardDescription>
            Track your recurring subscriptions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-gray-500 mb-4">No subscriptions added yet</p>
            <a 
              href="/subscriptions" 
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Add Subscription
            </a>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Subscription Management</CardTitle>
        <CardDescription>
          Track your recurring subscriptions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium mb-3">Monthly Breakdown</h3>
            
            <div className="mb-4">
              <p className="text-sm text-gray-500">Total Monthly Cost</p>
              <p className="text-2xl font-bold text-primary">
                {formatCurrency(totalMonthlyCost)}/month
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Across {subscriptions.length} subscription{subscriptions.length !== 1 ? 's' : ''}
              </p>
            </div>
            
            {nextPayment && (
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-blue-500" />
                  <h4 className="font-medium text-blue-800">Next Payment</h4>
                </div>
                <div className="mt-2">
                  <p className="font-medium">{nextPayment.name}</p>
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-sm text-gray-600">
                      {format(nextPayment.date, "MMMM d, yyyy")}
                    </p>
                    <p className="font-medium">
                      {formatCurrency(nextPayment.amount)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-3">Category Distribution</h3>
            <div className="h-48">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      outerRadius={70}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-gray-500">No category data available</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-6 text-center">
          <a 
            href="/subscriptions" 
            className="text-primary hover:text-primary/90 text-sm font-medium inline-flex items-center"
          >
            Manage All Subscriptions <CreditCard className="ml-1 h-4 w-4" />
          </a>
        </div>
      </CardContent>
    </Card>
  );
}