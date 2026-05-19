const request = require('supertest');

// We test against the live local development server directly 
// to verify the full stack (Express + Prisma + SQLite) integration.
const API_URL = 'http://localhost:3001';

describe('Product Catalog Integration Tests', () => {
  it('GET /api/products should return a 200 OK status and an array of products', async () => {
    const response = await request(API_URL).get('/api/products');
    
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    
    // If the database has products, verify the relational schema is working
    if (response.body.length > 0) {
      const firstProduct = response.body[0];
      expect(firstProduct).toHaveProperty('id');
      expect(firstProduct).toHaveProperty('name');
      expect(firstProduct).toHaveProperty('price');
      // Verify Prisma 'include' relational query joined the artisan correctly
      expect(firstProduct).toHaveProperty('artisan');
      expect(firstProduct.artisan).toHaveProperty('name');
    }
  });

  it('GET /api/products/nonexistent should return a 404 status', async () => {
    const response = await request(API_URL).get('/api/products/invalid-uuid-1234');
    expect(response.status).toBe(404);
  });
});
