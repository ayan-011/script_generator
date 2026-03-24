"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Copy, Check, RefreshCw } from "lucide-react"
import { useState } from "react"

interface ScriptOutputProps {
  script: string
  isStreaming: boolean
  onRegenerate?: () => void
}

export function ScriptOutput({ script, isStreaming, onRegenerate }: ScriptOutputProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(script)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
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
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-border">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <span className="text-accent">Generated Script</span>
          {isStreaming && (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground font-normal">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              Generating...
            </span>
          )}
        </h3>
        <div className="flex gap-2">
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
            disabled={!script}
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
            {script}
            {isStreaming && <span className="inline-block w-2 h-5 bg-accent animate-pulse ml-1" />}
          </pre>
        </div>
      </div>
    </Card>
  )
}
