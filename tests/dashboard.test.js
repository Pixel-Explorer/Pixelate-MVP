process.env.NODE_ENV = 'test';

jest.mock('../middleware/authMiddleware', () => ({
  requireAuth: (req, res, next) => next(),
  checkUser: (req, res, next) => next(),
  requireAdmin: (req, res, next) => next(),
}));

const request = require('supertest');
const app = require('../index');

describe('GET /dashboard', () => {
  it('should return 200', async () => {
    const res = await request(app).get('/dashboard');
    expect(res.statusCode).toBe(200);
  });
});
