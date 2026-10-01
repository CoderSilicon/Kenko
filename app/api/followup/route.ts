import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { learnLinksFor } from "@/lib/learnLinks";
import {
  KENKO_SYSTEM_PROMPT,
  OUTPUT_SHAPE_NOTE,
  REFINEMENT_INSTRUCTIONS,
} from "@/lib/prompts";
import { applyRedFlagOverride, scanRedFlags } from "@/lib/redflags";
import type { KenkoResult, LearnLink, RedFlagPayload } from "@/lib/types";
import type { EvaluateResponse } from "../evaluate/route";

export const maxDuration = 60;

interface FollowUpBody {
  symptoms: string;
  background: string;
  previous: KenkoResult;
  answers: Array<{ id: string; question: string; answer: string }>;
}

/** Re-runs the evaluation with the person's answers folded in. */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as FollowUpBody;
    const answers = (body.answers ?? []).filter((a) =>
      Boolean(a?.answer?.trim()),
    );

    if (answers.length === 0) {
      return NextResponse.json(
        { error: "No answers were given." },
        { status: 400 },
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "The server is missing its GEMINI_API_KEY setting." },
        { status: 500 },
      );
    }

    const answerBlock = answers
      .map((a) => `- ${a.question} -> ${a.answer}`)
      .join("\n");

    const prior = body.previous;
    const previousBlock = JSON.stringify({
      differential_analysis: prior.differential_analysis,
      triage_level: prior.triage_level,
      confidence_note: prior.confidence_note,
    });

    const prompt = `### WHAT THEY REPORTED FIRST
${body.symptoms}

${body.background ? `### THEIR HEALTH BACKGROUND\n${body.background}\n` : ""}
### YOUR FIRST PASS
${previousBlock}

### THEIR ANSWERS TO YOUR QUESTIONS
${answerBlock}

Use the answers to firm up or correct your first pass.`;

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-3.8-flash",
      systemInstruction: `${KENKO_SYSTEM_PROMPT}\n${REFINEMENT_INSTRUCTIONS}\n\n${OUTPUT_SHAPE_NOTE}`,
    });

    const completion = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    let parsed: KenkoResult;
    try {
      parsed = JSON.parse(
        completion.response
          .text()
          .replace(/^```json\s*/i, "")
          .replace(/^```\s*/i, "")
          .replace(/\s*```$/i, "")
          .trim(),
      ) as KenkoResult;
    } catch {
      return NextResponse.json(
        { error: "We could not read the second answer. Please try again." },
        { status: 502 },
      );
    }

    // The answers can reveal a new danger, so scan them too.
    const redFlags: RedFlagPayload[] = scanRedFlags(answerBlock);
    parsed = applyRedFlagOverride(parsed, redFlags);

    let learn: LearnLink[] = [];
    try {
      learn = await learnLinksFor(parsed.differential_analysis ?? [], 3);
    } catch (error) {
      console.warn("Could not load learning links:", error);
    }

    return NextResponse.json({
      result: parsed,
      redFlags,
      learn,
    } satisfies EvaluateResponse);
  } catch (error) {
    console.error("Kenko follow-up error:", error);
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json(
      { error: `Follow-up failed: ${message}` },
      { status: 500 },
    );
  }
}
