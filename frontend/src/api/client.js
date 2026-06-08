import axios from 'axios'

// In production, VITE_API_BASE_URL is set to the CloudFront/ALB URL via build env
const BASE = 'http://e-comm-alb-1205083686.ap-southeast-2.elb.amazonaws.com'

const api = axios.create({ baseURL: BASE, timeout: 10000 })

// Add X-Ray trace ID forwarding header if available
api.interceptors.request.use((config) => {
  const traceId = window.__XRAY_TRACE_ID__
  if (traceId) config.headers['x-amzn-trace-id'] = traceId
  return config
})

// Products
export const productsApi = {
  list: (params = {}) => api.get('/api/products', { params }).then(r => r.data),
  get: (id) => api.get(`/api/products/${id}`).then(r => r.data),
  create: (body) => api.post('/api/products', body).then(r => r.data),
  update: (id, body) => api.put(`/api/products/${id}`, body).then(r => r.data),
  remove: (id) => api.delete(`/api/products/${id}`),
}

// Orders
export const ordersApi = {
  list: () => api.get('/api/orders').then(r => r.data),
  get: (id) => api.get(`/api/orders/${id}`).then(r => r.data),
  create: (body) => api.post('/api/orders', body).then(r => r.data),
  updateStatus: (id, status) => api.patch(`/api/orders/${id}/status`, { status }).then(r => r.data),
  cancel: (id) => api.delete(`/api/orders/${id}`),
}
