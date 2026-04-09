import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import * as Label from '@radix-ui/react-label'
import { useProduct, useUpdateProduct } from './queries'

interface FormState {
  name: string
  description: string
  price: string
}

export default function EditProduct() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: product, isLoading, error: loadError } = useProduct(id!)
  const updateProduct = useUpdateProduct()

  const [form, setForm] = useState<FormState>({ name: '', description: '', price: '' })
  const [newImage, setNewImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  useEffect(() => {
    if (product) {
      setForm({ name: product.name, description: product.description, price: String(product.price) })
    }
  }, [product])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null
    setNewImage(file)
    setPreview(file ? URL.createObjectURL(file) : null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const price = parseFloat(form.price)
    if (!form.name.trim() || isNaN(price) || price < 0) return

    await updateProduct.mutateAsync(
      { id: id!, payload: { name: form.name.trim(), description: form.description.trim(), price }, image: newImage },
      { onSuccess: () => navigate('/') },
    )
  }

  const error = loadError?.message ?? updateProduct.error?.message
  const submitting = updateProduct.isPending

  if (isLoading) return <p className="p-8 text-center text-gray-500">Loading…</p>

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-semibold mb-6">Edit Product</h1>
      <form className="bg-white rounded-lg p-7 shadow-sm flex flex-col gap-5" onSubmit={handleSubmit} noValidate>
        {error && (
          <p className="bg-red-50 text-red-600 px-3 py-2.5 rounded-md text-sm m-0">{error}</p>
        )}

        <div className="flex flex-col gap-1.5">
          <Label.Root htmlFor="name" className="text-sm font-semibold text-gray-600">Name</Label.Root>
          <input
            id="name"
            name="name"
            type="text"
            value={form.name}
            onChange={handleChange}
            placeholder="Product name"
            required
            className="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-800 transition-colors focus:outline-none focus:border-indigo-500 focus:ring-3 focus:ring-indigo-500/10"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label.Root htmlFor="description" className="text-sm font-semibold text-gray-600">Description</Label.Root>
          <textarea
            id="description"
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Short description"
            rows={3}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-800 resize-y transition-colors focus:outline-none focus:border-indigo-500 focus:ring-3 focus:ring-indigo-500/10"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label.Root htmlFor="price" className="text-sm font-semibold text-gray-600">Price ($)</Label.Root>
          <input
            id="price"
            name="price"
            type="number"
            min="0"
            step="0.01"
            value={form.price}
            onChange={handleChange}
            placeholder="0.00"
            required
            className="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-800 transition-colors focus:outline-none focus:border-indigo-500 focus:ring-3 focus:ring-indigo-500/10"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label.Root htmlFor="image" className="text-sm font-semibold text-gray-600">Image</Label.Root>
          <input
            id="image"
            name="image"
            type="file"
            accept=".jpg,.jpeg,.png"
            onChange={handleImageChange}
            className="text-sm text-gray-600"
          />
          {preview ? (
            <img src={preview} alt="New image preview" className="mt-2 w-30 h-30 object-cover rounded-md border border-gray-200" />
          ) : product?.imagePath ? (
            <img src={`/products/${id}/image`} alt="Current image" className="mt-2 w-30 h-30 object-cover rounded-md border border-gray-200" />
          ) : null}
        </div>

        <div className="flex justify-end gap-3 pt-1">
          <button
            type="button"
            onClick={() => navigate('/')}
            disabled={submitting}
            className="px-5 py-2 bg-gray-200 text-gray-700 rounded-md text-sm font-semibold cursor-pointer transition-colors hover:bg-gray-300 disabled:opacity-55 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2 bg-indigo-500 text-white rounded-md text-sm font-semibold cursor-pointer transition-colors hover:bg-indigo-600 disabled:opacity-55 disabled:cursor-not-allowed"
          >
            {submitting ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  )
}
