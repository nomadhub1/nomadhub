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

describe('Admin Access Control', () => {
  it('should restrict dashboard to admin only', async () => {
    const res = await request.get('/admin/dashboard');
    expect([403, 302]).toContain(res.statusCode);
  });
  it('should restrict article creation to admin only', async () => {
    const res = await request.get('/articles/new');
    expect([403, 302]).toContain(res.statusCode);
  });
  it('should restrict job posting to admin only', async () => {
    const res = await request.get('/job/new');
    expect([403, 302]).toContain(res.statusCode);
  });
});
