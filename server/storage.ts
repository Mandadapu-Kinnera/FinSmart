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

    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // 24h
    });

    // Initialize default categories
    this.initDefaultCategories();
  }

  private initDefaultCategories() {
    const defaultCategories: InsertCategory[] = [
      { name: 'Housing', color: '#3B82F6', icon: 'home' },
      { name: 'Food & Dining', color: '#10B981', icon: 'utensils' },
      { name: 'Transportation', color: '#F59E0B', icon: 'car' },
      { name: 'Entertainment', color: '#8B5CF6', icon: 'film' },
      { name: 'Utilities', color: '#EC4899', icon: 'bolt' },
      { name: 'Shopping', color: '#6366F1', icon: 'shopping-cart' },
      { name: 'Healthcare', color: '#EF4444', icon: 'medkit' },
      { name: 'Personal Care', color: '#14B8A6', icon: 'spa' },
      { name: 'Education', color: '#F97316', icon: 'graduation-cap' },
      { name: 'Subscriptions', color: '#A855F7', icon: 'calendar-alt' },
      { name: 'Income', color: '#22C55E', icon: 'hand-holding-dollar' }
    ];

    defaultCategories.forEach(category => this.createCategory(category));
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user = {
      ...insertUser,
      id,
      createdAt: new Date(),
      firstName: insertUser.firstName || null,
      lastName: insertUser.lastName || null,
      email: insertUser.email || null
    };
    this.users.set(id, user);
    return user;
  }

  // Transaction methods
  async getTransactions(userId: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).filter(
      transaction => transaction.userId === userId
    );
  }

  async getTransactionById(id: number): Promise<Transaction | undefined> {
    return this.transactions.get(id);
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const id = this.transactionIdCounter++;
    const newTransaction = {
      ...transaction,
      id,
      date: transaction.date || new Date(),
      type: transaction.type || 'expense',
      categoryId: transaction.categoryId || null,
      isExpense: transaction.isExpense || true,
      merchant: transaction.merchant || null
    };
    this.transactions.set(id, newTransaction);
    return newTransaction;
  }

  async updateTransaction(id: number, transaction: Partial<InsertTransaction>): Promise<Transaction | undefined> {
    const existingTransaction = this.transactions.get(id);
    if (!existingTransaction) return undefined;

    const updatedTransaction = { ...existingTransaction, ...transaction };
    this.transactions.set(id, updatedTransaction);
    return updatedTransaction;
  }

  async deleteTransaction(id: number): Promise<boolean> {
    return this.transactions.delete(id);
  }

  // Category methods
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async getCategoryById(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const id = this.categoryIdCounter++;
    const newCategory = { ...category, id };
    this.categories.set(id, newCategory);
    return newCategory;
  }

  // Budget methods
  async getBudgets(userId: number): Promise<Budget[]> {
    return Array.from(this.budgets.values()).filter(
      budget => budget.userId === userId
    );
  }

  async getBudgetById(id: number): Promise<Budget | undefined> {
    return this.budgets.get(id);
  }

  async createBudget(budget: InsertBudget): Promise<Budget> {
    const id = this.budgetIdCounter++;
    const newBudget = {
      ...budget,
      id,
      categoryId: budget.categoryId || null
    };
    this.budgets.set(id, newBudget);
    return newBudget;
  }

  async updateBudget(id: number, budget: Partial<InsertBudget>): Promise<Budget | undefined> {
    const existingBudget = this.budgets.get(id);
    if (!existingBudget) return undefined;

    const updatedBudget = { ...existingBudget, ...budget };
    this.budgets.set(id, updatedBudget);
    return updatedBudget;
  }

  async deleteBudget(id: number): Promise<boolean> {
    return this.budgets.delete(id);
  }

  // Bill methods
  async getBills(userId: number): Promise<Bill[]> {
    return Array.from(this.bills.values()).filter(
      bill => bill.userId === userId
    );
  }

  async getBillById(id: number): Promise<Bill | undefined> {
    return this.bills.get(id);
  }

  async createBill(bill: InsertBill): Promise<Bill> {
    const id = this.billIdCounter++;
    const newBill = {
      ...bill,
      id,
      icon: bill.icon || null,
      isPaid: bill.isPaid || false
    };
    this.bills.set(id, newBill);
    return newBill;
  }

  async updateBill(id: number, bill: Partial<InsertBill>): Promise<Bill | undefined> {
    const existingBill = this.bills.get(id);
    if (!existingBill) return undefined;

    const updatedBill = { ...existingBill, ...bill };
    this.bills.set(id, updatedBill);
    return updatedBill;
  }

  async deleteBill(id: number): Promise<boolean> {
    return this.bills.delete(id);
  }

  // Subscription methods
  async getSubscriptions(userId: number): Promise<Subscription[]> {
    return Array.from(this.subscriptions.values()).filter(
      subscription => subscription.userId === userId
    );
  }

  async getSubscriptionById(id: number): Promise<Subscription | undefined> {
    return this.subscriptions.get(id);
  }

  async createSubscription(subscription: InsertSubscription): Promise<Subscription> {
    const id = this.subscriptionIdCounter++;
    const newSubscription = {
      ...subscription,
      id,
      status: subscription.status || null,
      icon: subscription.icon || null,
      nextBillingDate: subscription.nextBillingDate || null
    };
    this.subscriptions.set(id, newSubscription);
    return newSubscription;
  }

  async updateSubscription(id: number, subscription: Partial<InsertSubscription>): Promise<Subscription | undefined> {
    const existingSubscription = this.subscriptions.get(id);
    if (!existingSubscription) return undefined;

    const updatedSubscription = { ...existingSubscription, ...subscription };
    this.subscriptions.set(id, updatedSubscription);
    return updatedSubscription;
  }

  async deleteSubscription(id: number): Promise<boolean> {
    return this.subscriptions.delete(id);
  }

  // Goal methods
  async getGoals(userId: number): Promise<Goal[]> {
    return Array.from(this.goals.values()).filter(
      goal => goal.userId === userId
    );
  }

  async getGoalById(id: number): Promise<Goal | undefined> {
    return this.goals.get(id);
  }

  async createGoal(goal: InsertGoal): Promise<Goal> {
    const id = this.goalIdCounter++;
    const newGoal = {
      ...goal,
      id,
      icon: goal.icon || null,
      category: goal.category || null,
      currentAmount: goal.currentAmount || 0,
      targetDate: goal.targetDate || null
    };
    this.goals.set(id, newGoal);
    return newGoal;
  }

  async updateGoal(id: number, goal: Partial<InsertGoal>): Promise<Goal | undefined> {
    const existingGoal = this.goals.get(id);
    if (!existingGoal) return undefined;

    const updatedGoal = { ...existingGoal, ...goal };
    this.goals.set(id, updatedGoal);
    return updatedGoal;
  }

  async deleteGoal(id: number): Promise<boolean> {
    return this.goals.delete(id);
  }
}

// Import necessary modules for the database storage
import { db } from "./db";
import { eq } from "drizzle-orm";
import { users, transactions, categories, budgets, bills, subscriptions, goals } from "@shared/schema";

export class DatabaseStorage implements IStorage {
  sessionStore: any;
  private pool: pg.Pool;

  constructor() {
    this.pool = new pg.Pool({
      connectionString: process.env.DATABASE_URL,
    });
    
    this.sessionStore = new PostgresSessionStore({ 
      pool: this.pool, 
      createTableIfMissing: true 
    });
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

// Create and export the storage instance
// Using MemStorage for now to avoid connection issues
const storageInstance: IStorage = new MemStorage();
console.log('Using in-memory storage');

export const storage = storageInstance;