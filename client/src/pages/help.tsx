import { useState, useEffect } from "react";
import { Sidebar } from "@/components/ui/sidebar";
import { Chatbot } from "@/components/chatbot/chatbot";
import { useLocation } from "wouter";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  HelpCircle, 
  FileText, 
  MessageSquare, 
  Menu, 
  ChartLine,
  BookOpen,
  MessageSquareText
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Help() {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [activeTab, setActiveTab] = useState("chatbot");
  const [location] = useLocation();
  
  useEffect(() => {
    // Check URL for tab parameter
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    
    // Set the active tab if a valid tab parameter is provided
    if (tabParam && ['chatbot', 'faq', 'guide'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [location]);

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
          <div className="pb-6">
            <h1 className="text-2xl font-bold text-gray-900">Help & Support</h1>
            <p className="text-gray-600 mt-1">
              Get assistance with FinSmart features and functionalities
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="bg-white border shadow-sm mb-6">
              <TabsTrigger value="chatbot" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                <MessageSquareText className="h-4 w-4 mr-2" />
                Chat Assistant
              </TabsTrigger>
              <TabsTrigger value="faq" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                <HelpCircle className="h-4 w-4 mr-2" />
                FAQs
              </TabsTrigger>
              <TabsTrigger value="guide" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                <BookOpen className="h-4 w-4 mr-2" />
                User Guide
              </TabsTrigger>
            </TabsList>

            {/* Chat Assistant */}
            <TabsContent value="chatbot" className="space-y-4">
              <div className="max-w-3xl mx-auto">
                <Chatbot />
              </div>
            </TabsContent>

            {/* FAQs */}
            <TabsContent value="faq" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Frequently Asked Questions</CardTitle>
                  <CardDescription>
                    Find answers to common questions about using FinSmart
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-medium text-gray-900 mb-2">How do I create a budget?</h3>
                      <p className="text-gray-600">
                        To create a budget, go to the Budgets section and click "Add Budget". You can set amounts for different 
                        categories and track your spending against these limits.
                      </p>
                    </div>
                    
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-medium text-gray-900 mb-2">How do I add a transaction?</h3>
                      <p className="text-gray-600">
                        Go to the Transactions page and click the "Add Transaction" button. Fill in the details like amount, 
                        description, category, and date.
                      </p>
                    </div>
                    
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-medium text-gray-900 mb-2">How do I set up bill reminders?</h3>
                      <p className="text-gray-600">
                        You can manage your bills in the Bills section. Add a new bill with amount and due date to receive 
                        reminders before the payment is due.
                      </p>
                    </div>
                    
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-medium text-gray-900 mb-2">How do I track my subscriptions?</h3>
                      <p className="text-gray-600">
                        Track your subscriptions in the Subscriptions section. Add your recurring payments to see your 
                        monthly subscription expenses and get insights on potential savings.
                      </p>
                    </div>
                    
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-medium text-gray-900 mb-2">How do I set financial goals?</h3>
                      <p className="text-gray-600">
                        Set financial goals in the Goals section. Define a target amount and deadline, and the app will 
                        help you track your progress and suggest saving strategies.
                      </p>
                    </div>
                    
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-medium text-gray-900 mb-2">How do I update my profile information?</h3>
                      <p className="text-gray-600">
                        You can update your profile information in Settings &rarr; Account. You can change personal details, 
                        password, and notification preferences.
                      </p>
                    </div>
                    
                    <div className="p-4 border rounded-lg bg-red-50 border-red-200">
                      <h3 className="font-medium text-red-900 mb-2">🔒 How do I report suspicious activity?</h3>
                      <p className="text-red-800">
                        If you notice unauthorized transactions or suspicious account activity, immediately use our AI chatbot 
                        with keywords like "suspicious transaction" or "fraud". The system will automatically escalate your 
                        concern to our security team. You can also call our fraud helpline: 1-800-FRAUD-HELP
                      </p>
                    </div>
                    
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-medium text-gray-900 mb-2">How do I convert USD to INR?</h3>
                      <p className="text-gray-600">
                        Our AI assistant can convert currencies in real-time. Simply ask "Convert X USD to INR" in the chat, 
                        and you'll get the current exchange rate and converted amount. The rates are updated regularly.
                      </p>
                    </div>
                    
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-medium text-gray-900 mb-2">What is KYC and how do I update it?</h3>
                      <p className="text-gray-600">
                        KYC (Know Your Customer) verification helps secure your account. To update your KYC information, 
                        go to Settings &rarr; Account Verification and follow the prompts to upload required documents.
                      </p>
                    </div>
                    
                    <div className="p-4 border rounded-lg bg-orange-50 border-orange-200">
                      <h3 className="font-medium text-orange-900 mb-2">⚠️ When will I be escalated to human support?</h3>
                      <p className="text-orange-800">
                        Our AI automatically escalates conversations to human agents when: you express frustration, 
                        report security concerns, or ask complex questions beyond basic FAQ topics. You'll be notified 
                        when escalation occurs and can expect follow-up within 24 hours.
                      </p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4 items-center">
                  <p className="text-sm text-gray-500">
                    Don't see your question here? Try our Chat Assistant for personalized help.
                  </p>
                  <Button 
                    onClick={() => setActiveTab("chatbot")}
                    className="bg-primary text-white hover:bg-primary/90"
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Chat with Assistant
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* User Guide */}
            <TabsContent value="guide" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>User Guide</CardTitle>
                  <CardDescription>
                    Learn how to use all features with our comprehensive guide
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Getting Started</h3>
                      <div className="p-4 border rounded-lg space-y-2">
                        <p className="text-gray-600">
                          Welcome to FinSmart, your personal finance management app. Here's a quick overview of the main features:
                        </p>
                        <ul className="list-disc list-inside space-y-1 text-gray-600 pl-4">
                          <li>Dashboard: Get an overview of your financial situation</li>
                          <li>Transactions: Record and categorize your income and expenses</li>
                          <li>Budgets: Set spending limits for different categories</li>
                          <li>Goals: Set up and track your financial goals</li>
                          <li>Bills: Manage and get reminders for your bills</li>
                          <li>Subscriptions: Track your recurring payments</li>
                        </ul>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Dashboard</h3>
                      <div className="p-4 border rounded-lg">
                        <p className="text-gray-600">
                          The Dashboard provides a quick overview of your financial health. Here you can see your spending by 
                          category, upcoming bills, budget progress, and recent transactions. Use the date filters to view data 
                          for different time periods.
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Transactions</h3>
                      <div className="p-4 border rounded-lg">
                        <p className="text-gray-600">
                          The Transactions page lets you record all your financial activities. Click "Add Transaction" 
                          to create a new entry. You can categorize transactions, add descriptions, and filter by date or category.
                          Use the transaction type (income/expense) to differentiate between money coming in and going out.
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Budgets</h3>
                      <div className="p-4 border rounded-lg">
                        <p className="text-gray-600">
                          Create budgets to set spending limits for different categories. The Budgets page shows your progress 
                          for each budget with visual indicators. You can create, edit, or delete budgets as needed.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4 items-center">
                  <Button variant="outline">
                    <FileText className="mr-2 h-4 w-4" />
                    Download Full Guide
                  </Button>
                  <p className="text-sm text-gray-500 mt-2">
                    Have specific questions about using the app?
                  </p>
                  <Button 
                    onClick={() => setActiveTab("chatbot")}
                    className="bg-primary text-white hover:bg-primary/90 w-auto"
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Ask Our AI Assistant
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}