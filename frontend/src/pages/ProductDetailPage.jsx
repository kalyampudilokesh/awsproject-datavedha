import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { productsApi } from '../api/client'
import { useCart } from '../components/CartContext'

export default function ProductDetailPage() {
  const { id } = useParams()
  const { addToCart } = useCart()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productsApi.get(id),
  })

  const product = data?.data

  if (isLoading) return <div className="spinner-wrap"><div className="spinner" /></div>
  if (isError || !product) return (
    <div>
      <div className="alert alert-error">Product not found.</div>
      <Link to="/" className="btn btn-secondary">Back to Products</Link>
    </div>
  )

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <Link to="/" className="btn btn-secondary btn-sm" style={{ marginBottom: '1.5rem', display: 'inline-flex' }}>
        ← Back to Products
      </Link>
      <div className="card" style={{ display: 'flex', gap: '2rem', padding: '1.5rem', flexWrap: 'wrap' }}>
        <img
          src={product.image_url || `https://via.placeholder.com/400x300?text=${encodeURIComponent(product.name)}`}
          alt={product.name}
          style={{ width: 280, height: 220, objectFit: 'cover', borderRadius: 8, background: 'var(--gray-100)' }}
        />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div className="product-category">{product.category}</div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{product.name}</h1>
          <p style={{ color: 'var(--gray-500)', lineHeight: 1.6 }}>{product.description || 'No description available.'}</p>
          <div className="product-price" style={{ fontSize: '1.75rem' }}>${parseFloat(product.price).toFixed(2)}</div>
          <div className={`product-stock ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
            {product.stock > 0 ? `${product.stock} units available` : 'Out of stock'}
          </div>
          <button
            className="btn btn-primary"
            style={{ marginTop: 'auto', alignSelf: 'flex-start' }}
            disabled={product.stock === 0}
            onClick={() => addToCart(product)}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  )
}
