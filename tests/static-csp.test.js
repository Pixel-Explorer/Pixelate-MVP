process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../index');

describe('Content Security Policy headers on static assets', () => {
  it('styles.css has CSP header', async () => {
    const res = await request(app).get('/styles.css');
    expect(res.statusCode).toBe(200);
    expect(res.headers['content-security-policy']).toBeDefined();
  });

  it('downloadCSV.js has CSP header', async () => {
    const res = await request(app).get('/downloadCSV.js');
    expect(res.statusCode).toBe(200);
    expect(res.headers['content-security-policy']).toBeDefined();
  });
});
