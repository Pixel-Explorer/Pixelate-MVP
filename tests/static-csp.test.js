process.env.NODE_ENV = 'test';

const request = require('supertest');
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

const expectedScriptSrc = [
  "'self'",
  "'unsafe-inline'",
  "'unsafe-eval'",
  'blob:',
  'https://cdn.jsdelivr.net',
  'https://cdnjs.cloudflare.com',
  'https://fonts.googleapis.com',
  'https://www.gstatic.com',
  'https://apis.google.com',
  'https://*.firebaseio.com',
  'https://infird.com',
];

describe('Content Security Policy headers on static assets', () => {
  it('styles.css has CSP header', async () => {
    const res = await request(app).get('/styles.css');
    expect(res.statusCode).toBe(200);
    expect(res.headers['content-security-policy']).toBeDefined();
    const directives = parseCsp(res.headers['content-security-policy']);
    expect(directives['script-src']).toBeDefined();
    expectedScriptSrc.forEach(src => {
      expect(directives['script-src']).toContain(src);
    });
  });

  it('downloadCSV.js has CSP header', async () => {
    const res = await request(app).get('/downloadCSV.js');
    expect(res.statusCode).toBe(200);
    expect(res.headers['content-security-policy']).toBeDefined();
    const directives = parseCsp(res.headers['content-security-policy']);
    expect(directives['script-src']).toBeDefined();
    expectedScriptSrc.forEach(src => {
      expect(directives['script-src']).toContain(src);
    });
  });
});
