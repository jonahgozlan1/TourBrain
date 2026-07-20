import { EXTRACTION_MODEL, getOpenAI } from "@/lib/extraction/openai";
import type { HotelExtraction } from "@/lib/extraction/schemas";

const HOTEL_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    document_type: { type: "string", enum: ["hotel"] },
    hotel: {
      type: "object",
      additionalProperties: false,
      properties: {
        name: { type: ["string", "null"] },
        address: { type: ["string", "null"] },
        check_in: { type: ["string", "null"] },
        check_out: { type: ["string", "null"] },
        confirmation_number: { type: ["string", "null"] },
        notes: { type: ["string", "null"] },
      },
      required: [
        "name",
        "address",
        "check_in",
        "check_out",
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
  required: ["document_type", "hotel", "matched_show_hint"],
} as const;

export async function extractHotel(
  text: string,
  fileName: string,
): Promise<HotelExtraction> {
  const openai = getOpenAI();
  const snippet = text.slice(0, 20000);

  const completion = await openai.chat.completions.create({
    model: EXTRACTION_MODEL,
    temperature: 0,
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "hotel_extraction",
        strict: true,
        schema: HOTEL_SCHEMA,
      },
    },
    messages: [
      {
        role: "system",
        content: `Extract structured hotel/lodging data from a booking confirmation.
Rules:
- Prefer null over invented values.
- Dates as YYYY-MM-DD (check_in / check_out).
- matched_show_hint.date should usually be check_in.
- matched_show_hint.city from hotel city/address when possible.
- Return JSON only.`,
      },
      {
        role: "user",
        content: `Filename: ${fileName}\n\nDocument text:\n${snippet}`,
      },
    ],
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) throw new Error("Hotel extraction returned empty response");

  return JSON.parse(raw) as HotelExtraction;
}
