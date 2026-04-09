import { create } from 'zustand'

type SortKey = 'price' | 'createdAt'
type SortDir = 'asc' | 'desc'

interface ProductListStore {
  sortKey: SortKey
  sortDir: SortDir
  deleteId: string | null
  handleSort: (key: SortKey) => void
  setDeleteId: (id: string | null) => void
}

export const useProductListStore = create<ProductListStore>((set, get) => ({
  sortKey: 'createdAt',
  sortDir: 'desc',
  deleteId: null,
  handleSort: (key) => {
    const { sortKey, sortDir } = get()
    if (sortKey === key) set({ sortDir: sortDir === 'asc' ? 'desc' : 'asc' })
    else set({ sortKey: key, sortDir: 'asc' })
  },
  setDeleteId: (id) => set({ deleteId: id }),
}))
