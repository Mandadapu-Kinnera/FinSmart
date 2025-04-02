import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User table for authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  email: text("email"),
  createdAt: timestamp("created_at").defaultNow()
});

// Transaction categories
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  color: text("color").notNull(),
  icon: text("icon").notNull()
});

// Transactions table
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  amount: doublePrecision("amount").notNull(),
  description: text("description").notNull(),
  categoryId: integer("category_id"),
  date: timestamp("date").notNull().defaultNow(),
  isExpense: boolean("is_expense").default(true),
  merchant: text("merchant"),
  type: text("type").default("expense").notNull() // income or expense
});

// Budget table
export const budgets = pgTable("budgets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  categoryId: integer("category_id"),
  amount: doublePrecision("amount").notNull(),
  period: text("period").notNull(), // monthly, weekly, yearly
  name: text("name").notNull()
});

// Bills table for recurring payments
export const bills = pgTable("bills", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  amount: doublePrecision("amount").notNull(),
  dueDate: timestamp("due_date").notNull(),
  isPaid: boolean("is_paid").default(false),
  category: text("category").notNull(),
  icon: text("icon")
});

// Subscriptions table
export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  amount: doublePrecision("amount").notNull(),
  billingCycle: text("billing_cycle").notNull(), // monthly, yearly
  category: text("category").notNull(),
  status: text("status").default("active"), // active, cancelled, paused
  icon: text("icon"),
  nextBillingDate: timestamp("next_billing_date")
});

// Savings goals
export const goals = pgTable("goals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  targetAmount: doublePrecision("target_amount").notNull(),
  currentAmount: doublePrecision("current_amount").default(0),
  targetDate: timestamp("target_date"),
  category: text("category"),
  icon: text("icon")
});

// Export schemas for validation and insertion
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  firstName: true,
  lastName: true,
  email: true
});

export const insertTransactionSchema = createInsertSchema(transactions)
  .omit({
    id: true
  })
  .extend({
    date: z.coerce.date()
  });

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true
});

export const insertBudgetSchema = createInsertSchema(budgets).omit({
  id: true
});

export const insertBillSchema = createInsertSchema(bills)
  .omit({
    id: true
  })
  .extend({
    dueDate: z.coerce.date()
  });

export const insertSubscriptionSchema = createInsertSchema(subscriptions)
  .omit({
    id: true
  })
  .extend({
    nextBillingDate: z.coerce.date().nullable()
  });

export const insertGoalSchema = createInsertSchema(goals)
  .omit({
    id: true
  })
  .extend({
    targetDate: z.coerce.date().nullable()
  });

// Export types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;

export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;

export type InsertBudget = z.infer<typeof insertBudgetSchema>;
export type Budget = typeof budgets.$inferSelect;

export type InsertBill = z.infer<typeof insertBillSchema>;
export type Bill = typeof bills.$inferSelect;

export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type Subscription = typeof subscriptions.$inferSelect;

export type InsertGoal = z.infer<typeof insertGoalSchema>;
export type Goal = typeof goals.$inferSelect;
