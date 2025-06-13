process.env.NODE_ENV = 'test';

jest.mock('../middleware/authMiddleware', () => ({
  requireAuth: (req, res, next) => next(),
  checkUser: (req, res, next) => next(),
  requireAdmin: (req, res, next) => next(),
}));

jest.mock('../controllers/blogController', () => ({
  post_upload: (req, res) => res.redirect('/dashboard'),
  post_uploadMultiple: (req, res) => res.redirect('/dashboard'),
  fetchPhotos: jest.fn(() => Promise.resolve([
    {
      id: '1',
      user: 'alice',
      av: 2.8,
      tv: '0.005',
      ev: 1,
      sp: 10,
      imageUrl: 'http://example.com/photo.jpg'
    }
  ])),
  fetchHashtags: jest.fn(() => Promise.resolve([
    { title: 'tag1', count: 2, utilityTokensLocked: 100, avgPrice: 50 }
  ])),
  fetchUsersSummary: jest.fn(() => Promise.resolve([
    { user: 'alice', imageCount: 3, hashtagsCount: 7, totalSp: 21 }
  ])),
  get_dashboard: (req, res) => res.sendStatus(200), // stub
  get_adminDashboard: (req, res) => res.sendStatus(200), // stub
  get_adminPhotos: (req, res) => res.sendStatus(200), // stub
  get_adminHashtags: (req, res) => res.sendStatus(200), // stub
}));

const request = require('supertest');
const app = require('../index');
const path = require('path');

describe('Upload handlers', () => {
  it('POST /upload should redirect after single upload', async () => {
    const res = await request(app)
      .post('/upload')
      .field('hashtags', JSON.stringify(['#tag1']))
      .attach('photo', Buffer.from('dummy'), 'test.jpg');
    expect(res.statusCode).toBe(302);
    expect(res.headers['location']).toBe('/dashboard');
  });

  it('POST /upload-multiple should redirect after multiple upload', async () => {
    const res = await request(app)
      .post('/upload-multiple')
      .field('hashtagsMultiple', JSON.stringify(['#tag1', '#tag2']))
      .attach('images', Buffer.from('a'), 'a.jpg')
      .attach('images', Buffer.from('b'), 'b.jpg');
    expect(res.statusCode).toBe(302);
    expect(res.headers['location']).toBe('/dashboard');
  });
});

describe('CSV export endpoints', () => {
  it('GET /export/photos.csv returns CSV data', async () => {
    const res = await request(app).get('/export/photos.csv');
    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toContain('text/csv');
    expect(res.text).toContain('ID,User,Aperture,Shutter,EV,BaseValue,ImageURL');
    expect(res.text).toContain('1,alice,2.8,1/200,1,10,http://example.com/photo.jpg');
  });

  it('GET /export/hashtags.csv returns CSV data', async () => {
    const res = await request(app).get('/export/hashtags.csv');
    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toContain('text/csv');
    expect(res.text).toContain('Title,Count,Locked,AveragePrice');
    expect(res.text).toContain('tag1,2,100,50');
  });

  it('GET /export/users.csv returns CSV data', async () => {
    const res = await request(app).get('/export/users.csv');
    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toContain('text/csv');
    expect(res.text).toContain('Username,TotalPhotos,TotalHashtags,TotalWorth,AvgHashPerPhoto');
    expect(res.text).toContain('alice,3,7,21.000,2.33');
  });
});
