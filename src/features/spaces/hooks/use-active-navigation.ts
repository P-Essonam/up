"use client"

import { useMemo } from "react"
import { usePathname } from "next/navigation"
import type { Space } from "../lib/types"

export function useActiveNavigation(spaces: Space[]) {
  const pathname = usePathname()

  const activeListId = pathname?.match(/\/lists\/([^/]+)/)?.[1] ?? null

  const activeSpaceId = useMemo(() => {
    if (!activeListId) return null
    return spaces.find(s => s.lists.some(l => l._id === activeListId))?._id ?? null
  }, [activeListId, spaces])

  return { activeListId, activeSpaceId }
}
