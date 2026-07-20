/**
 * Phase 2: prefer uploadAndExtractAction — this route remains as a JSON health stub.
 */
export async function POST() {
  return Response.json({
    ok: true,
    message: "Use the Import page upload flow (server action) for extraction.",
  });
}
