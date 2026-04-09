import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './Layout'
import ProductList from './ProductList'
import AddProduct from './AddProduct'
import EditProduct from './EditProduct'

const queryClient = new QueryClient()

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<ProductList />} />
            <Route path="/products/new" element={<AddProduct />} />
            <Route path="/products/:id/edit" element={<EditProduct />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
