import { 
  User, InsertUser, 
  Transaction, InsertTransaction,
  Category, InsertCategory,
  Budget, InsertBudget,
  Bill, InsertBill,
  Subscription, InsertSubscription,
  Goal, InsertGoal
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import connectPg from "connect-pg-simple";
import pg from "pg";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { users, transactions, categories, budgets, bills, subscriptions, goals } from "@shared/schema";
import { pool } from "./db";

const MemoryStore = createMemoryStore(session);
const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Transaction operations
  getTransactions(userId: number): Promise<Transaction[]>;
  getTransactionById(id: number): Promise<Transaction | undefined>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransaction(id: number, transaction: Partial<InsertTransaction>): Promise<Transaction | undefined>;
  deleteTransaction(id: number): Promise<boolean>;

  // Category operations
  getCategories(): Promise<Category[]>;
  getCategoryById(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;

  // Budget operations
  getBudgets(userId: number): Promise<Budget[]>;
  getBudgetById(id: number): Promise<Budget | undefined>;
  createBudget(budget: InsertBudget): Promise<Budget>;
  updateBudget(id: number, budget: Partial<InsertBudget>): Promise<Budget | undefined>;
  deleteBudget(id: number): Promise<boolean>;

  // Bill operations
  getBills(userId: number): Promise<Bill[]>;
  getBillById(id: number): Promise<Bill | undefined>;
  createBill(bill: InsertBill): Promise<Bill>;
  updateBill(id: number, bill: Partial<InsertBill>): Promise<Bill | undefined>;
  deleteBill(id: number): Promise<boolean>;

  // Subscription operations
  getSubscriptions(userId: number): Promise<Subscription[]>;
  getSubscriptionById(id: number): Promise<Subscription | undefined>;
  createSubscription(subscription: InsertSubscription): Promise<Subscription>;
  updateSubscription(id: number, subscription: Partial<InsertSubscription>): Promise<Subscription | undefined>;
  deleteSubscription(id: number): Promise<boolean>;

  // Goal operations
  getGoals(userId: number): Promise<Goal[]>;
  getGoalById(id: number): Promise<Goal | undefined>;
  createGoal(goal: InsertGoal): Promise<Goal>;
  updateGoal(id: number, goal: Partial<InsertGoal>): Promise<Goal | undefined>;
  deleteGoal(id: number): Promise<boolean>;

  // Session store
  sessionStore: any; // Using any to bypass type error
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private transactions: Map<number, Transaction>;
  private categories: Map<number, Category>;
  private budgets: Map<number, Budget>;
  private bills: Map<number, Bill>;
  private subscriptions: Map<number, Subscription>;
  private goals: Map<number, Goal>;
  
  private userIdCounter: number;
  private transactionIdCounter: number;
  private categoryIdCounter: number;
  private budgetIdCounter: number;
  private billIdCounter: number;
  private subscriptionIdCounter: number;
  private goalIdCounter: number;
  
  sessionStore: any;
  
  constructor() {
    this.users = new Map();
    this.transactions = new Map();
    this.categories = new Map();
    this.budgets = new Map();
    this.bills = new Map();
    this.subscriptions = new Map();
    this.goals = new Map();
    
    this.userIdCounter = 1;
    this.transactionIdCounter = 1;
    this.categoryIdCounter = 1;
    this.budgetIdCounter = 1;
    this.billIdCounter = 1;
    this.subscriptionIdCounter = 1;
    this.goalIdCounter = 1;
    
    // Initialize default categories
    this.initDefaultCategories();
  }
  
  private initDefaultCategories() {
    const defaultCategories = [
      { name: "Food & Dining", color: "#f87171", icon: "utensils" },
      { name: "Transportation", color: "#60a5fa", icon: "car" },
      { name: "Housing", color: "#4ade80", icon: "home" },
      { name: "Entertainment", color: "#a78bfa", icon: "film" },
      { name: "Shopping", color: "#fbbf24", icon: "shopping-bag" },
      { name: "Utilities", color: "#a3e635", icon: "bolt" },
      { name: "Health", color: "#fb923c", icon: "heart-pulse" },
      { name: "Education", color: "#38bdf8", icon: "book" },
      { name: "Salary", color: "#2dd4bf", icon: "wallet" },
      { name: "Investments", color: "#e879f9", icon: "trending-up" }
    ];
    
    defaultCategories.forEach(cat => {
      const category: Category = {
        id: this.categoryIdCounter++,
        name: cat.name,
        color: cat.color,
        icon: cat.icon
      };
      this.categories.set(category.id, category);
    });
  }
  
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(u => u.username === username);
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = {
      id: this.userIdCounter++,
      username: insertUser.username,
      password: insertUser.password,
      firstName: insertUser.firstName || null,
      lastName: insertUser.lastName || null,
      email: insertUser.email || null,
      createdAt: new Date()
    };
    
    this.users.set(user.id, user);
    return user;
  }
  
  async getTransactions(userId: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).filter(t => t.userId === userId);
  }
  
  async getTransactionById(id: number): Promise<Transaction | undefined> {
    return this.transactions.get(id);
  }
  
  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const newTransaction: Transaction = {
      id: this.transactionIdCounter++,
      userId: transaction.userId,
      amount: transaction.amount,
      description: transaction.description,
      type: transaction.type || 'expense',
      date: transaction.date || new Date(),
      categoryId: transaction.categoryId || null,
      isExpense: transaction.isExpense || null,
      merchant: transaction.merchant || null
    };
    
    this.transactions.set(newTransaction.id, newTransaction);
    return newTransaction;
  }
  
  async updateTransaction(id: number, transaction: Partial<InsertTransaction>): Promise<Transaction | undefined> {
    const existingTransaction = this.transactions.get(id);
    
    if (!existingTransaction) {
      return undefined;
    }
    
    const updatedTransaction: Transaction = {
      ...existingTransaction,
      ...transaction
    };
    
    this.transactions.set(id, updatedTransaction);
    return updatedTransaction;
  }
  
  async deleteTransaction(id: number): Promise<boolean> {
    return this.transactions.delete(id);
  }
  
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }
  
  async getCategoryById(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }
  
  async createCategory(category: InsertCategory): Promise<Category> {
    const newCategory: Category = {
      id: this.categoryIdCounter++,
      ...category
    };
    
    this.categories.set(newCategory.id, newCategory);
    return newCategory;
  }
  
  async getBudgets(userId: number): Promise<Budget[]> {
    return Array.from(this.budgets.values()).filter(b => b.userId === userId);
  }
  
  async getBudgetById(id: number): Promise<Budget | undefined> {
    return this.budgets.get(id);
  }
  
  async createBudget(budget: InsertBudget): Promise<Budget> {
    const newBudget: Budget = {
      id: this.budgetIdCounter++,
      userId: budget.userId,
      name: budget.name,
      amount: budget.amount,
      period: budget.period,
      categoryId: budget.categoryId || null
    };
    
    this.budgets.set(newBudget.id, newBudget);
    return newBudget;
  }
  
  async updateBudget(id: number, budget: Partial<InsertBudget>): Promise<Budget | undefined> {
    const existingBudget = this.budgets.get(id);
    
    if (!existingBudget) {
      return undefined;
    }
    
    const updatedBudget: Budget = {
      ...existingBudget,
      ...budget
    };
    
    this.budgets.set(id, updatedBudget);
    return updatedBudget;
  }
  
  async deleteBudget(id: number): Promise<boolean> {
    return this.budgets.delete(id);
  }
  
  async getBills(userId: number): Promise<Bill[]> {
    return Array.from(this.bills.values()).filter(b => b.userId === userId);
  }
  
  async getBillById(id: number): Promise<Bill | undefined> {
    return this.bills.get(id);
  }
  
  async createBill(bill: InsertBill): Promise<Bill> {
    const newBill: Bill = {
      id: this.billIdCounter++,
      userId: bill.userId,
      name: bill.name,
      amount: bill.amount,
      dueDate: bill.dueDate,
      category: bill.category,
      isPaid: bill.isPaid || null,
      icon: bill.icon || null
    };
    
    this.bills.set(newBill.id, newBill);
    return newBill;
  }
  
  async updateBill(id: number, bill: Partial<InsertBill>): Promise<Bill | undefined> {
    const existingBill = this.bills.get(id);
    
    if (!existingBill) {
      return undefined;
    }
    
    const updatedBill: Bill = {
      ...existingBill,
      ...bill
    };
    
    this.bills.set(id, updatedBill);
    return updatedBill;
  }
  
  async deleteBill(id: number): Promise<boolean> {
    return this.bills.delete(id);
  }
  
  async getSubscriptions(userId: number): Promise<Subscription[]> {
    return Array.from(this.subscriptions.values()).filter(s => s.userId === userId);
  }
  
  async getSubscriptionById(id: number): Promise<Subscription | undefined> {
    return this.subscriptions.get(id);
  }
  
  async createSubscription(subscription: InsertSubscription): Promise<Subscription> {
    const newSubscription: Subscription = {
      id: this.subscriptionIdCounter++,
      userId: subscription.userId,
      name: subscription.name,
      amount: subscription.amount,
      category: subscription.category,
      billingCycle: subscription.billingCycle,
      icon: subscription.icon || null,
      status: subscription.status || null,
      nextBillingDate: subscription.nextBillingDate || null
    };
    
    this.subscriptions.set(newSubscription.id, newSubscription);
    return newSubscription;
  }
  
  async updateSubscription(id: number, subscription: Partial<InsertSubscription>): Promise<Subscription | undefined> {
    const existingSubscription = this.subscriptions.get(id);
    
    if (!existingSubscription) {
      return undefined;
    }
    
    const updatedSubscription: Subscription = {
      ...existingSubscription,
      ...subscription
    };
    
    this.subscriptions.set(id, updatedSubscription);
    return updatedSubscription;
  }
  
  async deleteSubscription(id: number): Promise<boolean> {
    return this.subscriptions.delete(id);
  }
  
  async getGoals(userId: number): Promise<Goal[]> {
    return Array.from(this.goals.values()).filter(g => g.userId === userId);
  }
  
  async getGoalById(id: number): Promise<Goal | undefined> {
    return this.goals.get(id);
  }
  
  async createGoal(goal: InsertGoal): Promise<Goal> {
    const newGoal: Goal = {
      id: this.goalIdCounter++,
      userId: goal.userId,
      name: goal.name,
      targetAmount: goal.targetAmount,
      icon: goal.icon || null,
      category: goal.category || null,
      currentAmount: goal.currentAmount || null,
      targetDate: goal.targetDate || null
    };
    
    this.goals.set(newGoal.id, newGoal);
    return newGoal;
  }
  
  async updateGoal(id: number, goal: Partial<InsertGoal>): Promise<Goal | undefined> {
    const existingGoal = this.goals.get(id);
    
    if (!existingGoal) {
      return undefined;
    }
    
    const updatedGoal: Goal = {
      ...existingGoal,
      ...goal
    };
    
    this.goals.set(id, updatedGoal);
    return updatedGoal;
  }
  
  async deleteGoal(id: number): Promise<boolean> {
    return this.goals.delete(id);
  }
}

