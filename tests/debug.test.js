process.env.NODE_ENV = 'test';

jest.mock('../middleware/authMiddleware', () => ({
  requireAuth: (req, res, next) => next(),
  checkUser: (req, res, next) => {
    res.locals.isAdmin = false;
    next();
  },
  requireAdmin: (req, res, next) => next(),
}));

const request = require('supertest');
const app = require('../index');

describe('GET /_debug/secrets', () => {
  afterEach(() => {
    process.env.NODE_ENV = 'test';
  });

  it('should return JSON with mounted array', async () => {
    const res = await request(app).get('/_debug/secrets');
    expect(res.statusCode).toBe(200);
    expect(res.body).toBeDefined();
    expect(Array.isArray(res.body.mounted)).toBe(true);
  });

  it('returns 404 in production without admin privileges', async () => {
    process.env.NODE_ENV = 'production';
    const res = await request(app).get('/_debug/secrets');
    expect(res.statusCode).toBe(404);
  });
});
