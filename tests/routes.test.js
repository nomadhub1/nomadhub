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

describe('NomadProHub Routes', () => {
  it('GET / should return 200 or 302 (redirect)', async () => {
    const res = await request.get('/');
    expect([200, 302]).toContain(res.statusCode);
  });

  it('GET /articles should return 200, 302, or 404', async () => {
    const res = await request.get('/articles');
    expect([200, 302, 404]).toContain(res.statusCode);
  });

  it('GET /admin should return 200, 302, 401, 403, or 404', async () => {
    const res = await request.get('/admin');
    expect([200, 302, 401, 403, 404]).toContain(res.statusCode);
  });

  it('GET /404notfound should return 404', async () => {
    const res = await request.get('/404notfound');
    expect(res.statusCode).toBe(404);
  });
});
