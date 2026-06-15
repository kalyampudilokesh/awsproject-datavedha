'use strict';

const { Pool } = require('pg');
const logger = require('../middleware/logger');

let pool;

function getPool() {
  if (!pool) {
    pool = new Pool({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'ecommerce',
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
    });

    pool.on('error', (err) => {
      logger.error({ message: 'Unexpected DB pool error', error: err.message });
    });
  }
  return pool;
}

async function initDb() {
  const client = await getPool().connect();
  try {
       // Enable pgcrypto extension
    await client.query(`
      CREATE EXTENSION IF NOT EXISTS pgcrypto;
    `);
    // Create products table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name        VARCHAR(255) NOT NULL,
        description TEXT,
        price       NUMERIC(10, 2) NOT NULL,
        category    VARCHAR(100),
        stock       INTEGER NOT NULL DEFAULT 0,
        image_url   TEXT,
        created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // Seed with sample data if empty
    const { rowCount } = await client.query('SELECT 1 FROM products LIMIT 1');
    if (rowCount === 0) {
      await client.query(`
        INSERT INTO products (name, description, price, category, stock, image_url) VALUES
          ('Wireless Headphones', 'Premium noise-cancelling over-ear headphones', 149.99, 'Electronics', 50, 'https://via.placeholder.com/300x300?text=Headphones'),
          ('Mechanical Keyboard', 'TKL mechanical keyboard with Cherry MX switches', 89.99, 'Electronics', 30, 'https://via.placeholder.com/300x300?text=Keyboard'),
          ('Standing Desk Mat', 'Anti-fatigue mat for standing desks', 39.99, 'Office', 100, 'https://via.placeholder.com/300x300?text=Desk+Mat'),
          ('USB-C Hub 7-in-1', 'Multiport adapter with HDMI, USB-A, SD card', 49.99, 'Electronics', 75, 'https://via.placeholder.com/300x300?text=USB+Hub'),
          ('Laptop Backpack', 'Water-resistant backpack fits up to 15.6 inch laptops', 59.99, 'Bags', 60, 'https://via.placeholder.com/300x300?text=Backpack'),
          ('Blue Light Glasses', 'Anti blue-light lenses for screen-heavy work', 24.99, 'Accessories', 200, 'https://via.placeholder.com/300x300?text=Glasses');
      `);
      logger.info('Seed data inserted into products table');
    }
  } finally {
    client.release();
  }
}

module.exports = { getPool, initDb };
