"use client"

import * as React from "react"
import { ChevronDown, Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { defaultStatuses } from "@/features/tasks/lib/data"
import type { Task, TaskStatus } from "@/features/tasks/lib/types"
import type { Id } from "../../../../convex/_generated/dataModel"
import { InfiniteScroll } from "@/components/infinite-scroll"

type PaginationStatus = "LoadingFirstPage" | "CanLoadMore" | "LoadingMore" | "Exhausted"

type TaskListViewProps = {
  tasks: Task[]
  listId: Id<"lists">
  onReorderTasks: (status: string, orderedIds: Id<"tasks">[]) => void
  statuses?: TaskStatus[]
  paginationStatus: PaginationStatus
  isLoadingMore: boolean
  loadMore: (numItems: number) => void
  numItemsPerPage: number
}

function formatDate(timestamp: number | undefined): string {
  if (!timestamp) return "-"
  const date = new Date(timestamp)
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

function formatPriority(priority: string | undefined): string {
  if (!priority) return "-"
  return priority.charAt(0).toUpperCase() + priority.slice(1)
}

export default function TaskListView({
  tasks,
  listId,
  onReorderTasks,
  statuses = defaultStatuses,
  paginationStatus,
  isLoadingMore,
  loadMore,
  numItemsPerPage,
}: TaskListViewProps) {
  const [collapsed, setCollapsed] = React.useState<Record<string, boolean>>({})

  const toggleStatus = (statusId: string) => {
    setCollapsed((prev) => ({ ...prev, [statusId]: !prev[statusId] }))
  }

  // Group and sort tasks by status and sortOrder
  const tasksByStatus = React.useMemo(() => {
    const grouped: Record<string, Task[]> = {}
    for (const status of statuses) {
      grouped[status.id] = tasks
        .filter((task) => task.status === status.id)
        .sort((a, b) => a.sortOrder - b.sortOrder)
    }
    return grouped
  }, [tasks, statuses])

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <div className="flex flex-col gap-4">
        {statuses.map((status) => {
          const statusTasks = tasksByStatus[status.id] ?? []
          const isCollapsed = collapsed[status.id] ?? false

          return (
            <div key={status.id} className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => toggleStatus(status.id)}
                className="flex w-fit items-center gap-2 text-sm font-medium"
              >
                <div className="flex items-center gap-2">
                  <ChevronDown
                    className={cn("size-4 text-muted-foreground transition-transform", isCollapsed && "-rotate-90")}
                  />
                  <Badge variant="outline" className={cn("uppercase tracking-wide", status.badgeClassName)}>
                    {status.name}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{statusTasks.length}</span>
                </div>
              </button>

              {!isCollapsed && (
                <div>
                  <div className="grid grid-cols-12 items-center gap-2 border-b border-border/60 px-2 py-2 text-xs font-medium text-muted-foreground">
                    <div className="col-span-5">Name</div>
                    <div className="col-span-3">Assignee</div>
                    <div className="col-span-2">Due date</div>
                    <div className="col-span-2">Priority</div>
                  </div>

                  {statusTasks.map((task) => (
                    <div
                      key={task._id}
                      className="grid grid-cols-12 items-center gap-2 border-b border-border/60 px-2 py-2 text-sm"
                    >
                      <div className="col-span-5 flex items-center gap-2">
                        <span className="size-3 rounded-full border border-muted-foreground/30" />
                        <span className="truncate">{task.title}</span>
                      </div>
                      <div className="col-span-3 flex items-center gap-1">
                        {task.assigneeId ? (
                          <span className="text-xs text-muted-foreground">{task.assigneeId}</span>
                        ) : (
                          <span className="text-xs text-muted-foreground">Unassigned</span>
                        )}
                      </div>
                      <div className="col-span-2 text-sm text-muted-foreground">
                        {formatDate(task.dueDate)}
                      </div>
                      <div className="col-span-2">
                        {task.priority ? (
                          <Badge variant="outline" className="border-muted-foreground/30 text-xs text-muted-foreground">
                            {formatPriority(task.priority)}
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </div>
                    </div>
                  ))}

                  <div className="px-2 py-2">
                    <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
                      <Plus className="size-4" />
                      Add Task
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <InfiniteScroll
        status={paginationStatus}
        isLoading={isLoadingMore}
        loadMore={loadMore}
        numItems={numItemsPerPage}
      />
    </div>
  )
}
