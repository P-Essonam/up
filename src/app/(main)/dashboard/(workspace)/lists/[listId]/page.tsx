"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { useQuery, useMutation, usePaginatedQuery } from "convex/react"
import { LayoutGrid, ListChecks, Loader2, Sparkles } from "lucide-react"
import { api } from "../../../../../../../convex/_generated/api"
import type { Id } from "../../../../../../../convex/_generated/dataModel"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import TaskListView from "@/features/tasks/components/task-list-view"
import TaskBoardView from "@/features/tasks/components/task-board-view"
import type { Task } from "@/features/tasks/lib/types"

type ViewMode = "list" | "board"
const viewTabs = [
  { value: "list", label: "List", icon: ListChecks },
  { value: "board", label: "Board", icon: LayoutGrid },
] as const

const TASKS_PER_PAGE = 20

export default function ListPage() {
  const params = useParams<{ listId: string }>()
  const router = useRouter()
  const [view, setView] = React.useState<ViewMode>("list")

  const listId = params?.listId as Id<"lists"> | undefined

  // Fetch spaces to get space/list names
  const spacesData = useQuery(api.spaces.listWithLists)

  // Fetch tasks for current list with pagination
  const {
    results: tasksData,
    status: paginationStatus,
    loadMore,
    isLoading: isLoadingTasks,
  } = usePaginatedQuery(
    api.tasks.listByList,
    listId ? { listId } : "skip",
    { initialNumItems: TASKS_PER_PAGE }
  )

  // Optimistic state for task ordering
  const [optimisticTaskOrder, setOptimisticTaskOrder] = React.useState<{
    status: string
    orderedIds: Id<"tasks">[]
  } | null>(null)

  // Apply optimistic ordering to tasks
  const tasks: Task[] = React.useMemo(() => {
    if (!tasksData) return []
    if (!optimisticTaskOrder) return tasksData as Task[]

    // Apply optimistic order for the affected status
    return tasksData.map((task) => {
      if (task.status === optimisticTaskOrder.status) {
        const index = optimisticTaskOrder.orderedIds.indexOf(task._id)
        if (index !== -1) {
          return { ...task, sortOrder: index }
        }
      }
      return task
    }) as Task[]
  }, [tasksData, optimisticTaskOrder])

  // Clear optimistic state when server data matches
  React.useEffect(() => {
    if (!tasksData || !optimisticTaskOrder) return

    const serverTasksInStatus = tasksData
      .filter((t) => t.status === optimisticTaskOrder.status)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((t) => t._id)

    if (JSON.stringify(serverTasksInStatus) === JSON.stringify(optimisticTaskOrder.orderedIds)) {
      setOptimisticTaskOrder(null)
    }
  }, [tasksData, optimisticTaskOrder])

  // Reorder mutation
  const reorderTasks = useMutation(api.tasks.reorder)

  // Find space and list info from spaces data
  const { space, list } = React.useMemo(() => {
    if (!spacesData || !listId) return { space: null, list: null }
    for (const s of spacesData) {
      const foundList = s.lists.find((l) => l._id === listId)
      if (foundList) {
        return { space: s, list: foundList }
      }
    }
    return { space: null, list: null }
  }, [spacesData, listId])

  // If the current list is deleted while viewing it, navigate back to workspace root.
  React.useEffect(() => {
    if (!listId) return
    if (spacesData === undefined) return
    if (!list) {
      router.replace("/dashboard")
    }
  }, [listId, list, router, spacesData])

  const spaceName = space?.name ?? "Space"
  const listName = list?.name ?? "List"
  const spaceInitial = spaceName.charAt(0).toUpperCase()

  // Optimistic reorder handler
  const handleReorderTasks = React.useCallback(
    (status: string, orderedIds: Id<"tasks">[]) => {
      if (!listId) return
      // Apply optimistic update immediately
      setOptimisticTaskOrder({ status, orderedIds })
      // Fire mutation without awaiting
      reorderTasks({ listId, status, orderedIds })
    },
    [listId, reorderTasks]
  )

  const isLoading = spacesData === undefined || paginationStatus === "LoadingFirstPage"

  return (
    <div className="flex h-full flex-col">
      <header className="flex shrink-0 flex-col bg-background px-6 pt-3">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="h-7 gap-2 px-1 hover:bg-transparent">
              <span
                className={cn(
                  "flex size-5 items-center justify-center rounded text-[10px] font-semibold text-white",
                  space?.color || "bg-muted text-foreground"
                )}
              >
                {spaceInitial}
              </span>
              <span className="text-sm font-medium">{spaceName}</span>
            </Button>
            <span className="text-muted-foreground/50">/</span>
            <Button variant="ghost" size="sm" className="h-7 gap-2 px-1 hover:bg-transparent">
              <ListChecks className="size-4 text-muted-foreground" />
              <span className="text-sm font-medium">{listName}</span>
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" className="h-8 gap-2 bg-muted/50 font-normal">
              <Sparkles className="size-4" />
              Ask AI
            </Button>
          </div>
        </div>

        <nav className="flex items-center gap-6 border-b bg-background/80">
          {viewTabs.map((tab) => {
            const isActive = view === tab.value
            const Icon = tab.icon
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => setView(tab.value)}
                className={cn(
                  "relative flex items-center gap-2 pb-3 text-sm font-medium transition-colors",
                  isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="size-4" />
                {tab.label}
                {isActive && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground" />}
              </button>
            )
          })}
        </nav>
      </header>

      <div className="mt-4 flex-1 overflow-hidden p-6">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : view === "list" ? (
          <TaskListView
            tasks={tasks ?? []}
            listId={listId!}
            onReorderTasks={handleReorderTasks}
            paginationStatus={paginationStatus}
            isLoadingMore={isLoadingTasks}
            loadMore={loadMore}
            numItemsPerPage={TASKS_PER_PAGE}
          />
        ) : (
          <TaskBoardView
            tasks={tasks ?? []}
            listId={listId!}
            onReorderTasks={handleReorderTasks}
            paginationStatus={paginationStatus}
            isLoadingMore={isLoadingTasks}
            loadMore={loadMore}
            numItemsPerPage={TASKS_PER_PAGE}
          />
        )}
      </div>
    </div>
  )
}
