"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { useQuery } from "convex/react"
import { api } from "../../../../../../../convex/_generated/api"
import type { Id } from "../../../../../../../convex/_generated/dataModel"
import TaskListView from "@/features/tasks/components/task-list-view"
import TaskBoardView from "@/features/tasks/components/task-board-view"
import { useQueryState } from "nuqs"
import { listViewParser, VIEW_PARAM } from "@/features/lists/lib/constants"
import { Loader2 } from "lucide-react"

export default function ListPage() {
  const params = useParams<{ listId: string }>()
  const router = useRouter()
  const [view] = useQueryState(VIEW_PARAM, listViewParser)
  const listId = params.listId as Id<"lists">

  const list = useQuery(api.lists.getList, { listId })

  React.useEffect(() => {
    if (list === undefined) return
    if (!list) router.replace("/dashboard")
  }, [listId, router, list])


  return (
    <div className="mt-4 flex flex-1 overflow-hidden">
      <div className="flex-1 overflow-hidden px-6 pb-6">
        {view === "list" ? (
          <TaskListView listId={listId} />
        ) : (
          <TaskBoardView listId={listId} />
        )}
      </div>
    </div>
  )
}
