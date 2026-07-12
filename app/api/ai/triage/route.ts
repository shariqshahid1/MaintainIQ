import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";

const triageResponseSchema = z.object({
  title: z.string().min(1),
  category: z.string().min(1),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL", "EMERGENCY"]),
  possibleCauses: z.array(z.string()),
  safetyWarnings: z.array(z.string()),
  diagnosticChecks: z.array(z.string()),
  confidenceScore: z.number().min(0).max(1),
  recurringPatternWarning: z.string().optional(),
});

type TriageResponse = z.infer<typeof triageResponseSchema>;

const TRIAGE_PROMPT = `You are an expert maintenance and facilities management AI assistant.
Analyze the following maintenance issue description and provide a structured triage assessment.

Return ONLY valid JSON matching this exact structure:
{
  "title": "A concise, descriptive title for the issue",
  "category": "One of: PLUMBING, ELECTRICAL, HVAC, STRUCTURAL, APPLIANCE, SAFETY, GENERAL, OTHER",
  "priority": "One of: LOW, MEDIUM, HIGH, CRITICAL, EMERGENCY",
  "possibleCauses": ["List of possible root causes"],
  "safetyWarnings": ["Any safety concerns or hazards identified, empty array if none"],
   "diagnosticChecks": ["Recommended diagnostic steps to identify the root cause"],
   "confidenceScore": 0.0 to 1.0 indicating your confidence in this assessment,
   "recurringPatternWarning": "Optional: note if this sounds like a recurring failure pattern based on the description, or omit"
 }

Rules:
- If the description is in Roman Urdu, Hindi, or another language, silently translate it to English internally before analyzing; return all fields in English.
- safetyWarnings should highlight any immediate dangers
- diagnosticChecks should be specific, actionable steps
- confidenceScore should reflect how certain you are based on the information provided
- priority should consider both impact and urgency
- Always return valid JSON, no markdown formatting or code blocks`;

export async function POST(request: NextRequest) {
  try {
    const { description } = await request.json();

    if (
      !description ||
      typeof description !== "string" ||
      description.trim().length < 10
    ) {
      return NextResponse.json(
        { error: "Description must be at least 10 characters" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "AI service is not configured" },
        { status: 503 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const result = await model.generateContent(
      `${TRIAGE_PROMPT}\n\nIssue description:\n${description.trim()}`
    );

    const responseText = result.response.text();

    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("AI returned non-JSON response:", responseText);
      return NextResponse.json(
        { error: "AI returned an invalid response format" },
        { status: 502 }
      );
    }

    const parsed = JSON.parse(jsonMatch[0]);
    const validated = triageResponseSchema.safeParse(parsed);

    if (!validated.success) {
      console.error("AI response validation failed:", validated.error);
      return NextResponse.json(
        { error: "AI response did not match expected format" },
        { status: 502 }
      );
    }

    return NextResponse.json(validated.data satisfies TriageResponse);
  } catch (error: unknown) {
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "AI returned invalid JSON" },
        { status: 502 }
      );
    }

    const message =
      error instanceof Error ? error.message : "Unknown error";

    if (message.includes("429") || message.includes("quota")) {
      return NextResponse.json(
        { error: "AI service is rate-limited. Please try again later." },
        { status: 429 }
      );
    }

    if (message.includes("timeout") || message.includes("DEADLINE_EXCEEDED")) {
      return NextResponse.json(
        { error: "AI analysis timed out. Please try again." },
        { status: 504 }
      );
    }

    console.error("AI triage error:", error);
    return NextResponse.json(
      { error: "Failed to process AI analysis" },
      { status: 500 }
    );
  }
}
