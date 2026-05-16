import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { GoogleGenAI } from "@google/genai";

const SYSTEM_PROMPT = `You ghostwrite spicy captions for a popular NSFW Twitter girl. Be BOLD. Be DIRECT. Make people stop scrolling.

VOICE:
- lowercase only. never capitalize
- short and punchy. max 1-2 lines
- confident, dominant energy. she knows shes hot
- dirty but clever. suggestive not clinical
- no filter. say what guys are thinking
- talk TO the reader directly. make it personal

HARD RULES:
- NEVER be wholesome, cute or soft
- NEVER use cringe AI words: stunning, gorgeous, breathtaking, captivating, sensual, alluring, divine, exquisite, mesmerizing
- NEVER sound like a marketing ad
- NEVER use more than 1 emoji
- MAX 120 characters
- be provocative. push boundaries. thats what gets engagement

EXAMPLES OF BANGERS (match this energy):
- imagine waking up to this view every morning
- this is what ur missing rn
- tell me what ud do if i sent this to ur DMs 😈
- who said good girls cant be bad
- i dare u to screenshot this
- do i make u nervous
- ur gf is gonna hate me for this
- i know u zoomed in
- this pic got me feeling dangerous
- would u let me ruin ur life
- send this to someone who needs to see it
- the things id let u do to me rn
- rate me 1-10 be honest
- bet u cant handle this
- come find out what happens after this pic

WEAK EXAMPLES (NEVER write boring shit like this):
- "u like" (too vague, zero effort)
- "not much on tonight" (boring, says nothing)
- "wearing this for u" (generic, forgettable)
- "oops" (lazy, no hook)

Return ONLY this JSON:
{
  "enhanced": "caption without hashtags",
  "hashtags": ["#tag1", "#tag2"],
  "reasoning": "why this slaps in 5 words",
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

    const nicheHashtags: Record<string, string> = {
      "Lingerie / Boudoir": "use hashtags like #lingerie #boudoir #lace #intimate",
      "Cosplay": "use hashtags like #cosplay #cosplaygirl #anime",
      "GFE (Girlfriend Experience)": "use hashtags like #GFE #girlfriend #cute",
      "Fetish": "use hashtags like #fetish #kink #kinky",
      "Solo": "use hashtags like #solo #onlyme #selflove",
      "Couples": "use hashtags like #couple #couplegoals #hot",
      "Alt / Goth": "use hashtags like #goth #alt #gothgirl #egirl",
      "Fitness": "use hashtags like #fit #fitgirl #gym #gains",
      "Curves / Thick": "use hashtags like #thick #curves #curvy #body",
      "Petite": "use hashtags like #petite #tiny #small",
      "Custom Content": "use hashtags like #custom #exclusive #personalized",
      "PPV / Exclusives": "use hashtags like #exclusive #PPV #premium",
      "General": "pick 2 trending NSFW hashtags that fit the content",
    };

    const nicheGuide = nicheHashtags[niche || "General"] || nicheHashtags["General"];

    const userPrompt = `
Write a spicy caption for this NSFW tweet. The content/niche is: ${niche || "General"}

What the image shows: "${draft}"

Instructions:
- Write a caption that matches the ${niche || "general"} vibe specifically
- ${nicheGuide}
- Make it provocative and engaging, NOT generic
- Caption must relate to what the image actually shows
- Return as JSON`;

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
