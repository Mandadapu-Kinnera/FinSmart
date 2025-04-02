import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Wallet, HandCoins, CreditCard, PiggyBank } from "lucide-react";
import { Transaction } from "@shared/schema";

export default function SummaryCards() {
  const { data: transactions } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });

  // Calculate financial metrics based on transactions
  const calculateMetrics = () => {
    if (!transactions) {
      return {
        totalBalance: 4250.85,  // Default values for demonstration
        monthlyIncome: 3850.00,
        monthlySpending: 2254.12,
        savingsRate: 41.5
      };
    }

    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Filter transactions for the current month
    const thisMonthTransactions = transactions.filter(
      t => new Date(t.date) >= firstDayOfMonth
    );
    
    const income = thisMonthTransactions
      .filter(t => !t.isExpense)
      .reduce((sum, t) => sum + t.amount, 0);
    
    const spending = thisMonthTransactions
      .filter(t => t.isExpense)
      .reduce((sum, t) => sum + t.amount, 0);
    
    const balance = income - spending;
    const savingsRate = income > 0 ? ((income - spending) / income) * 100 : 0;
    
    return {
      totalBalance: balance,
      monthlyIncome: income,
      monthlySpending: spending,
      savingsRate: parseFloat(savingsRate.toFixed(1))
    };
  };

  const { totalBalance, monthlyIncome, monthlySpending, savingsRate } = calculateMetrics();

  // Format currency values
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const summaryCards = [
    {
      title: "Total Balance",
      value: formatCurrency(totalBalance),
      change: "+2.5%",
      period: "from last month",
      icon: <Wallet className="text-primary" />,
      iconBg: "bg-primary/10",
      changeColor: "text-green-500"
    },
    {
      title: "Monthly Income",
      value: formatCurrency(monthlyIncome),
      change: "+5.2%",
      period: "from last month",
      icon: <HandCoins className="text-green-500" />,
      iconBg: "bg-green-100",
      changeColor: "text-green-500"
    },
    {
      title: "Monthly Spending",
      value: formatCurrency(monthlySpending),
      change: "+8.4%",
      period: "from last month",
      icon: <CreditCard className="text-red-500" />,
      iconBg: "bg-red-100",
      changeColor: "text-red-500"
    },
    {
      title: "Savings Rate",
      value: `${savingsRate}%`,
      change: "+3.8%",
      period: "from last month",
      icon: <PiggyBank className="text-amber-500" />,
      iconBg: "bg-amber-100",
      changeColor: "text-green-500"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {summaryCards.map((card, index) => (
        <Card key={index}>
          <CardContent className="pt-5">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm">{card.title}</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">{card.value}</h3>
              </div>
              <div className={`p-2 rounded-lg ${card.iconBg}`}>
                {card.icon}
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <span className={`flex items-center ${card.changeColor}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                </svg>
                {card.change}
              </span>
              <span className="text-gray-500 ml-2">{card.period}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
