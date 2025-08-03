import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const projects = pgTable("projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  packageName: text("package_name").notNull(),
  version: text("version").notNull().default("1.0.0"),
  targetSdk: text("target_sdk").notNull().default("Android 13 (API 33)"),
  entryPoint: text("entry_point").notNull().default("main.py"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const projectFiles = pgTable("project_files", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull(),
  name: text("name").notNull(),
  content: text("content").notNull(),
  type: text("type").notNull(), // 'file' or 'folder'
  size: integer("size").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const buildLogs = pgTable("build_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull(),
  status: text("status").notNull(), // 'building', 'success', 'error'
  progress: integer("progress").notNull().default(0),
  logs: text("logs").notNull().default(""),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
});

export const insertProjectFileSchema = createInsertSchema(projectFiles).omit({
  id: true,
  createdAt: true,
});

export const insertBuildLogSchema = createInsertSchema(buildLogs).omit({
  id: true,
  createdAt: true,
});

export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type ProjectFile = typeof projectFiles.$inferSelect;
export type InsertProjectFile = z.infer<typeof insertProjectFileSchema>;
export type BuildLog = typeof buildLogs.$inferSelect;
export type InsertBuildLog = z.infer<typeof insertBuildLogSchema>;
