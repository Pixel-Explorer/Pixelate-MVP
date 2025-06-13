process.env.NODE_ENV = 'test';

jest.mock('../middleware/authMiddleware', () => ({
  requireAuth: (req, res, next) => next(),
  checkUser: (req, res, next) => next(),
  requireAdmin: (req, res, next) => next(),
}));

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

const request = require('supertest');
const app = require('../index');

describe('Unknown routes', () => {
  it('returns 404 for nonexistent path', async () => {
    const res = await request(app).get('/no-such-page');
    expect(res.statusCode).toBe(404);
  });
});
