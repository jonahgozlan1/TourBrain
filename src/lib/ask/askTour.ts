import { EXTRACTION_MODEL, getOpenAI } from "@/lib/extraction/openai";
import type { AskResult, AskTourContext } from "@/lib/ask/types";

const ASK_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    answer: { type: ["string", "null"] },
    citations: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          showId: { type: "string" },
          label: { type: "string" },
          kind: {
            type: "string",
            enum: ["show", "travel", "hotel", "contact", "gap"],
          },
        },
        required: ["showId", "label", "kind"],
      },
    },
    unknowns: {
      type: "array",
      items: { type: "string" },
    },
  },
  required: ["answer", "citations", "unknowns"],
} as const;

function validShowIds(context: AskTourContext): Set<string> {
  return new Set(context.shows.map((s) => s.id));
}

export async function askTour(
  question: string,
  context: AskTourContext,
): Promise<AskResult> {
  const openai = getOpenAI();
  const payload = JSON.stringify(context);
  const truncated =
    payload.length > 60000 ? `${payload.slice(0, 60000)}\n…(truncated)` : payload;

  const completion = await openai.chat.completions.create({
    model: EXTRACTION_MODEL,
    temperature: 0,
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "tour_ask_result",
        strict: true,
        schema: ASK_SCHEMA,
      },
    },
    messages: [
      {
        role: "system",
        content: `You answer questions about a tour using ONLY the structured JSON context provided.
Rules:
- The database is the source of truth. Never invent times, cities, confirmation numbers, hotels, contacts, or other facts.
- If the data does not contain the answer, set answer to null and list what is missing in unknowns.
- Prefer short, direct answers (1–3 sentences or a tight bullet list in plain text).
- citations must use real showId values from the context. label should be human-readable (e.g. "Berlin · Jul 22 · load-in").
- kind should match what you cited: show, travel, hotel, contact, or gap.
- Use gaps arrays when answering "what's missing" questions.
- Return JSON only.`,
      },
      {
        role: "user",
        content: `Tour data:\n${truncated}\n\nQuestion: ${question}`,
      },
    ],
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) throw new Error("Ask returned empty response");

  const parsed = JSON.parse(raw) as AskResult;
  const ids = validShowIds(context);

  return {
    answer: parsed.answer,
    citations: (parsed.citations ?? []).filter((c) => ids.has(c.showId)),
    unknowns: parsed.unknowns ?? [],
  };
}
