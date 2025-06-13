process.env.NODE_ENV = 'test';

jest.mock('../middleware/authMiddleware', () => ({
  requireAuth: (req, res, next) => next(),
  checkUser: (req, res, next) => next(),
  requireAdmin: (req, res, next) => next(),
}));

jest.mock('firebase-admin', () => ({
  auth: () => ({
    createSessionCookie: jest.fn(() => Promise.resolve('fakeSession')),
  }),
  credential: { applicationDefault: jest.fn(), cert: jest.fn() },
  initializeApp: jest.fn(),
  storage: jest.fn(() => ({ bucket: jest.fn() })),
  database: jest.fn(() => ({})),
  apps: [],
}));

const request = require('supertest');
const app = require('../index');

describe('GET /dashboard', () => {
  it('should return 200', async () => {
    const res = await request(app).get('/dashboard');
    expect(res.statusCode).toBe(200);
  });
});
