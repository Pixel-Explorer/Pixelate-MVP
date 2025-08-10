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

const expectedHosts = [
  "'self'",
  'blob:',
  'https://www.gstatic.com',
  'https://cdnjs.cloudflare.com',
];

describe('Content Security Policy headers on static assets', () => {
  function expectPolicy(directives) {
    expect(directives['script-src']).toBeDefined();
    // Contains expected hosts
    expectedHosts.forEach(src => {
      expect(directives['script-src']).toContain(src);
    });
    // Contains a nonce
    const nonce = directives['script-src'].find(v => v.startsWith("'nonce-"));
    expect(nonce).toBeDefined();
    // Does not allow unsafe directives
    expect(directives['script-src']).not.toContain("'unsafe-inline'");
    expect(directives['script-src']).not.toContain("'unsafe-eval'");
  }

  it('styles.css has CSP header', async () => {
    const res = await request(app).get('/styles.css');
    expect(res.statusCode).toBe(200);
    expect(res.headers['content-security-policy']).toBeDefined();
    const directives = parseCsp(res.headers['content-security-policy']);
    expectPolicy(directives);
  });

  it('downloadCSV.js has CSP header', async () => {
    const res = await request(app).get('/downloadCSV.js');
    expect(res.statusCode).toBe(200);
    expect(res.headers['content-security-policy']).toBeDefined();
    const directives = parseCsp(res.headers['content-security-policy']);
    expectPolicy(directives);
  });
});
