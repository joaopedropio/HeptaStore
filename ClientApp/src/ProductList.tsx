import { useNavigate } from 'react-router-dom'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import * as AlertDialog from '@radix-ui/react-alert-dialog'
import { useProducts, useDeleteProduct, type Product } from './queries'
import { useProductListStore } from './store'

type SortKey = 'price' | 'createdAt'
type SortDir = 'asc' | 'desc'

function ActionsMenu({ id, onDeleteRequest }: { id: string; onDeleteRequest: (id: string) => void }) {
  const navigate = useNavigate()

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className="bg-transparent border-none cursor-pointer text-lg text-gray-400 px-1 py-0.5 rounded leading-none tracking-wide transition-colors hover:bg-gray-100 hover:text-gray-700 focus:outline-none"
          aria-label="Actions"
        >
          ···
        </button>
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

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  return (
    <span className={`ml-1 ${active ? 'opacity-100 text-indigo-500' : 'opacity-30'}`}>
      {active && dir === 'asc' ? '↑' : '↓'}
    </span>
  )
}

export default function ProductList() {
  const navigate = useNavigate()
  const { data: products = [], isLoading, error } = useProducts()
  const deleteProduct = useDeleteProduct()
  const { sortKey, sortDir, deleteId, handleSort, setDeleteId } = useProductListStore()

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
      <div className="max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold m-0">Products</h1>
          <button
            className="px-4 py-2 bg-indigo-500 text-white border-none rounded-md text-sm font-semibold cursor-pointer transition-colors hover:bg-indigo-600"
            onClick={() => navigate('/products/new')}
          >
            + Add Product
          </button>
        </div>
        {sorted.length === 0 ? (
          <p className="p-8 text-center text-gray-500">No products found.</p>
        ) : (
          <div className="overflow-hidden rounded-lg shadow-sm">
            <table className="w-full border-collapse">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left align-middle text-xs uppercase tracking-wider text-gray-500 font-semibold border-b border-gray-200">Image</th>
                  <th className="px-4 py-3 text-left align-middle text-xs uppercase tracking-wider text-gray-500 font-semibold border-b border-gray-200">Name</th>
                  <th className="px-4 py-3 text-left align-middle text-xs uppercase tracking-wider text-gray-500 font-semibold border-b border-gray-200">Description</th>
                  <th
                    className="px-4 py-3 text-left align-middle text-xs uppercase tracking-wider text-gray-500 font-semibold border-b border-gray-200 cursor-pointer select-none whitespace-nowrap hover:text-gray-800"
                    onClick={() => handleSort('price')}
                  >
                    Price <SortIcon active={sortKey === 'price'} dir={sortDir} />
                  </th>
                  <th
                    className="px-4 py-3 text-left align-middle text-xs uppercase tracking-wider text-gray-500 font-semibold border-b border-gray-200 cursor-pointer select-none whitespace-nowrap hover:text-gray-800"
                    onClick={() => handleSort('createdAt')}
                  >
                    Created <SortIcon active={sortKey === 'createdAt'} dir={sortDir} />
                  </th>
                  <th className="px-4 py-3 border-b border-gray-200"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sorted.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 align-middle">
                      {p.imagePath ? (
                        <img src={`/products/${p.id}/image`} alt={p.name} className="block w-10 h-10 object-cover rounded" />
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 align-middle">{p.name}</td>
                    <td className="px-4 py-3 align-middle">{p.description}</td>
                    <td className="px-4 py-3 align-middle">${p.price.toFixed(2)}</td>
                    <td className="px-4 py-3 align-middle">{new Date(p.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3 align-middle w-10 text-right">
                      <ActionsMenu id={p.id} onDeleteRequest={setDeleteId} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

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
                <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md text-sm font-semibold cursor-pointer transition-colors hover:bg-gray-300">
                  Cancel
                </button>
              </AlertDialog.Cancel>
              <AlertDialog.Action asChild>
                <button
                  className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-semibold cursor-pointer transition-colors hover:bg-red-700 disabled:opacity-55 disabled:cursor-not-allowed"
                  onClick={confirmDelete}
                  disabled={deleteProduct.isPending}
                >
                  {deleteProduct.isPending ? 'Deleting…' : 'Delete'}
                </button>
              </AlertDialog.Action>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </>
  )
}
