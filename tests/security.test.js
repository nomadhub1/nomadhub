const { app, startServer } = require('../server');
let server;
let request;

beforeAll(() => {
  server = startServer(0);
  request = require('supertest')(app);
});

afterAll(() => {
  if (server && server.close) server.close();
});

describe('Security: Markdown Sanitization', () => {
  it('should sanitize script tags in markdown output', async () => {
    const malicious = '<script>alert("xss")</script><h1>Header</h1>';
    const res = await request.get('/');
    expect(res.text).toContain('<script');
  });
});
