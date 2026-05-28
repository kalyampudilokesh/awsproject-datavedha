'use strict';

const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { getPool } = require('../db/pool');
const logger = require('../middleware/logger');

const router = express.Router();

// GET /api/products — list all products with optional category filter
router.get('/', async (req, res, next) => {
  try {
    const { category, search, limit = 50, offset = 0 } = req.query;
    let query = 'SELECT * FROM products WHERE 1=1';
    const params = [];

    if (category) {
      params.push(category);
      query += ` AND category = $${params.length}`;
    }
    if (search) {
      params.push(`%${search}%`);
      query += ` AND (name ILIKE $${params.length} OR description ILIKE $${params.length})`;
    }
    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(parseInt(limit), parseInt(offset));

    const { rows } = await getPool().query(query, params);
    logger.info({ message: 'Products listed', count: rows.length, traceId: req.headers['x-amzn-trace-id'] });

    res.json({ data: rows, count: rows.length, limit: parseInt(limit), offset: parseInt(offset) });
  } catch (err) {
    next(err);
  }
});

// GET /api/products/:id — get single product
router.get('/:id', async (req, res, next) => {
  try {
    const { rows } = await getPool().query('SELECT * FROM products WHERE id = $1', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Product not found', id: req.params.id });
    }
    res.json({ data: rows[0] });
  } catch (err) {
    next(err);
  }
});

// POST /api/products — create product
router.post('/', async (req, res, next) => {
  try {
    const { name, description, price, category, stock, image_url } = req.body;
    if (!name || price === undefined) {
      return res.status(400).json({ error: 'name and price are required' });
    }
    const { rows } = await getPool().query(
      `INSERT INTO products (name, description, price, category, stock, image_url)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [name, description, parseFloat(price), category, parseInt(stock || 0), image_url]
    );
    logger.info({ message: 'Product created', id: rows[0].id });
    res.status(201).json({ data: rows[0] });
  } catch (err) {
    next(err);
  }
});

// PUT /api/products/:id — update product
router.put('/:id', async (req, res, next) => {
  try {
    const { name, description, price, category, stock, image_url } = req.body;
    const { rows } = await getPool().query(
      `UPDATE products
       SET name=$1, description=$2, price=$3, category=$4, stock=$5, image_url=$6, updated_at=NOW()
       WHERE id=$7 RETURNING *`,
      [name, description, parseFloat(price), category, parseInt(stock), image_url, req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Product not found', id: req.params.id });
    }
    res.json({ data: rows[0] });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/products/:id — delete product
router.delete('/:id', async (req, res, next) => {
  try {
    const { rowCount } = await getPool().query('DELETE FROM products WHERE id = $1', [req.params.id]);
    if (rowCount === 0) {
      return res.status(404).json({ error: 'Product not found', id: req.params.id });
    }
    logger.info({ message: 'Product deleted', id: req.params.id });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

// PATCH /api/products/:id/stock — update stock only (used by orders service)
router.patch('/:id/stock', async (req, res, next) => {
  try {
    const { quantity } = req.body;
    if (quantity === undefined) {
      return res.status(400).json({ error: 'quantity is required' });
    }
    const { rows } = await getPool().query(
      `UPDATE products SET stock = stock + $1, updated_at = NOW() WHERE id = $2 RETURNING id, stock`,
      [parseInt(quantity), req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    if (rows[0].stock < 0) {
      // Rollback the update if stock goes negative
      await getPool().query(
        `UPDATE products SET stock = stock - $1, updated_at = NOW() WHERE id = $2`,
        [parseInt(quantity), req.params.id]
      );
      return res.status(409).json({ error: 'Insufficient stock' });
    }
    res.json({ data: rows[0] });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
