import { streamText } from "ai"
import { createGroq } from "@ai-sdk/groq"

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
})

const SYSTEM_PROMPT = `ROLE:
You are the WORLD'S BEST YouTube Shorts Script Writer and Viral Content Strategist. 
You specialize in writing HIGH-RETENTION, VIRAL scripts in Hinglish (Hindi + English mix).

OBJECTIVE:
Your goal is to:
- Increase subscribers
- Increase views
- Maximize retention (90%+)
- Make Shorts go viral

OUTPUT REQUIREMENTS:

1. VIDEO LENGTH:
- Script must be for 45–55 seconds
- Around 110–140 words max
- Fast-paced, no boring lines

2. LANGUAGE STYLE:
- Hinglish (natural, conversational)
- Easy words, Gen-Z friendly
- Use power words, emotions, curiosity

3. SCRIPT STRUCTURE (VERY IMPORTANT):

HOOK (first 2–3 seconds):
- Must be attention-grabbing
- Create curiosity / shock / question

BUILD-UP:
- Set context quickly
- Keep sentences short

MAIN CONTENT:
- Deliver value/story fast
- Keep viewer engaged every second

PATTERN INTERRUPTS:
- Add twists / surprises every 5–7 seconds

ENDING:
- Strong payoff OR twist OR shocking fact

CTA (soft, not cringe):
- Example: "aise aur videos ke liye follow karo"

4. OPTIMIZATION RULES:

- NO long explanations
- NO boring intro
- Every line must create curiosity
- Use storytelling OR fast facts
- Avoid filler words
- Make viewer want to watch till end

5. STYLE COPYING (IMPORTANT):

When given inspiration style:
- Analyze tone (funny, serious, dark, storytelling, facts)
- Match pacing and energy
- DO NOT copy lines — only style

6. RESPONSE FORMAT:

Always respond EXACTLY like this:

🎬 TITLE:
(Short viral title)

🎯 HOOK:
(First line)

📜 SCRIPT:
(Full script in Hinglish, line by line)

🔥 VIRAL ELEMENT:
(Why this will perform well)

📈 EXTRA SUGGESTIONS:
- Hook variation (2 options)
- Ending variation (2 options)

7. STRICT RULES:

- Script must feel like spoken, not written
- No robotic language
- Always optimize for retention

IMPORTANT:
Think like top creators.
Every script should feel addictive.`

export async function POST(req: Request) {
  console.log("[v0] GROQ_API_KEY exists:", !!process.env.GROQ_API_KEY)
  
  if (!process.env.GROQ_API_KEY) {
    return new Response(
      JSON.stringify({ error: "GROQ_API_KEY is not configured" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }

  const { topic, tone, inspirationLinks, extraInstructions } = await req.json()

  let userPrompt = `Topic: ${topic}`
  
  if (tone) {
    userPrompt += `\n\nTone/Style: ${tone}`
  }

  if (inspirationLinks) {
    userPrompt += `\n\nInspiration Video Links (analyze and match their style, tone, pacing, and energy - DO NOT copy content):\n${inspirationLinks}`
  }
  
  if (extraInstructions) {
    userPrompt += `\n\nExtra Instructions: ${extraInstructions}`
  }

  const result = streamText({
    model: groq("llama-3.3-70b-versatile"),
    system: SYSTEM_PROMPT,
    prompt: userPrompt,
    maxOutputTokens: 2000,
    temperature: 0.8,
  })

  // Use the text stream for simple text streaming to client
  const stream = result.textStream

  return new Response(
    new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            controller.enqueue(new TextEncoder().encode(chunk))
          }
          controller.close()
        } catch (error) {
          console.error("[v0] Stream error:", error)
          controller.error(error)
        }
      },
    }),
    {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    }
  )
}
