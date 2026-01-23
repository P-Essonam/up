import type { Space } from "./types"

export const initialSpaces: Space[] = [
  {
    id: "space-team",
    name: "Espace de l'équipe",
    color: "bg-pink-500",
    isOpen: true,
    lists: [
      { id: "list-second", name: "Second" },
      { id: "list-projet-1", name: "Projet 1", count: 6 },
      { id: "list-projet-2", name: "Projet 2", count: 4 },
      { id: "list-get-started", name: "Get Started with ClickUp", count: 7 },
    ],
  },
  {
    id: "space-jack",
    name: "Jack",
    color: "bg-amber-500",
    isOpen: true,
    lists: [{ id: "list-jack", name: "List" }],
  },
]
