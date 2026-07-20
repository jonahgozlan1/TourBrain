import { EXTRACTION_MODEL, getOpenAI } from "@/lib/extraction/openai";
import type { DocumentType } from "@/lib/types/domain";

export type ClassifiedDocument = {
  documentType: DocumentType;
  reason: string;
};

const CLASSIFY_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    document_type: {
      type: "string",
      enum: [
        "contract",
        "travel",
        "flight",
        "hotel",
        "rider",
        "hospitality_rider",
        "email",
        "spreadsheet",
        "other",
      ],
    },
    reason: { type: "string" },
  },
  required: ["document_type", "reason"],
} as const;

export async function classifyDocument(
  text: string,
  fileName: string,
): Promise<ClassifiedDocument> {
  const openai = getOpenAI();
  const snippet = text.slice(0, 8000);

  const completion = await openai.chat.completions.create({
    model: EXTRACTION_MODEL,
    temperature: 0,
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "document_classification",
        strict: true,
        schema: CLASSIFY_SCHEMA,
      },
    },
    messages: [
      {
        role: "system",
        content: `Classify touring documents.
- contract: artist/venue performance agreements
- travel: flight, tour bus, train, van, ground transport confirmations or itineraries
- flight: only if clearly airline-only (prefer travel)
- hotel: hotel/lodging confirmations
- rider / hospitality_rider: tech or hospitality riders
- Use other when unsure.
Return JSON only.`,
      },
      {
        role: "user",
        content: `Filename: ${fileName}\n\nDocument text:\n${snippet}`,
      },
    ],
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) throw new Error("Classification returned empty response");

  const parsed = JSON.parse(raw) as {
    document_type: DocumentType;
    reason: string;
  };

  // Normalize airline-only into travel pipeline
  const documentType =
    parsed.document_type === "flight" ? "travel" : parsed.document_type;

  return {
    documentType,
    reason: parsed.reason,
  };
}

export function isTravelDocumentType(type: DocumentType): boolean {
  return type === "travel" || type === "flight";
}
