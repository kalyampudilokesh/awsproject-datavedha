import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../components/CartContext'
import { ordersApi } from '../api/client'

// Fixed demo customer ID — in a real app this comes from auth
const DEMO_CUSTOMER_ID = '550e8400-e29b-41d4-a716-446655440000'

export default function CartPage() {
  const { cart, removeFromCart, updateQty, clearCart, total } = useCart()
  const [placing, setPlacing] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const handlePlaceOrder = async () => {
    setError(null)
    setPlacing(true)
    try {
      const order = await ordersApi.create({
        customer_id: DEMO_CUSTOMER_ID,
        items: cart.map(item => ({ product_id: item.id, quantity: item.quantity })),
      })
      clearCart()
      navigate(`/orders/${order.id}`)
    } catch (err) {
      const msg = err.response?.data?.detail || err.response?.data?.error || 'Failed to place order. Please try again.'
      setError(msg)
    } finally {
      setPlacing(false)
    }
  }

  if (cart.length === 0) {
    return (
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <h1 className="page-title" style={{ marginBottom: '1.5rem' }}>Your Cart</h1>
        <div className="card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--gray-500)' }}>
          <p style={{ marginBottom: '1rem' }}>Your cart is empty.</p>
          <Link to="/" className="btn btn-primary">Browse Products</Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 640, margin: '0 auto' }}>
      <h1 className="page-title" style={{ marginBottom: '1.5rem' }}>Your Cart</h1>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="card" style={{ marginBottom: '1rem' }}>
        {cart.map(item => (
          <div key={item.id} className="cart-item">
            <img
              src={item.image_url || `https://via.placeholder.com/64x64?text=${encodeURIComponent(item.name)}`}
              alt={item.name}
            />
            <div className="cart-item-info">
              <div className="cart-item-name">{item.name}</div>
              <div className="cart-item-price">${parseFloat(item.price).toFixed(2)} each</div>
            </div>
            <div className="qty-control">
              <button className="qty-btn" onClick={() => updateQty(item.id, item.quantity - 1)}>−</button>
              <span style={{ minWidth: 24, textAlign: 'center', fontWeight: 600 }}>{item.quantity}</span>
              <button className="qty-btn" onClick={() => updateQty(item.id, item.quantity + 1)}>+</button>
            </div>
            <div style={{ fontWeight: 700, minWidth: 72, textAlign: 'right' }}>
              ${(parseFloat(item.price) * item.quantity).toFixed(2)}
            </div>
            <button className="btn btn-danger btn-sm" onClick={() => removeFromCart(item.id)}>✕</button>
          </div>
        ))}

        <div className="cart-summary">
          <div className="cart-total">Total: ${total.toFixed(2)}</div>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button className="btn btn-secondary" onClick={clearCart}>Clear Cart</button>
            <button className="btn btn-primary" onClick={handlePlaceOrder} disabled={placing}>
              {placing ? 'Placing Order...' : 'Place Order'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
