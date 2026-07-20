"use server";

import { askTour } from "@/lib/ask/askTour";
import { getTourAskContext } from "@/lib/ask/context";
import type { AskResult } from "@/lib/ask/types";

export type AskTourActionResult =
  | { ok: true; result: AskResult }
  | { ok: false; error: string };

export async function askTourAction(
  question: string,
): Promise<AskTourActionResult> {
  const trimmed = question.trim();
  if (!trimmed) {
    return { ok: false, error: "Enter a question." };
  }
  if (trimmed.length > 500) {
    return { ok: false, error: "Keep questions under 500 characters." };
  }

  let context;
  try {
    context = await getTourAskContext();
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, error: message };
  }

  if (!context) {
    return { ok: false, error: "Create a tour first." };
  }

  if (context.shows.length === 0) {
    return {
      ok: true,
      result: {
        answer: null,
        citations: [],
        unknowns: [
          "No shows on this tour yet. Add a show or import a contract.",
        ],
      },
    };
  }

  try {
    const result = await askTour(trimmed, context);
    return { ok: true, result };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes("OPENAI_API_KEY")) {
      return { ok: false, error: "OpenAI is not configured (OPENAI_API_KEY)." };
    }
    return { ok: false, error: message };
  }
}
