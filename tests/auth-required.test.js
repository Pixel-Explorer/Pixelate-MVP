process.env.NODE_ENV = 'test';

jest.mock('../middleware/authMiddleware', () => ({
  requireAuth: (req, res, next) => {
    res.status(401).json({ error: 'User is not authenticated' });
  },
  checkUser: (req, res, next) => next(),
  requireAdmin: (req, res, next) => next(),
}));

jest.mock('csurf', () => () => (req, res, next) => {
  req.csrfToken = () => 'test';
  next();
});

jest.mock('../controllers/blogController', () => ({
  post_upload: (req, res) => res.status(200).end(),
  post_uploadMultiple: (req, res) => res.status(200).end(),
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

describe('Authentication required', () => {
  it('POST /upload returns 401 when unauthenticated', async () => {
    const res = await request(app).post('/upload');
    expect(res.statusCode).toBe(401);
  });

  it('POST /upload-multiple returns 401 when unauthenticated', async () => {
    const res = await request(app).post('/upload-multiple');
    expect(res.statusCode).toBe(401);
  });
});
