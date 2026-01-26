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

    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 p-8 text-center">
        <div className="flex size-10 items-center justify-center rounded-full bg-muted">
          <Layers className="size-5 text-muted-foreground" />
        </div>
        <h2 className="mt-4 text-xl font-semibold">Welcome to Spaces</h2>
        <p className="max-w-sm text-sm text-muted-foreground leading-relaxed">
          Spaces help you organize your tasks and lists. <br />
          Create a new space in the sidebar to get started.
        </p>
      </div>
    )
 
}
