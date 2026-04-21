import { Router, type IRouter } from "express";
import { db, cases } from "@workspace/db";
import { desc } from "drizzle-orm";

const router: IRouter = Router();

router.get("/dashboard/summary", async (_req, res) => {
  const rows = await db.select().from(cases);
  const total = rows.length;
  const firs = rows.filter((r) => r.firDraft !== null).length;

  let collected = 0;
  let pending = 0;
  let strengthSum = 0;
  const byCat = new Map<string, number>();

  for (const r of rows) {
    const ev = (r.evidence as unknown as Array<{ collected: boolean }>) ?? [];
    for (const e of ev) (e.collected ? collected++ : pending++);
    const s = r.strength as unknown as { overall?: number };
    strengthSum += s?.overall ?? 0;
    byCat.set(r.category, (byCat.get(r.category) ?? 0) + 1);
  }

  res.json({
    total_cases: total,
    firs_generated: firs,
    evidence_collected: collected,
    evidence_pending: pending,
    avg_strength: total > 0 ? Math.round(strengthSum / total) : 0,
    by_category: Array.from(byCat.entries())
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count),
  });
});

router.get("/dashboard/recent", async (_req, res) => {
  const rows = await db.select().from(cases).orderBy(desc(cases.updatedAt)).limit(10);
  res.json(
    rows.map((r) => ({
      case_id: r.id,
      case_title: r.title,
      action:
        r.status === "fir_generated" ? "FIR draft generated" :
        r.status === "analyzed" ? "Case analyzed" :
        r.status === "filed" ? "Case filed" :
        "Draft created",
      at: r.updatedAt.toISOString(),
    })),
  );
});

router.get("/dashboard/top-laws", async (_req, res) => {
  const rows = await db.select().from(cases);
  const counts = new Map<string, { section: string; title: string; count: number }>();
  for (const r of rows) {
    const sections = (r.ipcSections as unknown as Array<{ section: string; title: string }>) ?? [];
    for (const s of sections) {
      const key = s.section;
      const existing = counts.get(key);
      if (existing) existing.count++;
      else counts.set(key, { section: s.section, title: s.title, count: 1 });
    }
  }
  res.json(
    Array.from(counts.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 6),
  );
});

export default router;
