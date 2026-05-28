import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ordersApi } from '../api/client'

function statusBadge(status) {
  return <span className={`badge badge-${status}`}>{status}</span>
}

export default function OrdersPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['orders'],
    queryFn: ordersApi.list,
  })

  const orders = Array.isArray(data) ? data : []

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Orders</h1>
      </div>

      {isLoading && <div className="spinner-wrap"><div className="spinner" /></div>}
      {isError && <div className="alert alert-error">Could not load orders. Make sure the orders service is running.</div>}
      {!isLoading && !isError && orders.length === 0 && (
        <div className="alert alert-info">No orders yet. <Link to="/">Start shopping →</Link></div>
      )}

      {orders.length > 0 && (
        <div className="card">
          {orders.map(order => (
            <div key={order.id} className="order-row">
              <div>
                <div className="order-id">{order.id}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)', marginTop: 2 }}>
                  {new Date(order.created_at).toLocaleDateString()} · {order.items?.length ?? 0} item(s)
                </div>
              </div>
              {statusBadge(order.status)}
              <div className="order-total">${parseFloat(order.total).toFixed(2)}</div>
              <Link to={`/orders/${order.id}`} className="btn btn-secondary btn-sm">View</Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
