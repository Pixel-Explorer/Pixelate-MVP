process.env.NODE_ENV = 'test';
process.env.COOKIE_SECURE = 'false';

jest.mock('../middleware/authMiddleware', () => ({
  requireAuth: (req, res, next) => next(),
  checkUser: (req, res, next) => next(),
  requireAdmin: (req, res, next) => next(),
}));

jest.mock('tiny-csrf', () => () => (req, res, next) => {
  req.csrfToken = () => 'test';
  next();
});

jest.mock('../controllers/blogController', () => ({
  get_dashboard: (req, res) => res.sendStatus(200),
  post_upload: (req, res) => res.sendStatus(200),
  post_uploadMultiple: (req, res) => res.sendStatus(200),
  get_profile: (req, res) => res.sendStatus(200),
  get_postData: (req, res) => res.sendStatus(200),
  get_adminDashboard: (req, res) => res.sendStatus(200),
  get_adminPhotos: (req, res) => res.sendStatus(200),
  get_adminHashtags: (req, res) => res.sendStatus(200),
  fetchPhotos: jest.fn(() => Promise.resolve([])),
  fetchHashtags: jest.fn(() => Promise.resolve([])),
  fetchUsersSummary: jest.fn(() => Promise.resolve([])),
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

describe('POST /login cookie options', () => {
  afterEach(() => {
    process.env.NODE_ENV = 'test';
    process.env.COOKIE_SECURE = 'false';
  });

  it('omits Secure attribute when COOKIE_SECURE is false', async () => {
    const res = await request(app)
      .post('/login')
      .send({ idToken: 'abc', email: 'test@example.com', password: 'abcdef' });
    expect(res.statusCode).toBe(200);
    expect(res.headers['set-cookie'][0]).not.toMatch(/Secure/);
    expect(res.headers['set-cookie'][0]).toMatch(/HttpOnly/);
    expect(res.headers['set-cookie'][0]).toMatch(/SameSite=Lax/);
  });

  it('includes Secure attribute when COOKIE_SECURE is true', async () => {
    process.env.COOKIE_SECURE = 'true';
    const res = await request(app)
      .post('/login')
      .send({ idToken: 'abc', email: 'test@example.com', password: 'abcdef' });
    expect(res.statusCode).toBe(200);
    expect(res.headers['set-cookie'][0]).toMatch(/Secure/);
    expect(res.headers['set-cookie'][0]).toMatch(/HttpOnly/);
    expect(res.headers['set-cookie'][0]).toMatch(/SameSite=Lax/);
  });

  it('returns 400 when idToken is missing', async () => {
    const res = await request(app)
      .post('/login')
      .send({ email: 'test@example.com', password: 'abcdef' });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('Missing idToken');
  });
});
