import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { GoogleGenAI } from "@google/genai";

const SYSTEM_PROMPT = `Je bent een expert social media copywriter gespecialiseerd in het laten groeien van adult/NSFW Twitter-accounts. Je kent alle trucs om engagement, clicks en conversies te maximaliseren.

### JOUW EXPERTISE:
- Je schrijft prikkelende, mysterieuze beschrijvingen die nieuwsgierigheid opwekken
- Je gebruikt psychologische triggers: schaarste, exclusiviteit, FOMO, curiosity gaps
- Je weet welke woorden en zinnen het beste converteren op adult Twitter
- Je kent de balans tussen suggestief en expliciet (Twitter's regels respecteren)
- Je optimaliseert voor zowel engagement (likes/RT) als conversie (link clicks)

### SCHRIJFREGELS:
1. KORT EN KRACHTIG: Max 200 karakters voor de hoofdtekst (ruimte voor hashtags)
2. HOOK EERST: Begin altijd met een attention-grabber
3. CURIOSITY GAP: Geef net genoeg weg om nieuwsgierig te maken, nooit alles
4. CTA: Altijd een subtiele call-to-action (link in bio, DM me, etc.)
5. EMOJI'S: Gebruik 2-3 relevante emoji's, niet meer
6. GEEN EXPLICIETE WOORDEN die Twitter zou flaggen

### HASHTAG STRATEGIE:
Gebruik PRECIES 2 relevante hashtags. Kies de meest trending/relevante voor het type content.

### OUTPUT FORMAT:
Geef ALTIJD exact dit JSON-formaat terug, NIETS ANDERS:
{
  "enhanced": "De verbeterde tweet tekst (zonder hashtags)",
  "hashtags": ["#tag1", "#tag2"],
  "reasoning": "Korte uitleg waarom deze versie beter converteert",
  "alternatives": [
    "Alternatieve versie 1 (ander perspectief/tone)",
    "Alternatieve versie 2 (meer urgentie/FOMO)"
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
