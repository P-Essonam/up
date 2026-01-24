"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { usePreloadedQuery } from "convex/react"
import type { Preloaded } from "convex/react"
import { Layers } from "lucide-react"
import { api } from "../../../../convex/_generated/api"

type WorkspacePageProps = {
  preloadedSpaces: Preloaded<typeof api.spaces.listWithLists>
}

export default function WorkspacePage({ preloadedSpaces }: WorkspacePageProps) {
  const router = useRouter()
  const spacesData = usePreloadedQuery(preloadedSpaces)

  useEffect(() => {
    if (spacesData.length > 0 && spacesData[0].lists.length > 0) {
      router.replace(`/dashboard/lists/${spacesData[0].lists[0]._id}`)
    }
  }, [spacesData, router])

  if (spacesData.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 p-8 text-center animate-in fade-in zoom-in duration-300">
        <div className="flex size-20 items-center justify-center rounded-full bg-muted/50">
          <Layers className="size-10 text-muted-foreground" />
        </div>
        <h2 className="mt-4 text-xl font-semibold">Welcome to Spaces</h2>
        <p className="max-w-sm text-sm text-muted-foreground leading-relaxed">
          Spaces help you organize your tasks and lists. <br />
          Create a new space in the sidebar to get started.
        </p>
      </div>
    )
  }

  return null
}
