process.env.NODE_ENV = 'test';

const request = require('supertest');

jest.mock('../middleware/authMiddleware', () => ({
  requireAuth: (req, res, next) => next(),
  checkUser: (req, res, next) => {
    res.locals.isAdmin = false;
    res.locals.user = null;
    next();
  },
  requireAdmin: (req, res, next) => next(),
}));

jest.mock('../controllers/blogController', () => ({
  get_dashboard: (req, res) => res.sendStatus(200),
  get_profile: (req, res) => res.sendStatus(200),
  get_postData: (req, res) => res.sendStatus(200),
  get_adminDashboard: (req, res) => res.sendStatus(200),
  get_adminPhotos: (req, res) => res.sendStatus(200),
  get_adminHashtags: (req, res) => res.sendStatus(200),
  post_upload: (req, res) => res.sendStatus(200),
  post_uploadMultiple: (req, res) => res.sendStatus(200),
  fetchPhotos: jest.fn(() => Promise.resolve([])),
  fetchHashtags: jest.fn(() => Promise.resolve([])),
  fetchUsersSummary: jest.fn(() => Promise.resolve([])),
}));

jest.mock('tiny-csrf', () => () => (req, res, next) => { req.csrfToken = () => 'test'; next(); });

const app = require('../index');

function parseCsp(header) {
  return header.split(';').reduce((acc, part) => {
    const trimmed = part.trim();
    if (!trimmed) return acc;
    const [name, ...values] = trimmed.split(/\s+/);
    acc[name] = values;
    return acc;
  }, {});
}

describe('CSP headers on pages', () => {
  const routes = [
    '/login',
    '/signup',
    '/dashboard',
    '/profile',
    '/personal-gallery',
    '/admin/dashboard',
    '/admin/dashboard/photos',
    '/admin/dashboard/hashtags',
  ];
  routes.forEach(route => {
    it(`${route} has nonce in CSP`, async () => {
      const res = await request(app).get(route);
      expect(res.statusCode).toBe(200);
      const csp = res.headers['content-security-policy'];
      expect(csp).toBeDefined();
      const directives = parseCsp(csp);
      expect(directives['script-src']).toBeDefined();
      const nonce = directives['script-src'].find(v => v.startsWith("'nonce-"));
      expect(nonce).toBeDefined();
    });
  });
});
