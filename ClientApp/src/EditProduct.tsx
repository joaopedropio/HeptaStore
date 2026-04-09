import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useProduct, useUpdateProduct } from './queries'
import { Button, ErrorBanner, Field, ImagePicker, Input, Textarea } from './ui'

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
        {error && <ErrorBanner message={error} />}

        <Field label="Name" htmlFor="name">
          <Input id="name" name="name" type="text" value={form.name} onChange={handleChange} placeholder="Product name" required />
        </Field>

        <Field label="Description" htmlFor="description">
          <Textarea id="description" name="description" value={form.description} onChange={handleChange} placeholder="Short description" rows={3} />
        </Field>

        <Field label="Price ($)" htmlFor="price">
          <Input id="price" name="price" type="number" min="0" step="0.01" value={form.price} onChange={handleChange} placeholder="0.00" required />
        </Field>

        <Field label="Image" htmlFor="image">
          <ImagePicker id="image" accept=".jpg,.jpeg,.png" fileName={newImage?.name ?? null} onChange={handleImageChange} />
          {preview ? (
            <img src={preview} alt="New image preview" className="w-30 h-30 object-cover rounded-md border border-gray-200" />
          ) : product?.imagePath ? (
            <img src={`/products/${id}/image?v=${product.updatedAt}`} alt="Current image" className="w-30 h-30 object-cover rounded-md border border-gray-200" />
          ) : null}
        </Field>

        <div className="flex justify-end gap-3 pt-1">
          <Button type="button" variant="secondary" onClick={() => navigate('/')} disabled={submitting}>Cancel</Button>
          <Button type="submit" disabled={submitting}>{submitting ? 'Saving…' : 'Save Changes'}</Button>
        </div>
      </form>
    </div>
  )
}
