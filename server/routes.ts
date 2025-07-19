import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertBillSchema, insertBudgetSchema, insertGoalSchema, insertSubscriptionSchema, insertTransactionSchema } from "@shared/schema";

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

  // AI Chat API for help & support
  app.post("/api/chat", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Unauthorized");
    
    try {
      const { message, context = [] } = req.body;
      
      if (!message || typeof message !== 'string') {
        return res.status(400).json({ message: "Message is required" });
      }

      // Import OpenAI here to avoid loading it if not needed
      const OpenAI = require('openai');
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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

      // Build conversation context
      const messages = [
        { role: "system", content: financialContext },
        ...context.slice(-10), // Last 10 messages for context
        { role: "user", content: message }
      ];

      const completion = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: messages,
        max_tokens: 500,
        temperature: 0.7,
      });

      const response = completion.choices[0].message.content;
      
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
      res.status(500).json({ 
        message: "I'm having trouble processing your request right now. Please try again or contact our support team.",
        error: error.message 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
