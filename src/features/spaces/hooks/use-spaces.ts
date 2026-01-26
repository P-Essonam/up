"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useMutation, useQuery } from "convex/react"
import { api } from "../../../../convex/_generated/api"
import type { Id } from "../../../../convex/_generated/dataModel"
import type { Space } from "../lib/types"
import { idsMatch, reorderById } from "../lib/utils"

export function useSpaces() {
  const router = useRouter()

  // Query
  const spacesData = useQuery(api.spaces.listWithLists)

  // UI state for open/closed spaces
  const [openSpaces, setOpenSpaces] = useState<Set<string>>(() => new Set())
  const [hasInitializedOpenSpaces, setHasInitializedOpenSpaces] = useState(false)

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

  // Merge server data with optimistic ordering
  const spaces: Space[] = useMemo(() => {
    if (!spacesData) return []

    const allLists = spacesData.flatMap((s) => s.lists)

    let result = spacesData.map((space) => ({
      ...space,
      lists: optimisticListOrders[space._id]
        ? reorderById(allLists, optimisticListOrders[space._id])
        : space.lists,
      isOpen: hasInitializedOpenSpaces ? openSpaces.has(space._id) : true,
    }))

    if (optimisticSpaceOrder) {
      result = reorderById(result, optimisticSpaceOrder)
    }

    return result
  }, [spacesData, openSpaces, hasInitializedOpenSpaces, optimisticSpaceOrder, optimisticListOrders])

  // Clear optimistic state when server catches up
  useEffect(() => {
    if (!spacesData) return

    if (optimisticSpaceOrder && idsMatch(spacesData.map((s) => s._id), optimisticSpaceOrder)) {
      setOptimisticSpaceOrder(null)
    }

    const staleKeys = Object.keys(optimisticListOrders).filter((spaceId) => {
      const space = spacesData.find((s) => s._id === spaceId)
      return space && idsMatch(space.lists.map((l) => l._id), optimisticListOrders[spaceId])
    })

    if (staleKeys.length > 0) {
      setOptimisticListOrders((prev) => {
        const next = { ...prev }
        staleKeys.forEach((key) => delete next[key])
        return next
      })
    }
  }, [spacesData, optimisticSpaceOrder, optimisticListOrders])

  // Initialize openSpaces when data loads
  useEffect(() => {
    if (spacesData && !hasInitializedOpenSpaces) {
      setOpenSpaces(new Set(spacesData.map((s) => s._id)))
      setHasInitializedOpenSpaces(true)
    }
  }, [spacesData, hasInitializedOpenSpaces])

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
      status: "todo",
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
