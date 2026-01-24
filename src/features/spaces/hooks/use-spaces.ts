"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useMutation, useQuery } from "convex/react"
import { api } from "../../../../convex/_generated/api"
import type { Id } from "../../../../convex/_generated/dataModel"
import type { Space } from "../lib/types"

export function useSpaces() {
  const router = useRouter()

  // Query
  const spacesData = useQuery(api.spaces.listWithLists)

  // UI state for open/closed spaces
  const [openSpaces, setOpenSpaces] = useState<Set<string>>(() => new Set())

  // Mutations
  const createSpaceMutation = useMutation(api.spaces.create)
  const updateSpaceMutation = useMutation(api.spaces.update)
  const removeSpaceMutation = useMutation(api.spaces.remove)
  const reorderSpacesMutation = useMutation(api.spaces.reorder)

  const createListMutation = useMutation(api.lists.create)
  const updateListMutation = useMutation(api.lists.update)
  const removeListMutation = useMutation(api.lists.remove)
  const reorderListsMutation = useMutation(api.lists.reorder)

  const createTaskMutation = useMutation(api.tasks.create)

  // Merge server data with local UI state
  const spaces: Space[] = useMemo(() => {
    if (!spacesData) return []
    return spacesData.map((space) => ({
      ...space,
      isOpen: openSpaces.has(space._id) || openSpaces.size === 0,
    }))
  }, [spacesData, openSpaces])

  // Initialize openSpaces when data loads
  useEffect(() => {
    if (spacesData && openSpaces.size === 0) {
      setOpenSpaces(new Set(spacesData.map((s) => s._id)))
    }
  }, [spacesData, openSpaces.size])

  const isLoading = spacesData === undefined

  // Toggle space open/closed
  const toggleSpace = (spaceId: Id<"spaces">) => {
    setOpenSpaces((prev) => {
      const next = new Set(prev)
      if (next.has(spaceId)) {
        next.delete(spaceId)
      } else {
        next.add(spaceId)
      }
      return next
    })
  }

  // Create space with default list and task, then redirect
  const createSpaceWithDefaults = async (values: {
    name: string
    description?: string
    color?: string
    icon?: string
  }) => {
    const spaceId = await createSpaceMutation({
      name: values.name,
      description: values.description,
      color: values.color,
      icon: values.icon,
    })

    const listId = await createListMutation({
      spaceId,
      name: "List",
    })

    await createTaskMutation({
      listId,
      title: "My first task",
    })

    setOpenSpaces((prev) => new Set([...prev, spaceId]))
    router.push(`/dashboard/spaces/${spaceId}/lists/${listId}`)
  }

  // Update space
  const updateSpace = async (
    id: Id<"spaces">,
    values: { name?: string; description?: string; color?: string; icon?: string }
  ) => {
    await updateSpaceMutation({ id, ...values })
  }

  // Delete space
  const deleteSpace = async (id: Id<"spaces">) => {
    await removeSpaceMutation({ id })
    setOpenSpaces((prev) => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }

  // Reorder spaces
  const reorderSpaces = async (orderedIds: Id<"spaces">[]) => {
    await reorderSpacesMutation({ orderedIds })
  }

  // Create list
  const createList = async (spaceId: Id<"spaces">, name: string) => {
    await createListMutation({ spaceId, name })
  }

  // Update list
  const updateList = async (
    id: Id<"lists">,
    values: { name?: string; description?: string; color?: string }
  ) => {
    await updateListMutation({ id, ...values })
  }

  // Delete list
  const deleteList = async (id: Id<"lists">) => {
    await removeListMutation({ id })
  }

  // Reorder lists
  const reorderLists = async (spaceId: Id<"spaces">, orderedIds: Id<"lists">[]) => {
    await reorderListsMutation({ spaceId, orderedIds })
  }

  return {
    spaces,
    isLoading,
    toggleSpace,
    createSpaceWithDefaults,
    updateSpace,
    deleteSpace,
    reorderSpaces,
    createList,
    updateList,
    deleteList,
    reorderLists,
  }
}
