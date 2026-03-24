"use client"

import { useState, useRef } from "react"
import { ScriptForm } from "@/components/script-form"
import { ScriptOutput } from "@/components/script-output"
import { Zap, Youtube, TrendingUp, Clock } from "lucide-react"

export default function Home() {
  const [script, setScript] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const lastRequestRef = useRef<{ topic: string; tone: string; inspirationLinks: string; extraInstructions: string } | null>(null)

  const handleGenerate = async (data: { topic: string; tone: string; inspirationLinks: string; extraInstructions: string }) => {
    setIsLoading(true)
    setScript("")
    lastRequestRef.current = data

    try {
      console.log("[v0] Starting request with data:", data)
      const response = await fetch("/api/generate-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      console.log("[v0] Response status:", response.status)
      if (!response.ok) {
        const errorText = await response.text()
        console.error("[v0] Error response:", errorText)
        throw new Error("Failed to generate script")
      }
      if (!response.body) throw new Error("No response body")

      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        setScript((prev) => prev + chunk)
      }
    } catch (error) {
      console.error("Error generating script:", error)
      setScript("Error generating script. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegenerate = () => {
    if (lastRequestRef.current) {
      handleGenerate(lastRequestRef.current)
    }
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
              <Zap className="w-5 h-5 text-accent-foreground" />
            </div>
            <span className="font-semibold text-foreground text-lg">ScriptGen</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Youtube className="w-4 h-4" />
            <span>Shorts Script Generator</span>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-accent text-sm font-medium tracking-wide uppercase mb-4">
            AI-Powered Script Writer
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 text-balance">
            Generate Viral Script
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto text-pretty">
            Create high-retention Hinglish scripts optimized for maximum views, 
            engagement, and subscriber growth. Powered by AI.
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 pb-8">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card border border-border rounded-xl p-4 flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h3 className="font-medium text-foreground text-sm">High Retention</h3>
              <p className="text-muted-foreground text-xs">Pattern interrupts every 5-7 seconds</p>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h3 className="font-medium text-foreground text-sm">Viral Hooks</h3>
              <p className="text-muted-foreground text-xs">Attention-grabbing first 3 seconds</p>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h3 className="font-medium text-foreground text-sm">45-55 Seconds</h3>
              <p className="text-muted-foreground text-xs">Optimal length for Shorts algorithm</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="px-4 pb-16">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-foreground mb-6">
              Create Your Script
            </h2>
            <ScriptForm onGenerate={handleGenerate} isLoading={isLoading} />
          </div>

          {/* Output */}
          <div>
            <ScriptOutput 
              script={script} 
              isStreaming={isLoading} 
              onRegenerate={script && !isLoading ? handleRegenerate : undefined}
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-6 px-4">
        <div className="max-w-7xl mx-auto text-center text-sm text-muted-foreground">
          Generate viral Hinglish scripts for YouTube Shorts with AI
        </div>
      </footer>
    </main>
  )
}
