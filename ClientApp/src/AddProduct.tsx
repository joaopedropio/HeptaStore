import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCreateProduct } from './queries'
import { Button, ErrorBanner, Field, Input, Textarea } from './ui'

interface FormState {
  name: string
  description: string
  price: string
}

export default function AddProduct() {
  const navigate = useNavigate()
  const [form, setForm] = useState<FormState>({ name: '', description: '', price: '' })
  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const createProduct = useCreateProduct()

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null
    setImage(file)
    setPreview(file ? URL.createObjectURL(file) : null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const price = parseFloat(form.price)
    if (!form.name.trim()) return createProduct.reset()
    if (isNaN(price) || price < 0) return

    await createProduct.mutateAsync(
      { payload: { name: form.name.trim(), description: form.description.trim(), price }, image },
      { onSuccess: () => navigate('/') },
    )
  }

  const submitting = createProduct.isPending

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-semibold mb-6">Add Product</h1>
      <form className="bg-white rounded-lg p-7 shadow-sm flex flex-col gap-5" onSubmit={handleSubmit} noValidate>
        {createProduct.error && <ErrorBanner message={createProduct.error.message} />}

        <Field label="Name" htmlFor="name">
          <Input id="name" name="name" type="text" value={form.name} onChange={handleChange} placeholder="Product name" required />
        </Field>

        <Field label="Description" htmlFor="description">
          <Textarea id="description" name="description" value={form.description} onChange={handleChange} placeholder="Short description" rows={3} />
        </Field>

        <Field label="Price ($)" htmlFor="price">
          <Input id="price" name="price" type="number" min="0" step="0.01" value={form.price} onChange={handleChange} placeholder="0.00" required />
        </Field>

        <Field label="Image (optional)" htmlFor="image">
          <input id="image" name="image" type="file" accept=".jpg,.jpeg,.png" onChange={handleImageChange} className="text-sm text-gray-600" />
          {preview && <img src={preview} alt="Preview" className="mt-2 w-30 h-30 object-cover rounded-md border border-gray-200" />}
        </Field>

        <div className="flex justify-end gap-3 pt-1">
          <Button type="button" variant="secondary" onClick={() => navigate('/')} disabled={submitting}>Cancel</Button>
          <Button type="submit" disabled={submitting}>{submitting ? 'Saving…' : 'Save Product'}</Button>
        </div>
      </form>
    </div>
  )
}