export class DatabaseStorage implements IStorage {
  sessionStore: any;

  constructor() {
    // The sessionStore is set below in the try/catch block
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Transaction operations
  async getTransactions(userId: number): Promise<Transaction[]> {
    return db.select().from(transactions).where(eq(transactions.userId, userId));
  }

  async getTransactionById(id: number): Promise<Transaction | undefined> {
    const [transaction] = await db.select().from(transactions).where(eq(transactions.id, id));
    return transaction;
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const [newTransaction] = await db.insert(transactions).values(transaction).returning();
    return newTransaction;
  }

  async updateTransaction(id: number, transaction: Partial<InsertTransaction>): Promise<Transaction | undefined> {
    const [updatedTransaction] = await db.update(transactions)
      .set(transaction)
      .where(eq(transactions.id, id))
      .returning();
    
    return updatedTransaction;
  }

  async deleteTransaction(id: number): Promise<boolean> {
    const result = await db.delete(transactions).where(eq(transactions.id, id)).returning();
    return result.length > 0;
  }

  // Category operations
  async getCategories(): Promise<Category[]> {
    return db.select().from(categories);
  }

  async getCategoryById(id: number): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category;
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db.insert(categories).values(category).returning();
    return newCategory;
  }

  // Budget operations
  async getBudgets(userId: number): Promise<Budget[]> {
    return db.select().from(budgets).where(eq(budgets.userId, userId));
  }

