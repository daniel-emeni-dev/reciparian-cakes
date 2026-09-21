import { create } from 'zustand'

interface CartUIState {
  isOpen: boolean
  open: () => void
  close: () => void
}

// Deliberately NOT persisted — whether the drawer happens to be open
// is a moment-to-moment UI state, not something that should survive
// a page reload the way cart contents should.
export const useCartUIStore = create<CartUIState>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}))
