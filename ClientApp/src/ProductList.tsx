import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import * as AlertDialog from '@radix-ui/react-alert-dialog'
import { useProducts, useDeleteProduct, type Product } from './queries'
import { useProductListStore } from './store'
import { useAuth } from './AuthContext'
import { Button } from './ui'

type SortKey = 'price' | 'createdAt'
type SortDir = 'asc' | 'desc'

function ActionsMenu({ id, onDeleteRequest }: { id: string; onDeleteRequest: (id: string) => void }) {
  const navigate = useNavigate()

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Button variant="ghost" aria-label="Actions">···</Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={4}
          className="bg-white border border-gray-200 rounded-md shadow-lg min-w-[120px] z-10 overflow-hidden"
        >
          <DropdownMenu.Item
            className="block px-4 py-2 text-sm text-gray-800 cursor-pointer outline-none transition-colors data-[highlighted]:bg-gray-50"
            onSelect={() => navigate(`/products/${id}/edit`)}
          >
            Edit
          </DropdownMenu.Item>
          <DropdownMenu.Item
            className="block px-4 py-2 text-sm text-red-600 cursor-pointer outline-none transition-colors data-[highlighted]:bg-red-50"
            onSelect={() => onDeleteRequest(id)}
          >
            Delete
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}

function sortProducts(products: Product[], key: SortKey, dir: SortDir) {
  return [...products].sort((a, b) => {
    const av = key === 'price' ? a.price : new Date(a.createdAt).getTime()
    const bv = key === 'price' ? b.price : new Date(b.createdAt).getTime()
    return dir === 'asc' ? av - bv : bv - av
  })
}

function SortButton({ label, active, dir, onClick }: { label: string; active: boolean; dir: SortDir; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition-colors border ${
        active
          ? 'bg-indigo-500 text-white border-indigo-500'
          : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:text-gray-800'
      }`}
    >
      {label} {active ? (dir === 'asc' ? '↑' : '↓') : ''}
    </button>
  )
}

function ProductCard({ p, isManager, onDeleteRequest, onClick }: {
  p: Product
  isManager: boolean
  onDeleteRequest: (id: string) => void
  onClick: () => void
}) {
  return (
    <div
      className="bg-white rounded-xl shadow-sm overflow-hidden flex flex-col group cursor-pointer"
      onClick={onClick}
    >
      <div className="aspect-square bg-gray-100 overflow-hidden">
        {p.imagePath ? (
          <img
            src={`/products/${p.id}/image?v=${p.updatedAt}`}
            alt={p.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-4xl select-none">
            ☐
          </div>
        )}
      </div>
      <div className="p-3 flex items-start justify-between gap-1">
        <div className="flex flex-col gap-0.5 min-w-0">
          <p className="text-sm font-semibold text-gray-800 truncate m-0">{p.name}</p>
          <p className="text-sm text-indigo-600 font-bold m-0">${p.price.toFixed(2)}</p>
        </div>
        {isManager && (
          <div onClick={e => e.stopPropagation()}>
            <ActionsMenu id={p.id} onDeleteRequest={onDeleteRequest} />
          </div>
        )}
      </div>
    </div>
  )
}

function ProductDetailModal({ product, onClose }: { product: Product; onClose: () => void }) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Image */}
        <div className="bg-gray-100">
          {product.imagePath ? (
            <img
              src={`/products/${product.id}/image?v=${product.updatedAt}`}
              alt={product.name}
              className="w-full max-h-80 object-contain"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-200 text-7xl select-none">
              ☐
            </div>
          )}
        </div>

        {/* Details */}
        <div className="p-6 flex flex-col gap-4">
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-xl font-bold text-gray-900 m-0">{product.name}</h2>
            <span className="text-xl font-bold text-indigo-600 whitespace-nowrap">${product.price.toFixed(2)}</span>
          </div>

          {product.description && (
            <p className="text-sm text-gray-600 m-0 leading-relaxed whitespace-pre-wrap">{product.description}</p>
          )}

          <div className="flex flex-col gap-1 pt-2 border-t border-gray-100 text-xs text-gray-400">
            <span>Added {new Date(product.createdAt).toLocaleDateString()}</span>
            {product.updatedAt !== product.createdAt && (
              <span>Updated {new Date(product.updatedAt).toLocaleDateString()}</span>
            )}
          </div>

          <Button variant="secondary" className="w-full" onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  )
}

export default function ProductList() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const isManager = user?.role === 'Manager'
  const { data: products = [], isLoading, error } = useProducts()
  const deleteProduct = useDeleteProduct()
  const { sortKey, sortDir, deleteId, handleSort, setDeleteId } = useProductListStore()
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  async function confirmDelete() {
    if (!deleteId) return
    await deleteProduct.mutateAsync(deleteId)
    setDeleteId(null)
  }

  if (isLoading) return <p className="p-8 text-center text-gray-500">Loading products…</p>
  if (error) return <p className="p-8 text-center text-red-600">Error: {error.message}</p>

  const sorted = sortProducts(products, sortKey, sortDir)

  return (
    <>
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <h1 className="text-2xl font-semibold m-0">Products</h1>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-400 font-medium">Sort:</span>
              <SortButton label="Price"  active={sortKey === 'price'}     dir={sortDir} onClick={() => handleSort('price')} />
              <SortButton label="Newest" active={sortKey === 'createdAt'} dir={sortDir} onClick={() => handleSort('createdAt')} />
            </div>
            {isManager && <Button onClick={() => navigate('/products/new')}>+ Add Product</Button>}
          </div>
        </div>

        {sorted.length === 0 ? (
          <p className="p-8 text-center text-gray-500">No products found.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {sorted.map((p) => (
              <ProductCard
                key={p.id}
                p={p}
                isManager={isManager}
                onDeleteRequest={setDeleteId}
                onClick={() => setSelectedProduct(p)}
              />
            ))}
          </div>
        )}
      </div>

      {selectedProduct && (
        <ProductDetailModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      )}

      <AlertDialog.Root open={deleteId !== null} onOpenChange={(open) => { if (!open) setDeleteId(null) }}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="fixed inset-0 bg-black/40" />
          <AlertDialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 shadow-xl w-[400px] max-w-[90vw] focus:outline-none">
            <AlertDialog.Title className="text-base font-semibold text-gray-900 mb-2">
              Delete product?
            </AlertDialog.Title>
            <AlertDialog.Description className="text-sm text-gray-500 mb-6">
              This action cannot be undone.
            </AlertDialog.Description>
            <div className="flex justify-end gap-3">
              <AlertDialog.Cancel asChild>
                <Button variant="secondary">Cancel</Button>
              </AlertDialog.Cancel>
              <AlertDialog.Action asChild>
                <Button variant="destructive" onClick={confirmDelete} disabled={deleteProduct.isPending}>
                  {deleteProduct.isPending ? 'Deleting…' : 'Delete'}
                </Button>
              </AlertDialog.Action>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </>
  )
}
