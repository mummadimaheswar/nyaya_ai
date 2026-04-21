import { pgTable, text, timestamp, jsonb, uuid } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const cases = pgTable("cases", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  complainantName: text("complainant_name").notNull(),
  incidentText: text("incident_text").notNull(),
  inputLanguage: text("input_language").notNull(),
  category: text("category").notNull(),
  status: text("status").notNull().default("analyzed"),
  summary: text("summary").notNull(),
  explanation: text("explanation").notNull(),
  ipcSections: jsonb("ipc_sections").notNull().$type<unknown[]>().default([]),
  constitutionArticles: jsonb("constitution_articles").notNull().$type<unknown[]>().default([]),
  evidence: jsonb("evidence").notNull().$type<unknown[]>().default([]),
  precedents: jsonb("precedents").notNull().$type<unknown[]>().default([]),
  rightsViolations: jsonb("rights_violations").notNull().$type<unknown[]>().default([]),
  strength: jsonb("strength").notNull(),
  firDraft: jsonb("fir_draft"),
  reasoning: text("reasoning").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export type CaseRow = typeof cases.$inferSelect;
export type InsertCaseRow = typeof cases.$inferInsert;
