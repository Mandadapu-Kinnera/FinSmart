import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertBillSchema, insertBudgetSchema, insertGoalSchema, insertSubscriptionSchema, insertTransactionSchema } from "@shared/schema";
import OpenAI from 'openai';

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // Transactions routes
  app.get("/api/transactions", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    try {
      const transactions = await storage.getTransactions(req.user!.id);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch transactions", error });
    }
  });

  app.post("/api/transactions", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    try {
      const parsedData = insertTransactionSchema.parse({
        ...req.body,
        userId: req.user!.id
      });
      
      const transaction = await storage.createTransaction(parsedData);
      res.status(201).json(transaction);
    } catch (error) {
      res.status(400).json({ message: "Failed to create transaction", error });
    }
  });

  app.put("/api/transactions/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    try {
      const id = parseInt(req.params.id);
      const transaction = await storage.getTransactionById(id);
      
      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      
      if (transaction.userId !== req.user!.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const updatedTransaction = await storage.updateTransaction(
        id, 
        req.body
      );
      
      res.json(updatedTransaction);
    } catch (error) {
      res.status(400).json({ message: "Failed to update transaction", error });
    }
  });

  app.delete("/api/transactions/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    try {
      const id = parseInt(req.params.id);
      const transaction = await storage.getTransactionById(id);
      
      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      
      if (transaction.userId !== req.user!.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      await storage.deleteTransaction(id);
      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ message: "Failed to delete transaction", error });
    }
  });

  // Categories routes
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories", error });
    }
  });

  // Budget routes
  app.get("/api/budgets", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    try {
      const budgets = await storage.getBudgets(req.user!.id);
      res.json(budgets);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch budgets", error });
    }
  });

  app.post("/api/budgets", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    try {
      const parsedData = insertBudgetSchema.parse({
        ...req.body,
        userId: req.user!.id
      });
      
      const budget = await storage.createBudget(parsedData);
      res.status(201).json(budget);
    } catch (error) {
      res.status(400).json({ message: "Failed to create budget", error });
    }
  });

  app.put("/api/budgets/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    try {
      const id = parseInt(req.params.id);
      const budget = await storage.getBudgetById(id);
      
      if (!budget) {
        return res.status(404).json({ message: "Budget not found" });
      }
      
      if (budget.userId !== req.user!.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const updatedBudget = await storage.updateBudget(id, req.body);
      res.json(updatedBudget);
    } catch (error) {
      res.status(400).json({ message: "Failed to update budget", error });
    }
  });

  app.delete("/api/budgets/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    try {
      const id = parseInt(req.params.id);
      const budget = await storage.getBudgetById(id);
      
      if (!budget) {
        return res.status(404).json({ message: "Budget not found" });
      }
      
      if (budget.userId !== req.user!.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      await storage.deleteBudget(id);
      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ message: "Failed to delete budget", error });
    }
  });

  // Bills routes
  app.get("/api/bills", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    try {
      const bills = await storage.getBills(req.user!.id);
      res.json(bills);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch bills", error });
    }
  });

  app.post("/api/bills", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    try {
      const parsedData = insertBillSchema.parse({
        ...req.body,
        userId: req.user!.id
      });
      
      const bill = await storage.createBill(parsedData);
      res.status(201).json(bill);
    } catch (error) {
      res.status(400).json({ message: "Failed to create bill", error });
    }
  });

  app.put("/api/bills/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    try {
      const id = parseInt(req.params.id);
      const bill = await storage.getBillById(id);
      
      if (!bill) {
        return res.status(404).json({ message: "Bill not found" });
      }
      
      if (bill.userId !== req.user!.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const updatedBill = await storage.updateBill(id, req.body);
      res.json(updatedBill);
    } catch (error) {
      res.status(400).json({ message: "Failed to update bill", error });
    }
  });

  app.delete("/api/bills/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    try {
      const id = parseInt(req.params.id);
      const bill = await storage.getBillById(id);
      
      if (!bill) {
        return res.status(404).json({ message: "Bill not found" });
      }
      
      if (bill.userId !== req.user!.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      await storage.deleteBill(id);
      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ message: "Failed to delete bill", error });
    }
  });

  // Subscriptions routes
  app.get("/api/subscriptions", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    try {
      const subscriptions = await storage.getSubscriptions(req.user!.id);
      res.json(subscriptions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch subscriptions", error });
    }
  });

  app.post("/api/subscriptions", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    try {
      const parsedData = insertSubscriptionSchema.parse({
        ...req.body,
        userId: req.user!.id
      });
      
      const subscription = await storage.createSubscription(parsedData);
      res.status(201).json(subscription);
    } catch (error) {
      res.status(400).json({ message: "Failed to create subscription", error });
    }
  });

  app.put("/api/subscriptions/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    try {
      const id = parseInt(req.params.id);
      const subscription = await storage.getSubscriptionById(id);
      
      if (!subscription) {
        return res.status(404).json({ message: "Subscription not found" });
      }
      
      if (subscription.userId !== req.user!.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const updatedSubscription = await storage.updateSubscription(id, req.body);
      res.json(updatedSubscription);
    } catch (error) {
      res.status(400).json({ message: "Failed to update subscription", error });
    }
  });

  app.delete("/api/subscriptions/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    try {
      const id = parseInt(req.params.id);
      const subscription = await storage.getSubscriptionById(id);
      
      if (!subscription) {
        return res.status(404).json({ message: "Subscription not found" });
      }
      
      if (subscription.userId !== req.user!.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      await storage.deleteSubscription(id);
      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ message: "Failed to delete subscription", error });
    }
  });

  // Goals routes
  app.get("/api/goals", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    try {
      const goals = await storage.getGoals(req.user!.id);
      res.json(goals);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch goals", error });
    }
  });

  app.post("/api/goals", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    try {
      const parsedData = insertGoalSchema.parse({
        ...req.body,
        userId: req.user!.id
      });
      
      const goal = await storage.createGoal(parsedData);
      res.status(201).json(goal);
    } catch (error) {
      res.status(400).json({ message: "Failed to create goal", error });
    }
  });

  app.put("/api/goals/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    try {
      const id = parseInt(req.params.id);
      const goal = await storage.getGoalById(id);
      
      if (!goal) {
        return res.status(404).json({ message: "Goal not found" });
      }
      
      if (goal.userId !== req.user!.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const updatedGoal = await storage.updateGoal(id, req.body);
      res.json(updatedGoal);
    } catch (error) {
      res.status(400).json({ message: "Failed to update goal", error });
    }
  });

  app.delete("/api/goals/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    try {
      const id = parseInt(req.params.id);
      const goal = await storage.getGoalById(id);
      
      if (!goal) {
        return res.status(404).json({ message: "Goal not found" });
      }
      
      if (goal.userId !== req.user!.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      await storage.deleteGoal(id);
      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ message: "Failed to delete goal", error });
    }
  });

  // Export data endpoint
  app.get("/api/export/data", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    try {
      const user = req.user;
      const userId = user.id;

      // Get all user data
      const transactions = await storage.getTransactionsByUserId(userId);
      const budgets = await storage.getBudgetsByUserId(userId);
      const bills = await storage.getBillsByUserId(userId);
      const subscriptions = await storage.getSubscriptionsByUserId(userId);
      const goals = await storage.getGoalsByUserId(userId);

      // Create comprehensive export data
      const exportData = {
        user: {
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email
        },
        transactions: transactions || [],
        budgets: budgets || [],
        bills: bills || [],
        subscriptions: subscriptions || [],
        goals: goals || [],
        exportDate: new Date().toISOString(),
        totalTransactions: (transactions || []).length,
        totalBudgets: (budgets || []).length,
        totalBills: (bills || []).length,
        summary: {
          totalIncome: (transactions || [])
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0),
          totalExpenses: (transactions || [])
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0),
          totalBudgetAmount: (budgets || [])
            .reduce((sum, b) => sum + b.amount, 0),
          monthlyBillTotal: (bills || [])
            .reduce((sum, b) => sum + b.amount, 0),
        }
      };

      // Set headers for file download
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="finsmart-data-${new Date().toISOString().split('T')[0]}.json"`);
      
      res.json(exportData);
    } catch (error) {
      console.error("Export error:", error);
      res.status(500).json({ error: "Failed to export data" });
    }
  });

  // Export transactions as CSV endpoint
  app.get("/api/export/transactions-csv", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    try {
      const userId = req.user.id;
      const transactions = await storage.getTransactionsByUserId(userId);

      if (!transactions || transactions.length === 0) {
        return res.status(404).json({ error: "No transactions found" });
      }

      // Convert transactions to CSV
      const csvHeaders = ['Date', 'Description', 'Amount', 'Type', 'Category'];
      const csvRows = transactions.map(t => [
        new Date(t.date).toISOString().split('T')[0],
        `"${t.description || ''}"`,
        t.amount,
        t.type,
        t.category || ''
      ]);

      const csvContent = [
        csvHeaders.join(','),
        ...csvRows.map(row => row.join(','))
      ].join('\n');

      // Set headers for CSV download
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="transactions-${new Date().toISOString().split('T')[0]}.csv"`);
      
      res.send(csvContent);
    } catch (error) {
      console.error("CSV export error:", error);
      res.status(500).json({ error: "Failed to export CSV" });
    }
  });

  // Generate and download user guide
  app.get("/api/export/guide", async (req, res) => {
    try {
      const userGuide = {
        title: "FinSmart Complete User Guide",
        version: "1.0",
        date: new Date().toISOString().split('T')[0],
        content: `# FinSmart Complete User Guide

## Getting Started
Welcome to FinSmart - your comprehensive financial management platform.
1. Create your account and complete the setup process
2. Add your first transaction to start tracking expenses
3. Set up budgets to control spending in different categories
4. Configure bill reminders for recurring payments

## Dashboard Overview
The dashboard provides a complete overview of your financial health:
• Total balance and monthly income/expense summary
• Recent transactions and upcoming bill payments
• Budget progress and spending insights
• Quick actions to add transactions or pay bills

## Transactions Management
Track all your financial activities:
• Add income and expense transactions
• Categorize transactions for better organization
• Use the search and filter features to find specific records
• Export transaction data for external analysis

## Budget Planning
Create and manage budgets effectively:
• Set spending limits for different categories
• Monitor progress with visual indicators
• Receive alerts when approaching limits
• Adjust budgets based on spending patterns

## Bill Management
Never miss a payment again:
• Add recurring bills with due dates
• Set up payment reminders
• Track payment history
• Manage utility, rent, and subscription payments

## Goals & Savings
Achieve your financial objectives:
• Set savings goals with target amounts
• Track progress towards your goals
• Get motivational insights and tips
• Plan for major purchases or emergencies

## AI Assistant
Get intelligent help with your finances:
• Ask questions about budgeting and saving
• Get currency conversion (USD to INR)
• Report security concerns for immediate assistance
• Receive personalized financial advice

## Security & Privacy
Your financial data is protected:
• Bank-level encryption for all data
• Secure authentication and session management
• Regular security updates and monitoring
• Contact fraud helpline: 1-800-FRAUD-HELP for security concerns

## Support
Need help? Contact us:
• Email: support@finsmart.com
• Phone: 1-800-FINSMART
• Live Chat: Available 24/7 through the AI Assistant
• Emergency Security Line: 1-800-FRAUD-HELP
`
      };

      // Set headers for text file download
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="finsmart-user-guide-${userGuide.date}.txt"`);
      
      res.send(userGuide.content);
    } catch (error) {
      console.error("Guide export error:", error);
      res.status(500).json({ error: "Failed to generate user guide" });
    }
  });

  // AI Chat API for help & support
  app.post("/api/chat", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    try {
      const { message, context = [] } = req.body;
      
      if (!message || typeof message !== 'string') {
        return res.status(400).json({ message: "Message is required" });
      }

      // Financial FAQ knowledge base
      const financialContext = `
You are FinSmart AI Assistant, a helpful financial chatbot for a personal finance management app. You help users with:

1. FAQ RESOLUTION:
- Password reset: "Go to Settings > Account > Change Password"
- Account management and KYC updates
- Understanding interest rates and financial terms
- App navigation and feature explanations

2. FINANCIAL GUIDANCE:
- Budget creation and management tips
- Transaction categorization help
- Savings goal strategies
- Bill payment reminders and setup
- Subscription management advice

3. CURRENCY CONVERSION:
- Convert USD to INR using current rates (approx 1 USD = 83 INR)
- Explain exchange rate fluctuations

4. APP FEATURES:
- Dashboard overview and insights
- Transaction tracking best practices
- Budget alerts and notifications
- Goal setting and progress tracking

Always be helpful, professional, and security-conscious. If users seem frustrated or need complex help, suggest contacting live support.
`;

      // Try OpenRouter first, fallback to OpenAI
      let aiResponse;
      
      if (process.env.OPENROUTER_API_KEY) {
        // Use OpenRouter API
        try {
          const openrouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
              'Content-Type': 'application/json',
              'HTTP-Referer': 'https://finsmart.app',
              'X-Title': 'FinSmart AI Assistant'
            },
            body: JSON.stringify({
              model: 'anthropic/claude-3.5-sonnet',
              messages: [
                {
                  role: 'system',
                  content: financialContext
                },
                {
                  role: 'user', 
                  content: message
                }
              ],
              max_tokens: 500,
              temperature: 0.7
            })
          });

          if (openrouterResponse.ok) {
            const data = await openrouterResponse.json();
            aiResponse = data.choices[0].message.content;
          } else {
            throw new Error(`OpenRouter API error: ${openrouterResponse.status}`);
          }
        } catch (openrouterError) {
          console.log('OpenRouter failed, trying OpenAI...', openrouterError.message);
          
          // Fallback to OpenAI
          const openai = new OpenAI({ 
            apiKey: process.env.OPENAI_API_KEY 
          });
          
          const openaiResponse = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: message }
            ],
            max_tokens: 500,
            temperature: 0.7,
          });
          
          aiResponse = openaiResponse.choices[0].message.content;
        }
      } else {
        // Use OpenAI directly
        const openai = new OpenAI({ 
          apiKey: process.env.OPENAI_API_KEY 
        });
        
        const openaiResponse = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            { role: "system", content: financialContext },
            { role: "user", content: message }
          ],
          max_tokens: 500,
          temperature: 0.7,
        });
        
        aiResponse = openaiResponse.choices[0].message.content;
      }

      // Fraud detection keywords
      const fraudKeywords = [
        'suspicious transaction', 'unauthorized access', 'someone accessed', 
        'account compromised', 'strange activity', 'fraud', 'scam', 'hack',
        'stolen', 'identity theft', 'phishing'
      ];
      
      // Check for fraud concerns
      const lowerMessage = message.toLowerCase();
      const isFraudConcern = fraudKeywords.some(keyword => lowerMessage.includes(keyword));
      
      if (isFraudConcern) {
        return res.json({
          response: "I understand you have security concerns. For your account safety, I'm escalating this to our security team. Please contact our fraud helpline immediately at 1-800-FRAUD-HELP or email security@finsmart.com. In the meantime, consider changing your password and reviewing recent transactions.",
          escalate: true,
          priority: "high",
          category: "fraud"
        });
      }

      // Use the AI response from OpenRouter or OpenAI above
      const response = aiResponse;
      
      // Sentiment analysis for escalation
      const frustrationKeywords = ['frustrated', 'angry', 'terrible', 'awful', 'hate', 'worst', 'useless'];
      const isFrustrated = frustrationKeywords.some(keyword => lowerMessage.includes(keyword));

      res.json({
        response: response,
        escalate: isFrustrated,
        priority: isFrustrated ? "medium" : "low",
        category: "support"
      });

    } catch (error) {
      console.error("Chat API error:", error);
      
      // Handle specific OpenAI errors
      if (error.code === 'insufficient_quota') {
        return res.json({
          response: "I'm currently experiencing API limitations. However, I can still help you with basic queries:\n\n🔒 For security concerns: Contact our fraud helpline at 1-800-FRAUD-HELP\n💱 USD to INR: Current rate is approximately 1 USD = 83 INR\n📱 Password reset: Go to Settings > Account > Change Password\n💰 Budget help: Visit the Budgets section to create spending limits\n📊 Transaction help: Add transactions in the Transactions section\n\nFor complex queries, please contact our support team directly.",
          escalate: false,
          priority: "low",
          category: "support"
        });
      }
      
      // Fallback response system
      const lowerMessage = message.toLowerCase();
      let response = "I'm experiencing technical difficulties with the AI service. Let me provide some basic assistance:\n\n";
      
      if (lowerMessage.includes('fraud') || lowerMessage.includes('suspicious') || lowerMessage.includes('hack')) {
        response = "🚨 SECURITY ALERT: For immediate assistance with security concerns, please:\n• Call our fraud helpline: 1-800-FRAUD-HELP\n• Email: security@finsmart.com\n• Change your password immediately in Settings\n• Review recent transactions for unauthorized activity";
        return res.json({
          response,
          escalate: true,
          priority: "high",
          category: "fraud"
        });
      }
      
      if (lowerMessage.includes('usd') || lowerMessage.includes('inr') || lowerMessage.includes('convert')) {
        const numbers = lowerMessage.match(/\d+/g);
        if (numbers) {
          const amount = parseFloat(numbers[0]);
          const converted = (amount * 83).toFixed(2);
          response = `${amount} USD = ₹${converted} INR (Rate: 1 USD = 83 INR)\n\nNote: This is an approximate rate. For real-time rates, please check financial websites.`;
        } else {
          response = "Current exchange rate: 1 USD = 83 INR (approximate)\nPlease specify an amount to convert.";
        }
      }
      else if (lowerMessage.includes('password') || lowerMessage.includes('reset')) {
        response = "To reset your password:\n1. Go to Settings > Account\n2. Click 'Change Password'\n3. Enter current password\n4. Set new secure password\n5. Save changes";
      }
      else if (lowerMessage.includes('budget')) {
        response = "Budget Management:\n1. Go to Budgets section\n2. Click 'Add Budget'\n3. Set spending limits by category\n4. Track progress on dashboard\n5. Get alerts when approaching limits";
      }
      else if (lowerMessage.includes('transaction')) {
        response = "Transaction Management:\n1. Go to Transactions section\n2. Click 'Add Transaction'\n3. Enter amount and description\n4. Select category (Food, Transport, etc.)\n5. Choose Income or Expense type";
      }
      else {
        response += "• Budget help: Create spending limits in Budgets section\n• Transaction tracking: Add income/expenses in Transactions\n• Bill reminders: Set up in Bills section\n• Currency conversion: Ask 'Convert X USD to INR'\n• Security issues: Call 1-800-FRAUD-HELP immediately\n\nFor detailed assistance, please contact our support team.";
      }
      
      res.json({
        response,
        escalate: false,
        priority: "low",
        category: "support"
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
