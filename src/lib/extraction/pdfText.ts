import { extractText, getDocumentProxy } from "unpdf";

const MIN_USEFUL_CHARS = 40;

export async function extractDocumentText(
  buffer: ArrayBuffer,
  mimeType: string,
  fileName: string,
): Promise<{ text: string; empty: boolean }> {
  const lower = fileName.toLowerCase();
  const isPdf =
    mimeType === "application/pdf" || lower.endsWith(".pdf");
  const isText =
    mimeType.startsWith("text/") ||
    lower.endsWith(".txt") ||
    lower.endsWith(".csv") ||
    lower.endsWith(".eml");

  let text = "";

  if (isPdf) {
    const pdf = await getDocumentProxy(new Uint8Array(buffer));
    const result = await extractText(pdf, { mergePages: true });
    text = Array.isArray(result.text) ? result.text.join("\n") : result.text;
  } else if (isText) {
    text = new TextDecoder("utf-8").decode(buffer);
  } else {
    throw new Error(
      "Unsupported file type. Upload a text PDF or .txt file for Phase 2.",
    );
  }

  text = text.replace(/\u0000/g, "").trim();
  return { text, empty: text.length < MIN_USEFUL_CHARS };
}
