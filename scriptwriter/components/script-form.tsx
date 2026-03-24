"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { Sparkles } from "lucide-react"

interface ScriptFormProps {
  onGenerate: (data: { topic: string; tone: string; inspirationLinks: string; extraInstructions: string }) => void
  isLoading: boolean
}

const TONE_OPTIONS = [
  { value: "funny", label: "Funny / Comedy" },
  { value: "serious", label: "Serious / Informative" },
  { value: "dark", label: "Dark / Suspense" },
  { value: "storytelling", label: "Storytelling" },
  { value: "facts", label: "Fast Facts" },
  { value: "motivational", label: "Motivational" },
  { value: "roast", label: "Roast / Savage" },
]

export function ScriptForm({ onGenerate, isLoading }: ScriptFormProps) {
  const [topic, setTopic] = useState("")
  const [tone, setTone] = useState("")
  const [inspirationLinks, setInspirationLinks] = useState("")
  const [extraInstructions, setExtraInstructions] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!topic.trim()) return
    onGenerate({ topic, tone, inspirationLinks, extraInstructions })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Label htmlFor="topic" className="text-sm font-medium text-foreground">
          Video Topic
        </Label>
        <Input
          id="topic"
          placeholder="e.g., Why Elon Musk is a genius, 5 facts about space..."
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="bg-secondary border-border text-foreground placeholder:text-muted-foreground"
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="tone" className="text-sm font-medium text-foreground">
          Tone / Style
        </Label>
        <Select value={tone} onValueChange={setTone}>
          <SelectTrigger className="bg-secondary border-border text-foreground">
            <SelectValue placeholder="Select a tone..." />
          </SelectTrigger>
          <SelectContent>
            {TONE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="inspiration" className="text-sm font-medium text-foreground">
          Inspiration Video Links (Optional)
        </Label>
        <Textarea
          id="inspiration"
          placeholder="Paste YouTube Shorts links for style reference (one per line)...
e.g., https://youtube.com/shorts/abc123"
          value={inspirationLinks}
          onChange={(e) => setInspirationLinks(e.target.value)}
          className="bg-secondary border-border text-foreground placeholder:text-muted-foreground min-h-[80px] resize-none"
        />
        <p className="text-xs text-muted-foreground">
          Add links to videos whose style you want to match (tone, pacing, energy)
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="extra" className="text-sm font-medium text-foreground">
          Extra Instructions (Optional)
        </Label>
        <Textarea
          id="extra"
          placeholder="Add any specific requirements, target audience notes, or style preferences..."
          value={extraInstructions}
          onChange={(e) => setExtraInstructions(e.target.value)}
          className="bg-secondary border-border text-foreground placeholder:text-muted-foreground min-h-[100px] resize-none"
        />
      </div>

      <Button
        type="submit"
        disabled={isLoading || !topic.trim()}
        className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold py-6 text-base"
      >
        {isLoading ? (
          <>
            <Spinner className="mr-2" />
            Generating Script...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-5 w-5" />
            Generate Viral Script
          </>
        )}
      </Button>
    </form>
  )
}
