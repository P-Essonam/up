"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useQuery } from "convex/react"
import { Layers, Loader2 } from "lucide-react"
import { api } from "../../../../../convex/_generated/api"

export default function SpacesPage() {
  const router = useRouter()
  const spacesData = useQuery(api.spaces.listWithLists)

  useEffect(() => {
    if (spacesData === undefined) return

    const firstSpace = spacesData[0]
    const firstList = firstSpace?.lists?.[0]

    if (firstSpace && firstList) {
      router.replace(`/dashboard/spaces/${firstSpace._id}/lists/${firstList._id}`)
    }
  }, [spacesData, router])

  if (spacesData === undefined) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

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