  async getBudgetById(id: number): Promise<Budget | undefined> {
    const [budget] = await db.select().from(budgets).where(eq(budgets.id, id));
    return budget;
  }

  async createBudget(budget: InsertBudget): Promise<Budget> {
    const [newBudget] = await db.insert(budgets).values(budget).returning();
    return newBudget;
  }

  async updateBudget(id: number, budget: Partial<InsertBudget>): Promise<Budget | undefined> {
    const [updatedBudget] = await db.update(budgets)
      .set(budget)
      .where(eq(budgets.id, id))
      .returning();
    
    return updatedBudget;
  }

  async deleteBudget(id: number): Promise<boolean> {
    const result = await db.delete(budgets).where(eq(budgets.id, id)).returning();
    return result.length > 0;
  }

  // Bill operations
  async getBills(userId: number): Promise<Bill[]> {
    return db.select().from(bills).where(eq(bills.userId, userId));
  }

  async getBillById(id: number): Promise<Bill | undefined> {
    const [bill] = await db.select().from(bills).where(eq(bills.id, id));
    return bill;
  }

  async createBill(bill: InsertBill): Promise<Bill> {
    const [newBill] = await db.insert(bills).values(bill).returning();
    return newBill;
  }

  async updateBill(id: number, bill: Partial<InsertBill>): Promise<Bill | undefined> {
    const [updatedBill] = await db.update(bills)
      .set(bill)
      .where(eq(bills.id, id))
      .returning();
    
    return updatedBill;
  }

