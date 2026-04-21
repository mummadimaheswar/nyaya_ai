# Nyaya AI

AI-powered legal assistant for India. Citizens describe an incident (text or voice, in English / Hindi / Telugu) and Nyaya AI returns:
- Applicable IPC sections and Constitution articles (with confidence + the words from the user's text that triggered each one)
- Plain-language explanation and a step-by-step explainable-AI reasoning trace
- FIR draft (Section 154 CrPC format)
- Evidence checklist (toggleable, persisted)
- Similar precedents with similarity scores
- Rights-violation alerts with complaint channels (NHRC, etc.)
- Case strength score (overall + evidence / legal coverage / precedent sub-scores)
- Translation of summary + explanation into Hindi or Telugu

## Stack
- Monorepo: pnpm workspaces
- Frontend: `artifacts/nyaya-ai` — React + Vite + wouter + TanStack Query + Tailwind + shadcn/ui (path-based routing at `/`)
- Backend: `artifacts/api-server` — Express, mounted at `/api`
- DB: Replit Postgres via `@workspace/db` (drizzle-orm). Schema in `lib/db/src/schema/cases.ts`
- AI: Replit Gemini integration (free tier) via `@workspace/integrations-gemini-ai` (model `gemini-2.5-flash` for analysis, FIR, translation, and audio transcription)
- API contract: `lib/api-spec/openapi.yaml` → orval codegen → `@workspace/api-client-react` + `@workspace/api-zod`

## Key files
- `lib/api-spec/openapi.yaml` — single source of truth for API contract
- `lib/db/src/schema/cases.ts` — single `cases` table; complex AI output stored as jsonb
- `artifacts/api-server/src/lib/legalAi.ts` — all OpenAI calls (analyze, FIR, translate, transcribe)
- `artifacts/api-server/src/routes/{cases,analysis,dashboard}.ts` — REST endpoints
- `artifacts/nyaya-ai/src/pages/{home,new-case,case-detail}.tsx` — three pages

## Endpoints
- `GET/POST/DELETE /api/cases`, `GET /api/cases/:id`
- `POST /api/cases/:id/fir` — generate FIR from analyzed case
- `PATCH /api/cases/:id/evidence` — toggle evidence collected
- `POST /api/cases/:id/translate` — translate summary+explanation
- `POST /api/analysis/transcribe` — base64 audio → text (browser MediaRecorder)
- `GET /api/dashboard/{summary,recent,top-laws}`

## Conventions
- No emojis anywhere in UI; lucide-react icons only.
- Brand: deep indigo / judicial blue + warm saffron accent + parchment background, serif headings.
- Voice input uses `MediaRecorder` (audio/webm) → base64 → `/api/analysis/transcribe`. Do NOT use Web Speech API.
- All API hooks come from `@workspace/api-client-react`. Mutations invalidate the matching generated query keys.
- Disclaimer: "Nyaya AI provides general legal information, not legal advice."

## Running
Workflows auto-start: `artifacts/api-server: API Server` and `artifacts/nyaya-ai: web`. After schema changes run `pnpm --filter @workspace/db run push`. After OpenAPI changes run `pnpm --filter @workspace/api-spec run codegen`.
