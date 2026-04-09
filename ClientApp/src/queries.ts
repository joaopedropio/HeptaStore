import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export interface Product {
  id: string
  name: string
  description: string
  price: number
  imagePath: string | null
  createdAt: string
  updatedAt: string
}

interface ProductPayload {
  name: string
  description: string
  price: number
}

const PRODUCTS_KEY = ['products'] as const

export function useProducts() {
  return useQuery({
    queryKey: PRODUCTS_KEY,
    queryFn: async (): Promise<Product[]> => {
      const res = await fetch('/products')
      if (!res.ok) throw new Error(`Request failed: ${res.status}`)
      return res.json()
    },
  })
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ['products', id],
    queryFn: async (): Promise<Product> => {
      const res = await fetch(`/products/${id}`)
      if (!res.ok) throw new Error(`Product not found (${res.status})`)
      return res.json()
    },
  })
}

export function useCreateProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ payload, image }: { payload: ProductPayload; image: File | null }) => {
      const res = await fetch('/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error(`Failed to create product (${res.status})`)
      const product: { id: string } = await res.json()

      if (image) {
        const fd = new FormData()
        fd.append('ProductId', product.id)
        fd.append('Image', image)
        const imgRes = await fetch('/products/upload', { method: 'POST', body: fd })
        if (!imgRes.ok) throw new Error(`Failed to upload image (${imgRes.status})`)
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: PRODUCTS_KEY }),
  })
}

export function useUpdateProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, payload, image }: { id: string; payload: ProductPayload; image: File | null }) => {
      const res = await fetch(`/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error(`Failed to update product (${res.status})`)

      if (image) {
        const fd = new FormData()
        fd.append('ProductId', id)
        fd.append('Image', image)
        const imgRes = await fetch('/products/upload', { method: 'POST', body: fd })
        if (!imgRes.ok) throw new Error(`Failed to upload image (${imgRes.status})`)
      }
    },
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: PRODUCTS_KEY })
      qc.invalidateQueries({ queryKey: ['products', id] })
    },
  })
}

export function useDeleteProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/products/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error(`Failed to delete product (${res.status})`)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: PRODUCTS_KEY }),
  })
}
