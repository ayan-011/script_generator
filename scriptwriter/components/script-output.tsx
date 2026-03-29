"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Copy, Check, RefreshCw, Loader2 } from "lucide-react"
import { useState } from "react"

interface ScriptOutputProps {
  script: string
  isStreaming: boolean
  onRegenerate?: () => void
}

const LANGUAGES = [
  { value: "hinglish", label: "Hinglish" },
  { value: "english", label: "English" },
  { value: "hindi", label: "Hindi" },
  { value: "japanese", label: "Japanese" },
  { value: "spanish", label: "Spanish" },
  { value: "korean", label: "Korean" },
  { value: "french", label: "French" },
  { value: "german", label: "German" },
  { value: "portuguese", label: "Portuguese" },
]

export function ScriptOutput({ script, isStreaming, onRegenerate }: ScriptOutputProps) {
  const [copied, setCopied] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState("hinglish")
  const [translatedScript, setTranslatedScript] = useState("")
  const [isTranslating, setIsTranslating] = useState(false)

  const handleCopy = async () => {
    const textToCopy = selectedLanguage === "hinglish" ? script : translatedScript
    await navigator.clipboard.writeText(textToCopy)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleLanguageChange = async (language: string) => {
    setSelectedLanguage(language)
    
    if (language === "hinglish" || !script) {
      setTranslatedScript("")
      return
    }

    setIsTranslating(true)
    try {
      const response = await fetch("/api/translate-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          script,
          targetLanguage: language,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("[v0] Translation error:", errorText)
        throw new Error("Failed to translate script")
      }

      if (!response.body) throw new Error("No response body")

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let translatedText = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        translatedText += chunk
      }

      setTranslatedScript(translatedText)
    } catch (error) {
      console.error("[v0] Error translating script:", error)
      setTranslatedScript("Error translating script. Please try again.")
    } finally {
      setIsTranslating(false)
    }
  }

  if (!script && !isStreaming) {
    return (
      <Card className="bg-card border-border p-8 flex flex-col items-center justify-center min-h-[400px] text-center">
        <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
          <span className="text-3xl">✍️</span>
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Your Script Will Appear Here
        </h3>
        <p className="text-muted-foreground text-sm max-w-sm">
          Enter a topic and click generate to create a viral YouTube Shorts script in Hinglish
        </p>
      </Card>
    )
  }

  return (
    <Card className="bg-card border-border p-6 min-h-[400px] flex flex-col">
      <div className="mb-4 pb-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <span className="text-accent">Generated Script</span>
            {isStreaming && (
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground font-normal">
                <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                Generating...
              </span>
            )}
          </h3>
        </div>

        {script && !isStreaming && (
          <div className="mb-4">
            <label className="text-xs font-medium text-muted-foreground block mb-2">
              Language
            </label>
            <Select value={selectedLanguage} onValueChange={handleLanguageChange} disabled={isTranslating}>
              <SelectTrigger className="bg-secondary border-border text-foreground w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="flex gap-2 flex-wrap">
          {onRegenerate && !isStreaming && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRegenerate}
              className="text-muted-foreground hover:text-foreground"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Regenerate
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            disabled={!script || isTranslating}
            className="text-muted-foreground hover:text-foreground"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 mr-1" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-1" />
                Copy
              </>
            )}
          </Button>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto">
        <div className="prose prose-invert prose-sm max-w-none">
          <pre className="whitespace-pre-wrap font-sans text-foreground bg-transparent p-0 text-sm leading-relaxed">
            {isTranslating ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Translating to {LANGUAGES.find(l => l.value === selectedLanguage)?.label}...
              </div>
            ) : selectedLanguage === "hinglish" ? (
              <>
                {script}
                {isStreaming && <span className="inline-block w-2 h-5 bg-accent animate-pulse ml-1" />}
              </>
            ) : (
              translatedScript
            )}
          </pre>
        </div>
      </div>
    </Card>
  )
}
