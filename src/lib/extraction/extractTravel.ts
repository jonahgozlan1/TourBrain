import { EXTRACTION_MODEL, getOpenAI } from "@/lib/extraction/openai";
import type { TravelExtraction } from "@/lib/extraction/schemas";

const TRAVEL_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    document_type: { type: "string", enum: ["travel"] },
    travel: {
      type: "object",
      additionalProperties: false,
      properties: {
        type: {
          type: "string",
          enum: ["flight", "train", "bus", "car", "other"],
        },
        date: { type: ["string", "null"] },
        departure: { type: ["string", "null"] },
        arrival: { type: ["string", "null"] },
        departure_time: { type: ["string", "null"] },
        arrival_time: { type: ["string", "null"] },
        confirmation_number: { type: ["string", "null"] },
        notes: { type: ["string", "null"] },
      },
      required: [
        "type",
        "date",
        "departure",
        "arrival",
        "departure_time",
        "arrival_time",
        "confirmation_number",
        "notes",
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
          },
          required: ["date", "city"],
        },
      ],
    },
  },
  required: ["document_type", "travel", "matched_show_hint"],
} as const;

export async function extractTravel(
  text: string,
  fileName: string,
): Promise<TravelExtraction> {
  const openai = getOpenAI();
  const snippet = text.slice(0, 20000);

  const completion = await openai.chat.completions.create({
    model: EXTRACTION_MODEL,
    temperature: 0,
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "travel_extraction",
        strict: true,
        schema: TRAVEL_SCHEMA,
      },
    },
    messages: [
      {
        role: "system",
        content: `Extract structured travel data from a confirmation or itinerary (flight, tour bus, train, car/van, ground transport).
Rules:
- Prefer null over invented values.
- Dates as YYYY-MM-DD.
- Times as HH:MM 24-hour local wall clock.
- type: flight | train | bus | car | other (tour bus / coach → bus).
- matched_show_hint.city should be the arrival / destination city when possible.
- matched_show_hint.date should be the travel date (or arrival date if overnight).
- If multiple legs, extract the primary/main leg; put extras in notes.
- Return JSON only.`,
      },
      {
        role: "user",
        content: `Filename: ${fileName}\n\nDocument text:\n${snippet}`,
      },
    ],
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) throw new Error("Travel extraction returned empty response");

  return JSON.parse(raw) as TravelExtraction;
}
