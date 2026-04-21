import { Router, type IRouter } from "express";
import { db, cases } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import {
  CreateCaseBody,
  GetCaseParams,
  DeleteCaseParams,
  GenerateFirParams,
  UpdateEvidenceItemParams,
  UpdateEvidenceItemBody,
  TranslateCaseParams,
  TranslateCaseBody,
} from "@workspace/api-zod";
import { randomUUID } from "node:crypto";
import { analyzeIncident, generateFirDraft, translateCaseText } from "../lib/legalAi";

const router: IRouter = Router();

function rowToCase(row: typeof cases.$inferSelect) {
  return {
    id: row.id,
    title: row.title,
    complainant_name: row.complainantName,
    incident_text: row.incidentText,
    input_language: row.inputLanguage,
    category: row.category,
    status: row.status as "draft" | "analyzed" | "fir_generated" | "filed",
    summary: row.summary,
    explanation: row.explanation,
    ipc_sections: row.ipcSections as unknown as Array<Record<string, unknown>>,
    constitution_articles: row.constitutionArticles as unknown as Array<Record<string, unknown>>,
    evidence: row.evidence as unknown as Array<Record<string, unknown>>,
    precedents: row.precedents as unknown as Array<Record<string, unknown>>,
    rights_violations: row.rightsViolations as unknown as Array<Record<string, unknown>>,
    strength: row.strength as unknown as Record<string, unknown>,
    fir_draft: row.firDraft as unknown as Record<string, unknown> | null,
    reasoning: row.reasoning,
    created_at: row.createdAt.toISOString(),
    updated_at: row.updatedAt.toISOString(),
  };
}

router.get("/cases", async (_req, res) => {
  const rows = await db.select().from(cases).orderBy(desc(cases.createdAt));
  res.json(rows.map(rowToCase));
});

router.post("/cases", async (req, res) => {
  const body = CreateCaseBody.parse(req.body);
  const analysis = await analyzeIncident(body.incident_text, body.input_language, body.complainant_name);

  const evidenceWithIds = (analysis.evidence ?? []).map((e) => ({
    id: randomUUID(),
    type: e.type,
    description: e.description,
    priority: e.priority,
    collected: false,
  }));

  const [row] = await db
    .insert(cases)
    .values({
      title: analysis.title,
      complainantName: body.complainant_name,
      incidentText: body.incident_text,
      inputLanguage: body.input_language,
      category: analysis.category,
      status: "analyzed",
      summary: analysis.summary,
      explanation: analysis.explanation,
      ipcSections: analysis.ipc_sections,
      constitutionArticles: analysis.constitution_articles,
      evidence: evidenceWithIds,
      precedents: analysis.precedents,
      rightsViolations: analysis.rights_violations ?? [],
      strength: analysis.strength,
      firDraft: null,
      reasoning: analysis.reasoning,
    })
    .returning();

  res.json(rowToCase(row));
});

router.get("/cases/:id", async (req, res) => {
  const { id } = GetCaseParams.parse(req.params);
  const [row] = await db.select().from(cases).where(eq(cases.id, id));
  if (!row) {
    res.status(404).json({ error: "Case not found" });
    return;
  }
  res.json(rowToCase(row));
});

router.delete("/cases/:id", async (req, res) => {
  const { id } = DeleteCaseParams.parse(req.params);
  await db.delete(cases).where(eq(cases.id, id));
  res.json({ success: true });
});

router.post("/cases/:id/fir", async (req, res) => {
  const { id } = GenerateFirParams.parse(req.params);
  const [row] = await db.select().from(cases).where(eq(cases.id, id));
  if (!row) {
    res.status(404).json({ error: "Case not found" });
    return;
  }

  const sections = (row.ipcSections as unknown as Array<{ section: string; title: string }>);
  const fir = await generateFirDraft({
    complainantName: row.complainantName,
    incidentText: row.incidentText,
    ipcSections: sections,
  });

  const [updated] = await db
    .update(cases)
    .set({ firDraft: fir, status: "fir_generated", updatedAt: new Date() })
    .where(eq(cases.id, id))
    .returning();

  res.json(rowToCase(updated));
});

router.patch("/cases/:id/evidence", async (req, res) => {
  const { id } = UpdateEvidenceItemParams.parse(req.params);
  const body = UpdateEvidenceItemBody.parse(req.body);

  const [row] = await db.select().from(cases).where(eq(cases.id, id));
  if (!row) {
    res.status(404).json({ error: "Case not found" });
    return;
  }

  const evidence = (row.evidence as unknown as Array<{ id: string; collected: boolean; [k: string]: unknown }>).map((e) =>
    e.id === body.evidence_id ? { ...e, collected: body.collected } : e,
  );

  const [updated] = await db
    .update(cases)
    .set({ evidence, updatedAt: new Date() })
    .where(eq(cases.id, id))
    .returning();

  res.json(rowToCase(updated));
});

router.post("/cases/:id/translate", async (req, res) => {
  const { id } = TranslateCaseParams.parse(req.params);
  const body = TranslateCaseBody.parse(req.body);

  const [row] = await db.select().from(cases).where(eq(cases.id, id));
  if (!row) {
    res.status(404).json({ error: "Case not found" });
    return;
  }

  const translated = await translateCaseText({
    summary: row.summary,
    explanation: row.explanation,
    targetLanguage: body.target_language,
  });

  res.json({
    target_language: body.target_language,
    summary: translated.summary,
    explanation: translated.explanation,
  });
});

export default router;
