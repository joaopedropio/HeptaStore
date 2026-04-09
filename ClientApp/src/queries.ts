import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export interface AuthUser {
  email: string
  role: 'Manager' | 'Customer'
}

export function useMe() {
  return useQuery({
    queryKey: ['me'],
    queryFn: async (): Promise<AuthUser | null> => {
      const res = await fetch('/auth/me')
      if (res.status === 401) return null
      if (!res.ok) throw new Error(`Failed: ${res.status}`)
      return res.json()
    },
    retry: false,
    staleTime: Infinity,
  })
}

export function useLogin() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { email: string; password: string }) => {
      const res = await fetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('Invalid credentials.')
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['me'] }),
  })
}

export function useRegister() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { email: string; password: string; isManager: boolean }) => {
      const res = await fetch('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const body = await res.text()
        let message = 'Registration failed.'
        try {
          const errors: string[] = JSON.parse(body)
          message = errors.join(' ')
        } catch { /* use default message */ }
        throw new Error(message)
      }
      const loginRes = await fetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: payload.email, password: payload.password }),
      })
      if (!loginRes.ok) throw new Error('Registered but login failed.')
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['me'] }),
  })
}

export function useUpdateProfile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { email?: string; currentPassword?: string; newPassword?: string }) => {
      const res = await fetch('/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const body = await res.text()
        let message = 'Update failed.'
        try {
          const errors: string[] = JSON.parse(body)
          message = errors.join(' ')
        } catch { /* use default */ }
        throw new Error(message)
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['me'] }),
  })
}

export function useLogout() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      await fetch('/auth/logout', { method: 'POST' })
    },
    onSuccess: () => qc.setQueryData(['me'], null),
  })
}

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
