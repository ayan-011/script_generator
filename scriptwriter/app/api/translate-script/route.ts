import { streamText } from "ai"
import { createGroq } from "@ai-sdk/groq"

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
})

const getTranslationPrompt = (targetLanguage: string) => {
  const languageInstructions: Record<string, string> = {
    english: `Translate the YouTube Shorts script to English. 
    - Keep the same energy, tone, and engagement level
    - Make it conversational and natural for English speakers
    - Maintain hook, structure, and viral elements
    - Do NOT add or remove content, just translate
    - Output ONLY the translated script, no explanations`,
    
    hindi: `हिंदी में YouTube Shorts स्क्रिप्ट का अनुवाद करें।
    - समान ऊर्जा, टोन और जुड़ाव स्तर रखें
    - हिंदी भाषियों के लिए प्राकृतिक और बातचीत शैली बनाएं
    - हुक, संरचना और वायरल तत्वों को बनाए रखें
    - केवल अनुवाद करें, कोई व्याख्या न जोड़ें
    - केवल अनुवादित स्क्रिप्ट आउटपुट करें, कोई व्याख्या नहीं`,
    
    japanese: `YouTubeショーツスクリプトを日本語に翻訳します。
    - 同じエネルギー、トーン、エンゲージメントレベルを保つ
    - 日本語話者にとって自然で会話的に
    - フック、構造、バイラル要素を維持する
    - 翻訳のみ、説明は追加しないでください
    - 翻訳されたスクリプトのみを出力し、説明はなし`,
    
    spanish: `Traduce el script de YouTube Shorts al español.
    - Mantén la misma energía, tono y nivel de engagement
    - Hazlo natural y conversacional para hablantes de español
    - Mantén el gancho, estructura y elementos virales
    - Solo traduce, no agregues ni elimines contenido
    - Devuelve SOLO el script traducido, sin explicaciones`,
    
    korean: `YouTube Shorts 스크립트를 한국어로 번역합니다.
    - 동일한 에너지, 톤 및 참여 수준 유지
    - 한국어 사용자를 위해 자연스럽고 대화체로 만들기
    - 훅, 구조 및 바이러스 요소 유지
    - 번역만 하고 설명을 추가하지 마십시오
    - 번역된 스크립트만 출력하고 설명 없음`,
    
    french: `Traduisez le script YouTube Shorts en français.
    - Conservez la même énergie, le ton et le niveau d'engagement
    - Rendez-le naturel et conversationnel pour les francophones
    - Maintenez le crochet, la structure et les éléments viraux
    - Traduisez uniquement, n'ajoutez ni ne supprimez de contenu
    - Renvoyez UNIQUEMENT le script traduit, sans explications`,
    
    german: `Übersetzen Sie das YouTube-Shorts-Skript ins Deutsche.
    - Behalten Sie die gleiche Energie, den Ton und das Engagement-Niveau bei
    - Machen Sie es für Deutschsprachige natürlich und gesprächig
    - Behalten Sie Hook, Struktur und virale Elemente bei
    - Nur übersetzen, keinen Inhalt hinzufügen oder entfernen
    - Geben Sie ONLY das übersetzte Skript aus, keine Erklärungen`,
    
    portuguese: `Traduzir o script do YouTube Shorts para português.
    - Mantenha a mesma energia, tom e nível de envolvimento
    - Torne-o natural e conversacional para falantes de português
    - Mantenha o gancho, a estrutura e os elementos virais
    - Apenas traduz, não adiciona nem remove conteúdo
    - Retorne APENAS o script traduzido, sem explicações`,
  }

  return (
    languageInstructions[targetLanguage] ||
    `Translate the script to ${targetLanguage}. Keep the same energy and tone. Output only the translated script.`
  )
}

export async function POST(req: Request) {
  console.log("[v0] Translation API called")
  console.log("[v0] GROQ_API_KEY exists:", !!process.env.GROQ_API_KEY)

  if (!process.env.GROQ_API_KEY) {
    return new Response(
      JSON.stringify({ error: "GROQ_API_KEY is not configured" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }

  const { script, targetLanguage } = await req.json()

  if (!script || !targetLanguage) {
    return new Response(
      JSON.stringify({ error: "script and targetLanguage are required" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    )
  }

  console.log("[v0] Translating to:", targetLanguage)

  const translationPrompt = getTranslationPrompt(targetLanguage)
  const userPrompt = `Here is the YouTube Shorts script to translate to ${targetLanguage}:\n\n${script}\n\n${translationPrompt}`

  const result = streamText({
    model: groq("llama-3.3-70b-versatile"),
    system: "You are a professional translator specializing in creative content. Translate the given script while preserving its tone, energy, and viral appeal. Output ONLY the translated script without any additional commentary or explanations.",
    prompt: userPrompt,
    maxOutputTokens: 2000,
    temperature: 0.7,
  })

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
