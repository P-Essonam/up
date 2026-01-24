"use client"

import * as React from "react"
import { ChevronDown, Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { defaultStatuses, defaultTasks } from "@/features/tasks/lib/data"
import type { TaskItem, TaskStatus } from "@/features/tasks/lib/types"

type TaskListViewProps = {
  statuses?: TaskStatus[]
  tasks?: TaskItem[]
}

export default function TaskListView({ statuses = defaultStatuses, tasks = defaultTasks }: TaskListViewProps) {
  const [collapsed, setCollapsed] = React.useState<Record<string, boolean>>({})

  const toggleStatus = (statusId: string) => {
    setCollapsed((prev) => ({ ...prev, [statusId]: !prev[statusId] }))
  }

  return (
    <div className="flex flex-col gap-4">
      {statuses.map((status) => {
        const statusTasks = tasks.filter((task) => task.statusId === status.id)
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
                    key={task.id}
                    className="grid grid-cols-12 items-center gap-2 border-b border-border/60 px-2 py-2 text-sm"
                  >
                    <div className="col-span-5 flex items-center gap-2">
                      <span className="size-3 rounded-full border border-muted-foreground/30" />
                      <span className="truncate">{task.name}</span>
                    </div>
                    <div className="col-span-3 flex items-center gap-1">
                      {task.assignees.length > 0 ? (
                        task.assignees.map((assignee) => (
                          <span
                            key={assignee.id}
                            className={cn(
                              "flex size-6 items-center justify-center rounded-full text-[10px] font-semibold text-white",
                              assignee.color
                            )}
                            title={assignee.name}
                          >
                            {assignee.initials}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-muted-foreground">Unassigned</span>
                      )}
                    </div>
                    <div className="col-span-2 text-sm text-muted-foreground">
                      {task.dueDate ?? "-"}
                    </div>
                    <div className="col-span-2">
                      {task.priority ? (
                        <Badge variant="outline" className="border-muted-foreground/30 text-xs text-muted-foreground">
                          {task.priority}
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
  )
}
