import { openai } from "@workspace/integrations-openai-ai-server";

export interface LegalAnalysisResult {
  title: string;
  category: string;
  summary: string;
  explanation: string;
  reasoning: string;
  ipc_sections: Array<{
    section: string;
    title: string;
    description: string;
    confidence: number;
    triggered_by: string[];
  }>;
  constitution_articles: Array<{
    article: string;
    title: string;
    description: string;
    confidence: number;
  }>;
  evidence: Array<{
    type: "document" | "witness" | "digital" | "physical" | "medical" | "other";
    description: string;
    priority: "critical" | "important" | "optional";
  }>;
  precedents: Array<{
    title: string;
    court: string;
    year: number;
    summary: string;
    outcome: string;
    similarity: number;
  }>;
  rights_violations: Array<{
    right: string;
    description: string;
    complaint_channel: string;
  }>;
  strength: {
    overall: number;
    evidence: number;
    legal_coverage: number;
    precedent: number;
    verdict: string;
    notes: string;
  };
}

const SYSTEM_PROMPT = `You are Nyaya AI, an expert in Indian criminal law (Indian Penal Code, Code of Criminal Procedure) and the Constitution of India. You analyze incidents reported by ordinary citizens and map them to applicable laws.

You ALWAYS reply with strictly valid JSON matching the requested schema. Be specific to Indian law. Cite real IPC sections (e.g. "IPC 420" for cheating, "IPC 354" for assault on a woman with intent to outrage modesty, "IPC 379" for theft, "IPC 498A" for cruelty by husband, "IPC 376" for rape, "IPC 302" for murder, "IPC 506" for criminal intimidation, "IT Act 66C/66D" for cyber identity-theft/fraud, etc.). Cite real Constitution articles (Article 14 equality, 19 freedoms, 21 life & liberty, 22 protection on arrest, 23 trafficking, 39A legal aid, etc.). Cite well-known Supreme Court / High Court precedents that are genuinely relevant (e.g. Vishaka v. State of Rajasthan, D.K. Basu v. State of West Bengal, Joseph Shine v. Union of India, Lalita Kumari v. State of UP for FIR registration, etc.).

For triggered_by, return the actual phrases or keywords from the user's incident text that justify each section.

For reasoning, explain step-by-step in plain English how you went from the incident to the laws — this is the explainable-AI trace shown to the user.

confidence and similarity are 0..1 floats. strength sub-scores are 0..100 integers.`;

const ANALYSIS_SCHEMA_INSTRUCTIONS = `Return JSON with EXACTLY these keys:
{
  "title": "short case title (5-8 words)",
  "category": "short category like 'Cyber Fraud', 'Domestic Violence', 'Theft', 'Assault', 'Wrongful Arrest', etc.",
  "summary": "2-3 sentence neutral summary of what happened",
  "explanation": "plain-language explanation (4-6 sentences) of what laws apply and why, written for a non-lawyer",
  "reasoning": "step-by-step XAI trace: 'I noticed X in the description, which maps to IPC Y because...'",
  "ipc_sections": [{"section":"IPC 420","title":"Cheating","description":"...","confidence":0.92,"triggered_by":["online payment","never received product"]}],
  "constitution_articles": [{"article":"Article 21","title":"Right to Life and Personal Liberty","description":"...","confidence":0.7}],
  "evidence": [{"type":"digital","description":"Screenshots of the WhatsApp conversation with the seller","priority":"critical"}],
  "precedents": [{"title":"Lalita Kumari v. Govt. of U.P.","court":"Supreme Court","year":2013,"summary":"...","outcome":"FIR registration mandatory for cognizable offences","similarity":0.6}],
  "rights_violations": [{"right":"Right to be informed of grounds of arrest (Article 22)","description":"...","complaint_channel":"NHRC / State Human Rights Commission"}],
  "strength": {"overall":68,"evidence":60,"legal_coverage":85,"precedent":60,"verdict":"Moderate","notes":"Solid legal coverage; strengthen by collecting bank statements and witness statements."}
}

Aim for 2-5 IPC sections, 1-3 constitution articles, 4-7 evidence items, 2-3 precedents, 0-2 rights violations (only include if a state actor likely violated rights).`;

