import { useState, useEffect } from "react";
import { Sidebar } from "@/components/ui/sidebar";
import { NotificationPanel } from "@/components/ui/notification-panel";
import SummaryCards from "@/components/dashboard/summary-cards";
import SpendingAnalytics from "@/components/dashboard/spending-analytics";
import CategoryBreakdown from "@/components/dashboard/category-breakdown";
import RecentTransactions from "@/components/dashboard/recent-transactions";
import AiRecommendations from "@/components/dashboard/ai-recommendations";
import UpcomingBills from "@/components/dashboard/upcoming-bills";
import SubscriptionOverview from "@/components/dashboard/subscription-overview";
import IncomeExpenseGraph from "@/components/dashboard/income-expense-graph";
import { BillPaymentAlert } from "@/components/bill-payment-alert";
import { useAuth } from "@/hooks/use-auth";
import { Bell, Menu, ChartLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Bill } from "@shared/schema";

export default function Dashboard() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { user } = useAuth();

  // Fetch bills for the alarm system
  const { data: bills } = useQuery<Bill[]>({
    queryKey: ["/api/bills"],
    enabled: !!user // Only fetch if user is logged in
  });

  // User initials from name or username
  const userInitials = user?.firstName && user?.lastName 
    ? `${user.firstName[0]}${user.lastName[0]}`
    : user?.username?.substring(0, 2).toUpperCase() || 'U';
  
  const userFirstName = user?.firstName || user?.username?.split(' ')[0] || 'User';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ChartLine className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold text-gray-900 hidden md:inline-block">FinSmart</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative" 
              onClick={() => setShowNotifications(true)}
            >
              <Bell className="h-5 w-5 text-gray-500" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-red-500">
                3
              </Badge>
            </Button>
            
            <div className="hidden md:flex items-center space-x-2">
              <div className="h-8 w-8 bg-primary text-white rounded-full flex items-center justify-center">
                <span>{userInitials}</span>
              </div>
              <span className="font-medium text-gray-900">{user?.firstName} {user?.lastName}</span>
            </div>
            
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
          <div className="pb-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome back, {userFirstName}! Here's your financial overview.</p>
          </div>

          {/* Dashboard Content */}
          <div className="pt-6 space-y-8">
            <SummaryCards />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <SpendingAnalytics />
              </div>
              <div>
                <CategoryBreakdown />
              </div>
            </div>
            
            <IncomeExpenseGraph />
            
            <RecentTransactions />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AiRecommendations />
              <UpcomingBills />
            </div>
            
            <SubscriptionOverview />
            
            <div className="mt-8 pb-10">
              <p className="text-sm text-gray-500 text-center">FinSmart • Smart Budgeting & Expense Management</p>
            </div>
          </div>
        </main>
      </div>

      {/* Bill Payment Alarms */}
      {bills && bills.length > 0 && (
        <BillPaymentAlert bills={bills} />
      )}

      {/* Notifications Panel */}
      <NotificationPanel 
        open={showNotifications} 
        onClose={() => setShowNotifications(false)} 
      />
    </div>
  );
}
