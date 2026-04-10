import { NextResponse } from 'next/server';
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export async function POST(request: Request) {
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ error: "GEMINI_API_KEY is not configured." }, { status: 500 });
  }

  try {
    const { symptoms } = await request.json();

    const prompt = `
      You are a medical triage assistant. Analyze the following patient symptoms and provide a structured JSON response.
      Symptoms: "${symptoms}"

      Return a JSON object with the following structure:
      {
        "detectedArea": "one of: head, chest, heart, lungs, abdomen, arm, leg",
        "confidence": "low, medium, or high",
        "keywordsMatched": ["list of relevant medical terms found"],
        "explanation": "Brief clinical explanation of the symptoms",
        "recommendation": "Next steps for the patient",
        "urgency": "low, medium, high, or emergency"
      }
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const result = JSON.parse(response.text || '{}');
    return NextResponse.json(result);
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return NextResponse.json({ error: "Failed to analyze symptoms" }, { status: 500 });
  }
}
