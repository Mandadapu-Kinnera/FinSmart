import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Subscription } from "@shared/schema";
import { ArrowUpRight, Lightbulb, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FaYoutube, FaSpotify, FaDumbbell, FaFilm, FaAmazon } from "react-icons/fa";

export default function SubscriptionOverview() {
  const { data: subscriptions, isLoading } = useQuery<Subscription[]>({
    queryKey: ["/api/subscriptions"],
  });

  // Helper function to get subscription icon
  const getSubscriptionIcon = (name: string) => {
    const nameLower = name.toLowerCase();
    
    if (nameLower.includes('youtube')) return <FaYoutube className="text-red-600" />;
    if (nameLower.includes('spotify')) return <FaSpotify className="text-green-600" />;
    if (nameLower.includes('netflix')) return <FaFilm className="text-red-600" />;
    if (nameLower.includes('amazon')) return <FaAmazon className="text-blue-600" />;
    if (nameLower.includes('fitness') || nameLower.includes('gym')) return <FaDumbbell className="text-purple-600" />;
    
    // Default icon
    return <FaYoutube className="text-gray-600" />;
  };

  // Helper function to get subscription status badge
  const getStatusBadge = (status: string, usage?: string) => {
    if (usage === 'low') {
      return (
        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
          Low usage
        </Badge>
      );
    }
    
    switch (status) {
      case 'active':
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
            Active
          </Badge>
        );
      case 'paused':
        return (
          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">
            Paused
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-200">
            Cancelled
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

  // Format the price
  const formatPrice = (amount: number, cycle: string) => {
    const formattedAmount = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
    
    return `${formattedAmount} ${cycle === 'monthly' ? '/month' : '/year'}`;
  };

  // Demo subscriptions if no data
  const demoSubscriptions = [
    {
      id: 1,
      name: "YouTube Premium",
      category: "Entertainment",
      status: "active",
      amount: 11.99,
      billingCycle: "monthly",
      icon: <FaYoutube className="text-red-600" />
    },
    {
      id: 2,
      name: "Spotify",
      category: "Music",
      status: "active",
      amount: 9.99,
      billingCycle: "monthly",
      icon: <FaSpotify className="text-green-600" />
    },
    {
      id: 3,
      name: "Fitness Plus",
      category: "Health",
      status: "low-usage",
      amount: 14.99,
      billingCycle: "monthly",
      icon: <FaDumbbell className="text-purple-600" />
    }
  ];

  // Calculate total monthly subscription cost
  const calculateTotalCost = () => {
    if (!subscriptions || subscriptions.length === 0) {
      // Return demo total if no subscriptions
      return demoSubscriptions.reduce((sum, sub) => sum + sub.amount, 0);
    }
    
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

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold">
            Subscription Management
          </CardTitle>
          <Link href="/subscriptions">
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
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(subscriptions && subscriptions.length > 0 ? 
                subscriptions.slice(0, 3) : 
                demoSubscriptions
              ).map((subscription) => (
                <div 
                  key={subscription.id} 
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="bg-gray-100 p-2 rounded-lg mr-3">
                        {subscription.icon || getSubscriptionIcon(subscription.name)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{subscription.name}</p>
                        <p className="text-xs text-gray-500">{subscription.category}</p>
                      </div>
                    </div>
                    {getStatusBadge(subscription.status, 
                      subscription.name === "Fitness Plus" ? "low" : undefined)}
                  </div>
                  <div className="mt-3 flex justify-between items-center">
                    <p className="font-semibold text-gray-900">
                      {typeof subscription.amount === 'number' 
                        ? formatPrice(subscription.amount, subscription.billingCycle) 
                        : subscription.amount}
                    </p>
                    <Button 
                      variant="link" 
                      className="text-xs text-red-500 font-medium p-0 h-auto hover:no-underline"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-5 bg-blue-50 p-4 rounded-lg border border-blue-100">
              <div className="flex items-start">
                <div className="bg-primary bg-opacity-10 p-2 rounded-full mr-3 flex-shrink-0">
                  <Lightbulb className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Subscription Insight</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    You're spending ${totalMonthlyCost.toFixed(2)}/month on subscriptions. 
                    {totalMonthlyCost > 50 ? " We found a potential savings of $14.99 based on usage patterns." : 
                      " Your subscription spending is well-managed."}
                  </p>
                  <Button 
                    variant="link" 
                    className="mt-2 text-xs text-primary font-medium p-0 h-auto"
                  >
                    See recommendations
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
