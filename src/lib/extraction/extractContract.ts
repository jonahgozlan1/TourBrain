import { EXTRACTION_MODEL, getOpenAI } from "@/lib/extraction/openai";
import type { ContractExtraction } from "@/lib/extraction/schemas";

const CONTRACT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    document_type: { type: "string", enum: ["contract"] },
    show: {
      type: "object",
      additionalProperties: false,
      properties: {
        date: { type: ["string", "null"] },
        venue: { type: ["string", "null"] },
        city: { type: ["string", "null"] },
        country: { type: ["string", "null"] },
        doors_time: { type: ["string", "null"] },
        show_time: { type: ["string", "null"] },
        load_in_time: { type: ["string", "null"] },
        soundcheck_time: { type: ["string", "null"] },
        curfew: { type: ["string", "null"] },
        promoter: { type: ["string", "null"] },
      },
      required: [
        "date",
        "venue",
        "city",
        "country",
        "doors_time",
        "show_time",
        "load_in_time",
        "soundcheck_time",
        "curfew",
        "promoter",
      ],
    },
    contact: {
      anyOf: [
        { type: "null" },
        {
          type: "object",
          additionalProperties: false,
          properties: {
            name: { type: ["string", "null"] },
            company: { type: ["string", "null"] },
            role: { type: ["string", "null"] },
            email: { type: ["string", "null"] },
            phone: { type: ["string", "null"] },
          },
          required: ["name", "company", "role", "email", "phone"],
        },
      ],
    },
    matched_show_hint: {
      anyOf: [
        { type: "null" },
        {
          type: "object",
          additionalProperties: false,
          properties: {
            date: { type: ["string", "null"] },
            city: { type: ["string", "null"] },
            venue: { type: ["string", "null"] },
          },
          required: ["date", "city", "venue"],
        },
      ],
    },
  },
  required: ["document_type", "show", "contact", "matched_show_hint"],
} as const;

export async function extractContract(
  text: string,
  fileName: string,
): Promise<ContractExtraction> {
  const openai = getOpenAI();
  const snippet = text.slice(0, 20000);

  const completion = await openai.chat.completions.create({
    model: EXTRACTION_MODEL,
    temperature: 0,
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "contract_extraction",
        strict: true,
        schema: CONTRACT_SCHEMA,
      },
    },
    messages: [
      {
        role: "system",
        content: `Extract structured show data from a live performance contract or advance.
Rules:
- Prefer null over invented values.
- Dates as YYYY-MM-DD.
- Times as HH:MM 24-hour local wall clock (no timezone conversion).
- Do not extract fees, deposits, or money fields.
- matched_show_hint should echo the best date/city/venue for matching existing shows.
- Return JSON only.`,
      },
      {
        role: "user",
        content: `Filename: ${fileName}\n\nDocument text:\n${snippet}`,
      },
    ],
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) throw new Error("Contract extraction returned empty response");

  return JSON.parse(raw) as ContractExtraction;
}
