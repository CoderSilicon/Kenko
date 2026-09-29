import { NextResponse } from "next/server";
import { findArea } from "@/lib/bodyAreas";
import { type Language, searchMedline, topicsInGroup } from "@/lib/medlineplus";

export const dynamic = "force-dynamic";

/**
 * GET /api/learn?q=chest%20pain&limit=5&lang=es
 * GET /api/learn?area=lungs
 *
 * Returns trusted health information from MedlinePlus, served from the
 * 24 hour SQLite cache when possible.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const q = url.searchParams.get("q")?.trim() ?? "";
  const area = url.searchParams.get("area");
  const lang = url.searchParams.get("lang") === "es" ? "es" : "en";
  const language: Language = lang;
  const limitRaw = Number(url.searchParams.get("limit") ?? "6");
  const limit = Number.isFinite(limitRaw)
    ? Math.min(Math.max(Math.trunc(limitRaw), 1), 20)
    : 6;

  try {
    if (area) {
      const found = findArea(area);
      if (!found) {
        return NextResponse.json(
          { error: "Unknown body area." },
          { status: 400 },
        );
      }
      const result = await topicsInGroup(found.group, { language, limit });
      return NextResponse.json({ ...result, area: found });
    }

    if (!q) {
      return NextResponse.json(
        { error: "Add a search word or pick a body area." },
        { status: 400 },
      );
    }

    const result = await searchMedline(q, { language, limit });
    return NextResponse.json(result);
  } catch (error) {
    console.error("MedlinePlus request failed:", error);
    return NextResponse.json(
      {
        error:
          "We could not reach the health library right now. Please try again in a moment.",
      },
      { status: 502 },
    );
  }
}
