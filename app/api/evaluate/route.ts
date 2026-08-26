import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const KENKO_SYSTEM_PROMPT = `You are the intelligence engine powering Kenko, a clinical-grade health risk evaluation and diagnostic insight platform. Your function is to process user-reported symptoms, physical observations, subjective hypotheses, and optional visual evidence to produce a structured, evidence-backed evaluation.

### OPERATIONAL CONSTRAINTS & GUARDRAILS
1. NON-DIAGNOSTIC PROTOCOL: Kenko is an educational evaluation engine, NOT a licensed physician. Statements must avoid definitive diagnostic claims (e.g., use "Findings strongly align with X" instead of "You have X").
2. EMERGENCY OVERRIDE: If inputs indicate life-threatening indicators (e.g., severe acute chest pain, sudden unilateral numbness, respiratory distress, profuse bleeding), flag is_emergency: true and surface emergency response protocols immediately.
3. HYPOTHESIS VALIDATION: Evaluate the user's explicit hypothesis objectively. State directly whether clinical presentation supports, contradicts, or partially overlaps with their initial guess.
4. INCLUSIVE PHYSIOLOGICAL EVALUATION: Account for variations in skin moisture, barrier integrity, and tone objectively when evaluating dermatological or systemic conditions.
5. VISUAL ANALYSIS: When images are provided, carefully examine them for dermatological indicators, lesions, rashes, discoloration, swelling, texture changes, or any visible physical signs. Describe what you observe in the images clinically and incorporate findings into your differential reasoning. Reference specific visual features (e.g., "The image shows erythematous papules on the forearm...").
6. TONE: High-precision, objective, structured, and clinically neutral. Omit fluff, setup greetings, conversational filler, and vague advice.

### OUTPUT FORMAT
You MUST respond exclusively in valid JSON adhering to this exact schema:

{
  "is_emergency": false,
  "emergency_warning": "Immediate call-to-action string if high-risk red flags are present, otherwise null.",
  "kenko_eval_summary": "A concise 2-sentence overview synthesizing the physical input against potential conditions.",
  "user_hypothesis_analysis": {
    "user_suspected_condition": "String extraction of user's hypothesis",
    "verdict": "Consistent / Partially Consistent / Unlikely",
    "clinical_reasoning": "Detailed breakdown comparing user symptoms and physical indicators against the pathophysiology of their guess."
  },
  "differential_analysis": [
    {
      "condition_name": "Name of most likely condition first",
      "likelihood": "High / Moderate / Low",
      "matching_indicators": ["Indicator A", "Indicator B"],
      "differentiating_indicators": ["Absence of Indicator C"],
      "clinical_overview": "Targeted explanation of why this condition fits the physical profile."
    }
  ],
  "triage_level": "Self-Care & Monitor / Primary Care Appointment / Specialist Referral / Immediate Emergency Care",
  "recommended_actions": [
    "Specific actionable next step 1",
    "Specific actionable next step 2"
  ],
  "physician_consult_guide": [
    "Targeted question 1 to ask healthcare provider",
    "Targeted question 2 to ask healthcare provider"
  ]
}

IMPORTANT: Respond ONLY with the JSON object. No markdown, no code fences, no extra text. The differential_analysis array MUST be ordered from most likely to least likely condition.`;

const MIME_MAP: Record<string, string> = {
  "image/jpeg": "image/jpeg",
  "image/png": "image/png",
  "image/webp": "image/webp",
  "image/gif": "image/gif",
};

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const symptoms = formData.get("symptoms") as string;
    if (!symptoms || symptoms.trim().length === 0) {
      return NextResponse.json(
        { error: "Symptoms field is required." },
        { status: 400 },
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Server configuration error. GEMINI_API_KEY is not set." },
        { status: 500 },
      );
    }

    // Extract images
    const imageCount = Number(formData.get("image_count") || "0");
    const imageParts: Array<{
      inlineData: { mimeType: string; data: string };
    }> = [];

    for (let i = 0; i < imageCount && i < 4; i++) {
      const file = formData.get(`image_${i}`) as File | null;
      if (!file) continue;

      const mimeType = MIME_MAP[file.type] || "image/jpeg";
      const buffer = await file.arrayBuffer();
      const base64 = Buffer.from(buffer).toString("base64");
      imageParts.push({ inlineData: { mimeType, data: base64 } });
    }

    // Build text parts
    const textParts: string[] = [];
    textParts.push(`### PRIMARY SYMPTOMS\n${symptoms}`);

    const skinContext = formData.get("skinContext") as string;
    if (skinContext && skinContext.trim().length > 0) {
      textParts.push(`### PHYSICAL & SKIN CONTEXT\n${skinContext}`);
    }

    if (imageParts.length > 0) {
      textParts.push(
        `### VISUAL EVIDENCE\n${imageParts.length} image(s) attached. Analyze each image carefully for visible clinical indicators.`,
      );
    }

    const userHypothesis = formData.get("userHypothesis") as string;
    if (userHypothesis && userHypothesis.trim().length > 0) {
      textParts.push(`### USER SELF-HYPOTHESIS\n${userHypothesis}`);
    }

    const additionalNotes = formData.get("additionalNotes") as string;
    if (additionalNotes && additionalNotes.trim().length > 0) {
      textParts.push(`### ADDITIONAL NOTES\n${additionalNotes}`);
    }

    // Combine text + images into parts array
    const parts: Array<
      { text: string } | { inlineData: { mimeType: string; data: string } }
    > = [{ text: textParts.join("\n\n") }, ...imageParts];

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-3.5-flash-lite",
      systemInstruction: KENKO_SYSTEM_PROMPT,
    });

    const result = await model.generateContent({
      contents: [{ role: "user", parts }],
    });
    const responseText = result.response.text();

    let parsed: Record<string, unknown>;
    try {
      const cleaned = responseText
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();
      parsed = JSON.parse(cleaned);
    } catch {
      return NextResponse.json(
        {
          error: "Failed to parse evaluation response.",
          raw: responseText,
        },
        { status: 500 },
      );
    }

    return NextResponse.json(parsed);
  } catch (error: unknown) {
    console.error("Kenko evaluation error:", error);
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json(
      { error: `Evaluation failed: ${message}` },
      { status: 500 },
    );
  }
}
