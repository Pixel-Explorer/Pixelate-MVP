const request = require('supertest');
process.env.NODE_ENV = 'test';

jest.mock('../middleware/authMiddleware', () => ({
  requireAuth: (req, res, next) => next(),
  checkUser: (req, res, next) => { res.locals.isAdmin = false; res.locals.user = null; next(); },
  requireAdmin: (req, res, next) => next(),
}));

jest.mock('csurf', () => () => (req, res, next) => {
  req.csrfToken = () => 'test';
  next();
});

const app = require('../index');

describe('Public pages', () => {
  it('login page loads vendor assets', async () => {
    const res = await request(app).get('/login');
    expect(res.statusCode).toBe(200);
    expect(res.text).toContain('/vendor/css/bootstrap.min.css');
    expect(res.text).toContain('/vendor/js/jquery.min.js');
    expect(res.text).toContain('/vendor/js/bootstrap.bundle.min.js');
  });

  it('signup page loads vendor assets', async () => {
    const res = await request(app).get('/signup');
    expect(res.statusCode).toBe(200);
    expect(res.text).toContain('/vendor/css/bootstrap.min.css');
    expect(res.text).toContain('/vendor/js/jquery.min.js');
    expect(res.text).toContain('/vendor/js/bootstrap.bundle.min.js');
  });
});
