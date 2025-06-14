process.env.NODE_ENV = 'test';

jest.mock('../middleware/authMiddleware', () => ({
  requireAuth: (req, res, next) => next(),
  checkUser: (req, res, next) => {
    res.locals.user = null;
    res.locals.isAdmin = false;
    next();
  },
  requireAdmin: (req, res, next) => next(),
}));

jest.mock('csurf', () => () => (req, res, next) => {
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
  });

  it('omits Secure attribute when not in production', async () => {
    const res = await request(app)
      .post('/login')
      .send({ idToken: 'abc' });
    expect(res.statusCode).toBe(200);
    expect(res.headers['set-cookie'][0]).not.toMatch(/Secure/);
    expect(res.headers['set-cookie'][0]).toMatch(/HttpOnly/);
  });

  it('includes Secure attribute in production', async () => {
    process.env.NODE_ENV = 'production';
    const res = await request(app)
      .post('/login')
      .send({ idToken: 'abc' });
    expect(res.statusCode).toBe(200);
    expect(res.headers['set-cookie'][0]).toMatch(/Secure/);
  });
});

describe('Security headers', () => {
  it('sets the Content-Security-Policy header', async () => {
    const res = await request(app).get('/login');
    expect(res.statusCode).toBe(200);
    expect(res.headers['content-security-policy']).toBeDefined();
  });
});
