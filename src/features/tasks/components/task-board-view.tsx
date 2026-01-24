"use client"

import * as React from "react"
import { DragDropContext, Draggable, Droppable, type DropResult } from "@hello-pangea/dnd"
import { Calendar, Flag, Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { defaultStatuses } from "@/features/tasks/lib/data"
import type { Task, TaskStatus } from "@/features/tasks/lib/types"
import type { Id } from "../../../../convex/_generated/dataModel"
import { InfiniteScroll } from "@/components/infinite-scroll"

type PaginationStatus = "LoadingFirstPage" | "CanLoadMore" | "LoadingMore" | "Exhausted"

type TaskBoardViewProps = {
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
  if (!timestamp) return ""
  const date = new Date(timestamp)
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

export default function TaskBoardView({
  tasks,
  listId,
  onReorderTasks,
  statuses = defaultStatuses,
  paginationStatus,
  isLoadingMore,
  loadMore,
  numItemsPerPage,
}: TaskBoardViewProps) {
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

  const onDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result
    if (!destination) return

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return
    }

    const sourceStatusId = source.droppableId
    const destStatusId = destination.droppableId
    const taskId = draggableId as Id<"tasks">

    // Get the tasks in destination column
    const destTasks = [...(tasksByStatus[destStatusId] ?? [])]

    if (sourceStatusId === destStatusId) {
      // Reordering within the same column
      const [movedTask] = destTasks.splice(source.index, 1)
      destTasks.splice(destination.index, 0, movedTask)
    } else {
      // Moving to a different column
      const task = tasks.find((t) => t._id === taskId)
      if (!task) return
      destTasks.splice(destination.index, 0, task)
    }

    // Call the reorder callback with the new order (optimistic update handled by parent)
    const orderedIds = destTasks.map((t) => t._id)
    onReorderTasks(destStatusId, orderedIds)
  }

  return (
    <div className="flex h-full flex-col">
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex min-h-0 flex-1 gap-4">
          {statuses.map((status) => (
            <BoardColumn
              key={status.id}
              status={status}
              tasks={tasksByStatus[status.id] ?? []}
              paginationStatus={paginationStatus}
              isLoadingMore={isLoadingMore}
              loadMore={loadMore}
              numItemsPerPage={numItemsPerPage}
            />
          ))}
        </div>
      </DragDropContext>
    </div>
  )
}

type BoardColumnProps = {
  status: TaskStatus
  tasks: Task[]
  paginationStatus: PaginationStatus
  isLoadingMore: boolean
  loadMore: (numItems: number) => void
  numItemsPerPage: number
}

function BoardColumn({
  status,
  tasks,
  paginationStatus,
  isLoadingMore,
  loadMore,
  numItemsPerPage,
}: BoardColumnProps) {
  return (
    <div className={cn("flex h-full max-h-full min-w-0 flex-1 flex-col rounded-lg p-2", status.columnClassName)}>
      <div className="mb-3 flex shrink-0 items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className={cn("rounded-sm border-transparent px-2 py-0.5 text-xs font-medium uppercase", status.badgeClassName)}
          >
            {status.name}
          </Badge>
          <span className="text-xs text-muted-foreground">{tasks.length}</span>
        </div>
      </div>

      <Droppable droppableId={status.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn(
              "flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-1",
              snapshot.isDraggingOver && "rounded-md bg-black/5"
            )}
          >
            {tasks.map((task, index) => (
              <TaskCard key={task._id} task={task} index={index} />
            ))}
            {provided.placeholder}

            <Button
              variant="ghost"
              className="mt-1 w-full shrink-0 justify-start gap-2 text-muted-foreground hover:bg-black/5 hover:text-foreground"
            >
              <Plus className="size-4" />
              Add Task
            </Button>

            <InfiniteScroll
              status={paginationStatus}
              isLoading={isLoadingMore}
              loadMore={loadMore}
              numItems={numItemsPerPage}
            />
          </div>
        )}
      </Droppable>
    </div>
  )
}

function TaskCard({ task, index }: { task: Task; index: number }) {
  return (
    <Draggable draggableId={task._id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={cn(
            "flex flex-col gap-3 rounded-lg border bg-card p-3 shadow-sm transition-all hover:shadow-md",
            snapshot.isDragging && "rotate-2 shadow-lg ring-2 ring-primary/20"
          )}
        >
          <div className="text-sm font-medium leading-tight">{task.title}</div>

          <div className="flex items-center justify-between text-muted-foreground">
            <div className="flex items-center gap-2">
              {task.assigneeId && (
                <span className="text-xs">{task.assigneeId}</span>
              )}
              {task.dueDate && (
                <div className="flex items-center gap-1 text-xs">
                  <Calendar className="size-3" />
                  <span>{formatDate(task.dueDate)}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {task.priority && (
                <div
                  className={cn(
                    "flex items-center gap-1 text-xs",
                    task.priority === "urgent" && "text-red-500",
                    task.priority === "high" && "text-amber-500",
                    task.priority === "normal" && "text-blue-500"
                  )}
                >
                  <Flag className="size-3 fill-current" />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Draggable>
  )
}
