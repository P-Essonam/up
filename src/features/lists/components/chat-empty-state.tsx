"use client"

import { FileText, Lightbulb, Pencil, Sparkles, Zap } from "lucide-react"

import { AI_SUGGESTIONS } from "../lib/constants"

const ICON_MAP = {
  Lightbulb,
  FileText,
  Pencil,
  Sparkles,
  Zap,
}

export function ChatEmptyState({
  onSuggestionClick,
}: {
  onSuggestionClick: (s: string) => void
}) {
  return (
    <div className="flex flex-1 flex-col justify-center p-6">
      <div className="mx-auto w-full max-w-md space-y-8">
        
        {/* Suggested Section */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">Suggested</p>
          <div className="grid gap-1">
            {AI_SUGGESTIONS.slice(0, 3).map((suggestion) => {
              const Icon = ICON_MAP[suggestion.icon as keyof typeof ICON_MAP] || Sparkles
              return (
                <button
                  key={suggestion.text}
                  className="group flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left text-sm transition-colors hover:bg-accent/50"
                  onClick={() => onSuggestionClick(suggestion.text)}
                >
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
                    <Icon className="size-4" />
                  </div>
                  <span className="text-foreground/90">{suggestion.text}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Featured Section - Using remaining suggestions as featured for now to match the image structure */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">Featured</p>
          <div className="grid gap-1">
            {AI_SUGGESTIONS.slice(3, 6).map((suggestion) => {
              const Icon = ICON_MAP[suggestion.icon as keyof typeof ICON_MAP] || Sparkles
              return (
                <button
                  key={suggestion.text}
                  className="group flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left text-sm transition-colors hover:bg-accent/50"
                  onClick={() => onSuggestionClick(suggestion.text)}
                >
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-blue-500/10 text-blue-600 transition-colors group-hover:bg-blue-500/20 dark:bg-blue-500/20 dark:text-blue-400">
                    <Icon className="size-4" />
                  </div>
                  <span className="flex-1 text-foreground/90">{suggestion.text}</span>
                  {suggestion.text.includes("Create") && (
                    <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                      New
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

      </div>
    </div>
  )
}
