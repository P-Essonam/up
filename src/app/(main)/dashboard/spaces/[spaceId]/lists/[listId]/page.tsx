"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import { LayoutGrid, ListChecks, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { initialSpaces } from "@/features/spaces/lib/data"
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

  const spaceId = params?.spaceId ?? ""
  const listId = params?.listId ?? ""
  const space = React.useMemo(
    () => initialSpaces.find((item) => item.id === spaceId),
    [spaceId]
  )
  const list = React.useMemo(
    () => space?.lists.find((item) => item.id === listId),
    [space, listId]
  )

  const spaceName = space?.name ?? spaceId
  const listName = list?.name ?? listId
  const spaceInitial = spaceName ? spaceName.charAt(0).toUpperCase() : "S"

  return (
    <div className="flex flex-col">
      <header className="flex flex-col bg-background px-6 pt-3">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="h-7 gap-2 px-1 hover:bg-transparent">
              <span className="flex size-5 items-center justify-center rounded bg-muted text-[10px] font-semibold text-foreground">
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

      <div className="p-6 mt-4 h-full overflow-hidden">
        {view === "list" ? (
          <TaskListView />
        ) : (
          <TaskBoardView />
        )}
      </div>
    </div>
  )
}