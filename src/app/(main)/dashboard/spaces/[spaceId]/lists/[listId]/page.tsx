"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import { useQuery, useMutation } from "convex/react"
import { LayoutGrid, ListChecks, Loader2, Sparkles } from "lucide-react"
import { api } from "../../../../../../../../convex/_generated/api"
import type { Id } from "../../../../../../../../convex/_generated/dataModel"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import TaskListView from "@/features/tasks/components/task-list-view"
import TaskBoardView from "@/features/tasks/components/task-board-view"

type ViewMode = "list" | "board"
const viewTabs = [
  { value: "list", label: "List", icon: ListChecks },
  { value: "board", label: "Board", icon: LayoutGrid },
] as const

export default function ListPage() {
  const params = useParams<{ spaceId: string; listId: string }>()
  const [view, setView] = React.useState<ViewMode>("list")

  const listId = params?.listId as Id<"lists"> | undefined
  const spaceId = params?.spaceId as Id<"spaces"> | undefined

  // Fetch spaces to get space/list names
  const spacesData = useQuery(api.spaces.listWithLists)

  // Fetch tasks for current list
  const tasks = useQuery(
    api.tasks.listAll,
    listId ? { listId } : "skip"
  )

  // Reorder mutation
  const reorderTasks = useMutation(api.tasks.reorder)

  // Find space and list info
  const space = React.useMemo(
    () => spacesData?.find((s) => s._id === spaceId),
    [spacesData, spaceId]
  )
  const list = React.useMemo(
    () => space?.lists.find((l) => l._id === listId),
    [space, listId]
  )

  const spaceName = space?.name ?? "Space"
  const listName = list?.name ?? "List"
  const spaceInitial = spaceName.charAt(0).toUpperCase()

  const handleReorderTasks = React.useCallback(
    async (status: string, orderedIds: Id<"tasks">[]) => {
      if (!listId) return
      await reorderTasks({ listId, status, orderedIds })
    },
    [listId, reorderTasks]
  )

  const isLoading = spacesData === undefined || tasks === undefined

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
          />
        ) : (
          <TaskBoardView
            tasks={tasks ?? []}
            listId={listId!}
            onReorderTasks={handleReorderTasks}
          />
        )}
      </div>
    </div>
  )
}
