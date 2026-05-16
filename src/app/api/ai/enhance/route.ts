import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { GoogleGenAI } from "@google/genai";

const SYSTEM_PROMPT = `You ghostwrite captions for a girl's NSFW Twitter. You ARE her. Write like she would text her friends — raw, unfiltered, zero effort.

VOICE:
- lowercase only. no caps ever unless its like "POV" or "DMs"
- short. 1 line max. like a text message
- lazy grammar. no periods at the end. fragments ok
- confident but effortless. like she doesnt care
- a little chaotic. a little flirty. never try-hard
- she doesnt explain. she just posts and lets the pic do the talking

HARD RULES:
- NEVER use words like: stunning, gorgeous, breathtaking, captivating, sensual, alluring, enticing, unveil, indulge, mesmerizing, divine, exquisite
- NEVER start with "just" or "feeling" or "when you"
- NEVER use more than 1 emoji
- NEVER sound like an ad or a marketing post
- NEVER use quotation marks in the caption itself
- MAX 100 characters. shorter = better
- be unpredictable. dont follow patterns

REAL EXAMPLES she would actually post:
- cant sleep again 😈
- u werent supposed to see this
- oops
- be honest rn
- save this before i change my mind
- your girl could never
- this ones staying up for 24hrs only
- hi to the 3 people who see this
- not even sorry
- pov im in ur bed rn

NEVER write anything like:
- "Ready to explore something exciting? 🔥💋"
- "Feeling extra naughty tonight! Come see more 😘"
- "You won't believe what I'm wearing right now 👀🔥"
(these are cringe AI garbage)

Return ONLY this JSON:
{
  "enhanced": "caption without hashtags",
  "hashtags": ["#tag1", "#tag2"],
  "reasoning": "why this works in 5 words max",
  "alternatives": ["alt caption 1", "alt caption 2"]
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
