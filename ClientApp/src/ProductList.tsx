import { useEffect, useState } from 'react'

interface Product {
  id: string
  name: string
  description: string
  price: number
  imagePath: string | null
  createdAt: string
  updatedAt: string
}

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/products')
      .then((res) => {
        if (!res.ok) throw new Error(`Request failed: ${res.status}`)
        return res.json() as Promise<Product[]>
      })
      .then((data) => setProducts(data))
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Unknown error'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p className="status">Loading products…</p>
  if (error) return <p className="status error">Error: {error}</p>

  return (
    <div className="product-list">
      <h1>Products</h1>
      {products.length === 0 ? (
        <p className="status">No products found.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Description</th>
              <th>Price</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td>
                  {p.imagePath ? (
                    <img src={`/products/${p.id}/image`} alt={p.name} className="product-thumb" />
                  ) : (
                    <span className="no-image">—</span>
                  )}
                </td>
                <td>{p.name}</td>
                <td>{p.description}</td>
                <td>${p.price.toFixed(2)}</td>
                <td>{new Date(p.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
