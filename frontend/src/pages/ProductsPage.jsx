import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { productsApi } from '../api/client'
import { useCart } from '../components/CartContext'

export default function ProductsPage() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')

  const { data, isLoading, isError } = useQuery({
    queryKey: ['products', search, category],
    queryFn: () => productsApi.list({ search: search || undefined, category: category || undefined }),
  })

  const { addToCart } = useCart()
  const products = data?.data ?? []

  const categories = [...new Set(products.map(p => p.category).filter(Boolean))]

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Products</h1>
        <div className="search-bar">
          <select
            className="form-input"
            style={{ width: 'auto' }}
            value={category}
            onChange={e => setCategory(e.target.value)}
          >
            <option value="">All categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <input
            className="form-input"
            placeholder="Search products..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {isLoading && (
        <div className="spinner-wrap"><div className="spinner" /></div>
      )}

      {isError && (
        <div className="alert alert-error">
          Could not load products. Make sure the products service is running.
        </div>
      )}

      {!isLoading && !isError && products.length === 0 && (
        <div className="alert alert-info">No products found.</div>
      )}

      <div className="product-grid">
        {products.map(product => (
          <div key={product.id} className="card product-card">
            <Link to={`/products/${product.id}`}>
              <img
                src={product.image_url || `https://via.placeholder.com/300x200?text=${encodeURIComponent(product.name)}`}
                alt={product.name}
              />
            </Link>
            <div className="product-card-body">
              <div className="product-category">{product.category}</div>
              <Link to={`/products/${product.id}`} className="product-name">{product.name}</Link>
              <div className={`product-stock ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
              </div>
              <div className="product-price">${parseFloat(product.price).toFixed(2)}</div>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => addToCart(product)}
                disabled={product.stock === 0}
              >
                {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
