import { create } from "zustand"

type AskAIStore = {
  isOpen: boolean
  open: () => void
  close: () => void
  toggle: () => void
}

export const useAskAIStore = create<AskAIStore>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
}))
