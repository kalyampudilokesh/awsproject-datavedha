import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ordersApi } from '../api/client'

export default function OrderDetailPage() {
  const { id } = useParams()
  const { data: order, isLoading, isError } = useQuery({
    queryKey: ['order', id],
    queryFn: () => ordersApi.get(id),
  })

  if (isLoading) return <div className="spinner-wrap"><div className="spinner" /></div>
  if (isError || !order) return (
    <div>
      <div className="alert alert-error">Order not found.</div>
      <Link to="/orders" className="btn btn-secondary">Back to Orders</Link>
    </div>
  )

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      <Link to="/orders" className="btn btn-secondary btn-sm" style={{ marginBottom: '1.5rem', display: 'inline-flex' }}>
        ← Back to Orders
      </Link>

      <div className="card" style={{ padding: '1.5rem', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)', marginBottom: 4 }}>Order ID</div>
            <div className="order-id" style={{ fontSize: '0.95rem' }}>{order.id}</div>
          </div>
          <span className={`badge badge-${order.status}`} style={{ fontSize: '0.85rem', padding: '4px 14px' }}>
            {order.status}
          </span>
        </div>

        <div style={{ marginTop: '1.25rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '.05em' }}>Placed</div>
            <div style={{ fontWeight: 500, marginTop: 2 }}>{new Date(order.created_at).toLocaleDateString()}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '.05em' }}>Total</div>
            <div style={{ fontWeight: 700, color: 'var(--blue)', fontSize: '1.1rem', marginTop: 2 }}>
              ${parseFloat(order.total).toFixed(2)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '.05em' }}>Items</div>
            <div style={{ fontWeight: 500, marginTop: 2 }}>{order.items?.length ?? 0}</div>
          </div>
        </div>

        {order.notes && (
          <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'var(--gray-100)', borderRadius: 6, fontSize: '0.9rem' }}>
            <strong>Notes:</strong> {order.notes}
          </div>
        )}
      </div>

      <div className="card">
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--gray-200)', fontWeight: 600 }}>
          Order Items
        </div>
        {(order.items || []).map(item => (
          <div key={item.id} className="cart-item">
            <div style={{ flex: 1 }}>
              <div className="cart-item-name">{item.product_name}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>
                ${parseFloat(item.unit_price).toFixed(2)} × {item.quantity}
              </div>
            </div>
            <div style={{ fontWeight: 700 }}>
              ${(parseFloat(item.unit_price) * item.quantity).toFixed(2)}
            </div>
          </div>
        ))}
        <div style={{ padding: '1rem 1.25rem', textAlign: 'right', fontWeight: 700, fontSize: '1.1rem', borderTop: '1px solid var(--gray-200)' }}>
          Total: ${parseFloat(order.total).toFixed(2)}
        </div>
      </div>
    </div>
  )
}
