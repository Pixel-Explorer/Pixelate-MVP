process.env.NODE_ENV = 'test';

jest.mock('../middleware/authMiddleware', () => ({
  requireAuth: (req, res, next) => next(),
  checkUser: (req, res, next) => next(),
  requireAdmin: (req, res, next) => next(),
}));

jest.mock('csurf', () => () => (req, res, next) => {
  req.csrfToken = () => 'test';
  next();
});

jest.mock('../controllers/blogController', () => ({
  post_upload: (req, res) => res.redirect('/dashboard'),
  post_uploadMultiple: (req, res) => res.redirect('/dashboard'),
  fetchPhotos: jest.fn(() => Promise.resolve([])),
  fetchHashtags: jest.fn(() => Promise.resolve([])),
  fetchUsersSummary: jest.fn(() => Promise.resolve([])),
  get_dashboard: (req, res) => res.sendStatus(200),
  get_profile: (req, res) => res.sendStatus(200),
  get_postData: (req, res) => res.sendStatus(200),
  get_adminDashboard: (req, res) => res.sendStatus(200),
  get_adminPhotos: (req, res) => res.sendStatus(200),
  get_adminHashtags: (req, res) => res.sendStatus(200),
}));


const request = require('supertest');
const app = require('../index');

describe('GET /dashboard', () => {
  it('should return 200', async () => {
    const res = await request(app).get('/dashboard');
    expect(res.statusCode).toBe(200);
  });
});
