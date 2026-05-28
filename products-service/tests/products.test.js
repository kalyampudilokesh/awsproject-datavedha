'use strict';

// Mock the DB pool so tests don't need a real database
jest.mock('../src/db/pool', () => ({
  getPool: jest.fn(),
  initDb: jest.fn().mockResolvedValue(undefined)
}));

const request = require('supertest');
const app = require('../src/app');
const { getPool } = require('../src/db/pool');

const mockQuery = jest.fn();
getPool.mockReturnValue({ query: mockQuery });

afterEach(() => { mockQuery.mockReset(); });

describe('GET /health', () => {
  it('returns 200 with healthy status', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
  });
});

describe('GET /api/products', () => {
  it('returns a list of products', async () => {
    const fakeProducts = [
      { id: 'abc-123', name: 'Test Product', price: '9.99', stock: 10 }
    ];
    mockQuery.mockResolvedValue({ rows: fakeProducts, rowCount: 1 });

    const res = await request(app).get('/api/products');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].name).toBe('Test Product');
  });

  it('returns empty array when no products', async () => {
    mockQuery.mockResolvedValue({ rows: [], rowCount: 0 });
    const res = await request(app).get('/api/products');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
  });
});

describe('GET /api/products/:id', () => {
  it('returns 404 when product not found', async () => {
    mockQuery.mockResolvedValue({ rows: [], rowCount: 0 });
    const res = await request(app).get('/api/products/nonexistent-id');
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Product not found');
  });

  it('returns product when found', async () => {
    const product = { id: 'abc-123', name: 'Test', price: '9.99' };
    mockQuery.mockResolvedValue({ rows: [product], rowCount: 1 });
    const res = await request(app).get('/api/products/abc-123');
    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Test');
  });
});

describe('POST /api/products', () => {
  it('returns 400 when name is missing', async () => {
    const res = await request(app).post('/api/products').send({ price: 9.99 });
    expect(res.status).toBe(400);
  });

  it('creates a product and returns 201', async () => {
    const created = { id: 'new-id', name: 'New Product', price: '19.99', stock: 5 };
    mockQuery.mockResolvedValue({ rows: [created], rowCount: 1 });
    const res = await request(app)
      .post('/api/products')
      .send({ name: 'New Product', price: 19.99, stock: 5 });
    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe('New Product');
  });
});

describe('DELETE /api/products/:id', () => {
  it('returns 404 when product not found', async () => {
    mockQuery.mockResolvedValue({ rowCount: 0 });
    const res = await request(app).delete('/api/products/missing-id');
    expect(res.status).toBe(404);
  });

  it('returns 204 on successful delete', async () => {
    mockQuery.mockResolvedValue({ rowCount: 1 });
    const res = await request(app).delete('/api/products/abc-123');
    expect(res.status).toBe(204);
  });
});