  async deleteBill(id: number): Promise<boolean> {
    const result = await db.delete(bills).where(eq(bills.id, id)).returning();
    return result.length > 0;
  }

  // Subscription operations
  async getSubscriptions(userId: number): Promise<Subscription[]> {
    return db.select().from(subscriptions).where(eq(subscriptions.userId, userId));
  }

  async getSubscriptionById(id: number): Promise<Subscription | undefined> {
    const [subscription] = await db.select().from(subscriptions).where(eq(subscriptions.id, id));
    return subscription;
  }

  async createSubscription(subscription: InsertSubscription): Promise<Subscription> {
    const [newSubscription] = await db.insert(subscriptions).values(subscription).returning();
    return newSubscription;
  }

  async updateSubscription(id: number, subscription: Partial<InsertSubscription>): Promise<Subscription | undefined> {
    const [updatedSubscription] = await db.update(subscriptions)
      .set(subscription)
      .where(eq(subscriptions.id, id))
      .returning();
    
    return updatedSubscription;
  }

  async deleteSubscription(id: number): Promise<boolean> {
    const result = await db.delete(subscriptions).where(eq(subscriptions.id, id)).returning();
    return result.length > 0;
  }

  // Goal operations
  async getGoals(userId: number): Promise<Goal[]> {
    return db.select().from(goals).where(eq(goals.userId, userId));
  }

  async getGoalById(id: number): Promise<Goal | undefined> {
    const [goal] = await db.select().from(goals).where(eq(goals.id, id));
    return goal;
  }

  async createGoal(goal: InsertGoal): Promise<Goal> {
    const [newGoal] = await db.insert(goals).values(goal).returning();
    return newGoal;
  }

  async updateGoal(id: number, goal: Partial<InsertGoal>): Promise<Goal | undefined> {
    const [updatedGoal] = await db.update(goals)
      .set(goal)
      .where(eq(goals.id, id))
      .returning();
    
    return updatedGoal;
  }

  async deleteGoal(id: number): Promise<boolean> {
    const result = await db.delete(goals).where(eq(goals.id, id)).returning();
    return result.length > 0;
  }
}

// Try to use database if possible, with fallback to in-memory storage
let storageInstance: IStorage;

try {
  console.log("Attempting to use PostgreSQL database");
  const dbStorage = new DatabaseStorage();
  // Create session store
  dbStorage.sessionStore = new PostgresSessionStore({ 
    pool: pool, 
    createTableIfMissing: true 
  });
  storageInstance = dbStorage;
  console.log("Using PostgreSQL database storage");
} catch (error) {
  console.error("Failed to connect to PostgreSQL, using in-memory storage as fallback", error);
  const memStorage = new MemStorage();
  // Create memory session store
  const MemoryStore = require('memorystore')(session);
  memStorage.sessionStore = new MemoryStore({
    checkPeriod: 86400000 // prune expired entries every 24h
  });
  storageInstance = memStorage;
  console.log("Using in-memory storage");
}

export const storage = storageInstance;