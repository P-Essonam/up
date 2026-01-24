"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
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

  // Optimistic state for drag-and-drop reordering
  const [optimisticSpaceOrder, setOptimisticSpaceOrder] = useState<Id<"spaces">[] | null>(null)
  const [optimisticListOrders, setOptimisticListOrders] = useState<Record<string, Id<"lists">[]>>({})

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

  // Merge server data with local UI state and optimistic ordering
  const spaces: Space[] = useMemo(() => {
    if (!spacesData) return []

    // Collect all lists from all spaces for cross-space moves
    const allLists = spacesData.flatMap((space) => space.lists)

    let orderedSpaces = spacesData.map((space) => {
      // Apply optimistic list order if exists
      const optimisticOrder = optimisticListOrders[space._id]
      let orderedLists = space.lists

      if (optimisticOrder) {
        // Look for lists in all spaces (for cross-space moves)
        orderedLists = optimisticOrder
          .map((id) => allLists.find((l) => l._id === id))
          .filter((l): l is NonNullable<typeof l> => l !== undefined)
        // Don't add back missing lists - they were intentionally removed/moved
      }

      return {
        ...space,
        lists: orderedLists,
        isOpen: openSpaces.has(space._id) || openSpaces.size === 0,
      }
    })

    // Apply optimistic space order if exists
    if (optimisticSpaceOrder) {
      orderedSpaces = optimisticSpaceOrder
        .map((id) => orderedSpaces.find((s) => s._id === id))
        .filter((s): s is NonNullable<typeof s> => s !== undefined)
      // Don't add back missing spaces - they were intentionally removed
    }

    return orderedSpaces
  }, [spacesData, openSpaces, optimisticSpaceOrder, optimisticListOrders])

  // Clear optimistic state when server data matches
  useEffect(() => {
    if (!spacesData) return

    // Clear optimistic space order when server order matches
    if (optimisticSpaceOrder) {
      const serverOrder = spacesData.map((s) => s._id)
      if (JSON.stringify(serverOrder) === JSON.stringify(optimisticSpaceOrder)) {
        setOptimisticSpaceOrder(null)
      }
    }

    // Clear optimistic list orders when server order matches
    if (Object.keys(optimisticListOrders).length > 0) {
      const newOptimisticListOrders = { ...optimisticListOrders }
      let hasChanges = false

      for (const spaceId of Object.keys(optimisticListOrders)) {
        const space = spacesData.find((s) => s._id === spaceId)
        if (space) {
          const serverOrder = space.lists.map((l) => l._id)
          if (JSON.stringify(serverOrder) === JSON.stringify(optimisticListOrders[spaceId])) {
            delete newOptimisticListOrders[spaceId]
            hasChanges = true
          }
        }
      }

      if (hasChanges) {
        setOptimisticListOrders(newOptimisticListOrders)
      }
    }
  }, [spacesData, optimisticSpaceOrder, optimisticListOrders])

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
    color: string
    icon: string
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
    router.push(`/dashboard/lists/${listId}`)
  }

  // Update space
  const updateSpace = async (
    id: Id<"spaces">,
    values: { name: string; description?: string; color: string; icon: string }
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

  // Reorder spaces (optimistic update)
  const reorderSpaces = useCallback((orderedIds: Id<"spaces">[]) => {
    setOptimisticSpaceOrder(orderedIds)
    reorderSpacesMutation({ orderedIds })
  }, [reorderSpacesMutation])

  // Create list
  const createList = async (spaceId: Id<"spaces">, name: string) => {
    await createListMutation({ spaceId, name })
  }

  // Update list
  const updateList = async (
    id: Id<"lists">,
    values: { name: string; spaceId: Id<"spaces"> }
  ) => {
    await updateListMutation({ id, ...values })
  }

  // Delete list
  const deleteList = async (id: Id<"lists">) => {
    await removeListMutation({ id })
  }

  // Reorder lists (optimistic update)
  const reorderLists = useCallback((spaceId: Id<"spaces">, orderedIds: Id<"lists">[]) => {
    setOptimisticListOrders((prev) => ({ ...prev, [spaceId]: orderedIds }))
    reorderListsMutation({ spaceId, orderedIds })
  }, [reorderListsMutation])

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
