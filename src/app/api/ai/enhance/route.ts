import { NextRequest, NextResponse } from "next/server";
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
Gebruik een mix van:
- 2-3 HIGH VOLUME hashtags (groot bereik, veel concurrentie)
- 2-3 MEDIUM hashtags (gericht, minder concurrentie)  
- 1-2 NICHE hashtags (zeer specifiek, trouwe doelgroep)
- Altijd trending/actuele hashtags meenemen waar relevant

### POPULAIRE CONVERTERENDE HASHTAGS (kies de meest relevante):
High Volume: #NSFW #OnlyFans #Fansly #RT #ContentCreator #AdultContent
Medium: #NSFWtwt #lewdtwt #Homemade #Amateur #Viral #TrendingNow #Explore
Niche (kies op basis van content): #GFE #Cosplay #Fetish #Solo #Lingerie #Curves #Petite #Thick #Goth #Alt #Tattoo #Redhead #Brunette #Blonde #Asian #Latina #Ebony #MILF #Teen18 #College

### OUTPUT FORMAT:
Geef ALTIJD exact dit JSON-formaat terug, NIETS ANDERS:
{
  "enhanced": "De verbeterde tweet tekst (zonder hashtags)",
  "hashtags": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5", "#tag6", "#tag7"],
  "reasoning": "Korte uitleg waarom deze versie beter converteert",
  "alternatives": [
    "Alternatieve versie 1 (ander perspectief/tone)",
    "Alternatieve versie 2 (meer urgentie/FOMO)"
  ]
}`;

export async function POST(req: NextRequest) {
  try {
    const { draft, style, niche } = await req.json();

    if (!draft) {
      return NextResponse.json({ error: "Draft tekst is vereist" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "GEMINI_API_KEY niet geconfigureerd in .env.local" }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey });

    const userPrompt = `
Verbeter deze tweet voor maximale engagement en conversie:

DRAFT: "${draft}"
${style ? `GEWENSTE STIJL: ${style}` : ""}
${niche ? `NICHE/TYPE CONTENT: ${niche}` : ""}

Maak er een killer tweet van die likes, retweets en link-clicks oplevert. Gebruik de meest relevante hashtags voor dit type content. Geef het resultaat als JSON.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: userPrompt,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.9,
        maxOutputTokens: 1024,
      },
    });

    const text = response.text || "";
    
    // Extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: "AI gaf geen geldig antwoord", raw: text }, { status: 500 });
    }

    const result = JSON.parse(jsonMatch[0]);
    return NextResponse.json(result);

  } catch (error: any) {
    console.error("AI Enhance Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