export async function analyzeIncident(
  incidentText: string,
  language: string,
  complainantName: string,
): Promise<LegalAnalysisResult> {
  const userPrompt = `Complainant: ${complainantName}
Input language code: ${language}
Incident description (may be in Hindi/Telugu/English):
"""
${incidentText}
"""

${ANALYSIS_SCHEMA_INSTRUCTIONS}`;

  const resp = await openai.chat.completions.create({
    model: "gpt-5.2",
    max_completion_tokens: 8192,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ],
  });
  const content = resp.choices[0]?.message?.content ?? "{}";
  return JSON.parse(content) as LegalAnalysisResult;
}

export interface FirDraftResult {
  complainant_name: string;
  complainant_address: string;
  incident_date: string;
  incident_location: string;
  incident_summary: string;
  sections_invoked: string[];
  timeline: Array<{ when: string; event: string }>;
  accused_details: string;
  prayer: string;
}

export async function generateFirDraft(args: {
  complainantName: string;
  incidentText: string;
  ipcSections: Array<{ section: string; title: string }>;
}): Promise<FirDraftResult> {
  const sections = args.ipcSections.map((s) => `${s.section} (${s.title})`).join(", ");
  const prompt = `Draft an Indian First Information Report (FIR) based on the following.

Complainant: ${args.complainantName}
Sections to invoke: ${sections}

Incident:
"""
${args.incidentText}
"""

Return JSON with EXACTLY these keys:
{
  "complainant_name": "${args.complainantName}",
  "complainant_address": "[To be filled by complainant]",
  "incident_date": "best estimate based on the description, or '[To be filled]'",
  "incident_location": "best estimate based on the description, or '[To be filled]'",
  "incident_summary": "formal 1-2 paragraph narrative suitable for a police FIR (Section 154 CrPC)",
  "sections_invoked": ${JSON.stringify(args.ipcSections.map((s) => s.section))},
  "timeline": [{"when":"...","event":"..."}],
  "accused_details": "any identifying details of accused mentioned in the incident, or '[Unknown - to be investigated]'",
  "prayer": "formal prayer (1-2 sentences) requesting the SHO to register the FIR and take legal action"
}`;

  const resp = await openai.chat.completions.create({
    model: "gpt-5.2",
    max_completion_tokens: 4096,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: prompt },
    ],
  });
  return JSON.parse(resp.choices[0]?.message?.content ?? "{}") as FirDraftResult;
}

export async function translateCaseText(args: {
  summary: string;
  explanation: string;
  targetLanguage: "en" | "hi" | "te";
}): Promise<{ summary: string; explanation: string }> {
  const langName =
    args.targetLanguage === "hi" ? "Hindi (Devanagari script)" :
    args.targetLanguage === "te" ? "Telugu (Telugu script)" :
    "English";

  const resp = await openai.chat.completions.create({
    model: "gpt-5.2",
    max_completion_tokens: 4096,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: `You translate Indian legal text into ${langName}. Keep IPC section numbers and Constitution article numbers untranslated. Reply as JSON with exactly { "summary": "...", "explanation": "..." }.` },
      { role: "user", content: `Translate to ${langName}:\n\nSUMMARY:\n${args.summary}\n\nEXPLANATION:\n${args.explanation}` },
    ],
  });
  return JSON.parse(resp.choices[0]?.message?.content ?? "{}");
}

export async function transcribeAudioBuffer(args: {
  buffer: Buffer;
  mimeType: string;
  language?: string;
}): Promise<{ text: string; detected_language: string }> {
  const ext =
    args.mimeType.includes("webm") ? "webm" :
    args.mimeType.includes("mp4") ? "mp4" :
    args.mimeType.includes("wav") ? "wav" :
    args.mimeType.includes("mpeg") || args.mimeType.includes("mp3") ? "mp3" :
    "webm";

  const file = new File([new Uint8Array(args.buffer)], `audio.${ext}`, { type: args.mimeType });
  const resp = await openai.audio.transcriptions.create({
    model: "gpt-4o-mini-transcribe",
    file,
    response_format: "json",
    ...(args.language ? { language: args.language } : {}),
  });
  return {
    text: resp.text ?? "",
    detected_language: args.language ?? "auto",
  };
}
