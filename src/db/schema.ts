


import { pgTable, serial, varchar, timestamp, text, boolean,  integer } from "drizzle-orm/pg-core";


export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  clerkId: varchar("clerk_id", {length: 225}).unique().notNull(),
  email: varchar("email", { length: 255 }),
  role: varchar("role", {length: 50}).default("free"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: varchar("slug", {length: 255}).unique().notNull(),
  published: boolean("published").default(false),
  content: text("content").notNull(),
  authorId: serial("author_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  stripeId: varchar("stripe_id", { length: 255 }).notNull(),
  amount: integer("amount").notNull(),
  status: varchar("status", { length: 50 }).default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});