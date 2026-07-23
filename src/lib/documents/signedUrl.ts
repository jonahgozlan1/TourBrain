import type { SupabaseClient } from "@supabase/supabase-js";
import type { Document } from "@/lib/types/domain";

const BUCKET = "tour-documents";
const SIGNED_URL_TTL_SECONDS = 60 * 60;

export async function withSignedDocumentUrls(
  supabase: SupabaseClient,
  documents: Document[],
): Promise<Document[]> {
  return Promise.all(
    documents.map(async (doc) => {
      const { data, error } = await supabase.storage
        .from(BUCKET)
        .createSignedUrl(doc.fileUrl, SIGNED_URL_TTL_SECONDS);

      if (error || !data?.signedUrl) {
        return doc;
      }

      return { ...doc, fileUrl: data.signedUrl };
    }),
  );
}
