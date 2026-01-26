"use client"

import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAskAIStore } from "../hooks/use-ask-ai-store"

export function AskAISidebar() {
  const isOpen = useAskAIStore((state) => state.isOpen)
  const close = useAskAIStore((state) => state.close)

  if (!isOpen) return null

  return (
    <div className="flex size-full max-w-sm shrink-0 flex-col border rounded-lg bg-background">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          {/* Header icons and title will go here */}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="size-6" onClick={close}>
            <X className="size-4" />
          </Button>
        </div>
      </div>

      {/* Main content area - scrollable */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {/* Content will go here */}
      </div>

      {/* Bottom input area - fixed */}
      <div className="flex shrink-0 border-t px-4 py-4">
        {/* Input field will go here */}
      </div>
    </div>
  )
}
