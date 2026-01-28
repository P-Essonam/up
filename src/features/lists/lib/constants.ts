import { LayoutGrid, ListChecks } from "lucide-react"
import { parseAsStringLiteral } from "nuqs"

export const listViewParser = parseAsStringLiteral(["list", "board"] as const).withDefault("list")

export const VIEW_TABS = [
  { value: "list" as const, label: "List", icon: ListChecks },
  { value: "board" as const, label: "Board", icon: LayoutGrid },
] as const

export const VIEW_PARAM = "view"

export const AI_SUGGESTIONS = [
  {
    text: "Summarize all tasks in this list",
    icon: "FileText",
  },
  {
    text: "Create a new space for my team",
    icon: "Lightbulb",
  },
  {
    text: "Find all urgent tasks",
    icon: "Sparkles",
  },
  {
    text: "Organize tasks by priority",
    icon: "Sparkles",
  },
  {
    text: "Create 5 tasks for a product launch",
    icon: "Pencil",
  },
  {
    text: "Update task status to Done",
    icon: "Pencil",
  },
] as const
