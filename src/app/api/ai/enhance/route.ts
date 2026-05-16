import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { GoogleGenAI } from "@google/genai";

const SYSTEM_PROMPT = `You write captions for a popular NSFW Twitter/X account. Your job is to write SHORT, catchy, flirty captions that get likes, retweets and clicks.

RULES:
- Write in ENGLISH only
- Keep it under 150 characters (short = more engagement)
- Sound like a real person, NOT a marketing bot
- Be playful, teasing, confident and a little naughty
- Use 1-2 emojis max, placed naturally
- NEVER sound corporate, robotic or desperate
- NEVER use phrases like "link in bio", "don't miss out", "exclusive content"
- NEVER write full sentences with proper grammar — keep it casual like texting
- Match the vibe of viral NSFW Twitter

EXAMPLES OF GOOD CAPTIONS (study the tone):
- "felt cute, might delete later 😈"
- "would you look at me if i walked by? 👀"
- "your timeline needed this 🖤"
- "up late again... come keep me company"
- "POV: you open your DMs and see this"
- "be honest... would you? 😏"
- "i know you saved this 😈"
- "this one's for the night owls 🦉"
- "good girls don't post stuff like this... good thing i'm not one 😏"
- "caught you staring 👀"

BAD EXAMPLES (NEVER write like this):
- "🔥 Don't miss this exclusive content! Click the link in bio for more! 💋🔥"
- "Hey everyone! Check out my latest post, I think you'll really enjoy it!"
- "Unveiling my newest creation for your viewing pleasure"

OUTPUT FORMAT — return ONLY this JSON, nothing else:
{
  "enhanced": "the caption text without hashtags",
  "hashtags": ["#tag1", "#tag2"],
  "reasoning": "1 sentence why this works",
  "alternatives": [
    "alternative caption 1 (different vibe)",
    "alternative caption 2 (more teasing)"
  ]
}`;

async function generateWithGroq(userPrompt: string): Promise<any> {
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  
  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.9,
    max_tokens: 1024,
    response_format: { type: "json_object" },
  });

  const text = completion.choices[0]?.message?.content || "";
  return JSON.parse(text);
}

async function generateWithGemini(userPrompt: string): Promise<any> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
  
  const response = await ai.models.generateContent({
    model: "gemini-1.5-flash",
    contents: userPrompt,
    config: {
      systemInstruction: SYSTEM_PROMPT,
      temperature: 0.9,
      maxOutputTokens: 1024,
    },
  });

  const text = response.text || "";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Invalid response");
  return JSON.parse(jsonMatch[0]);
}

export async function POST(req: NextRequest) {
  try {
    const { draft, style, niche } = await req.json();

    if (!draft) {
      return NextResponse.json({ error: "Draft tekst is vereist" }, { status: 400 });
    }

    const userPrompt = `
Verbeter deze tweet voor maximale engagement en conversie:

DRAFT: "${draft}"
${style ? `GEWENSTE STIJL: ${style}` : ""}
${niche ? `NICHE/TYPE CONTENT: ${niche}` : ""}

Maak er een killer tweet van die likes, retweets en link-clicks oplevert. Gebruik PRECIES 2 relevante hashtags. Geef het resultaat als JSON.`;

    // Try Groq first (faster, higher limits), fallback to Gemini
    if (process.env.GROQ_API_KEY) {
      try {
        const result = await generateWithGroq(userPrompt);
        return NextResponse.json(result);
      } catch (groqError: any) {
        console.error("Groq failed, trying Gemini:", groqError.message);
      }
    }

    // Fallback to Gemini
    if (process.env.GEMINI_API_KEY) {
      try {
        const result = await generateWithGemini(userPrompt);
        return NextResponse.json(result);
      } catch (geminiError: any) {
        console.error("Gemini also failed:", geminiError.message);
        return NextResponse.json({ error: "AI is even druk. Probeer het over 10 seconden opnieuw." }, { status: 429 });
      }
    }

    return NextResponse.json({ error: "Geen AI API key geconfigureerd. Voeg GROQ_API_KEY of GEMINI_API_KEY toe." }, { status: 500 });

  } catch (error: any) {
    console.error("AI Enhance Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
