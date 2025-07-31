import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const wbsNodes = pgTable("wbs_nodes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  duration: text("duration"),
  effort: text("effort"),
  responsible: text("responsible"),
  parentId: varchar("parent_id"),
  position: integer("position").notNull().default(0),
  expanded: integer("expanded").notNull().default(1), // 1 for true, 0 for false
  level: integer("level").notNull().default(0),
  metadata: jsonb("metadata").default({}),
});

export const insertWbsNodeSchema = createInsertSchema(wbsNodes).omit({
  id: true,
});

export const updateWbsNodeSchema = createInsertSchema(wbsNodes).omit({
  id: true,
}).partial();

export type InsertWbsNode = z.infer<typeof insertWbsNodeSchema>;
export type UpdateWbsNode = z.infer<typeof updateWbsNodeSchema>;
export type WbsNode = typeof wbsNodes.$inferSelect;

// For hierarchical tree structure
export interface WbsNodeWithChildren extends WbsNode {
  children: WbsNodeWithChildren[];
}
