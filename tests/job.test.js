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

describe('Sponsored Job Board', () => {
  it('should render job board for public users', async () => {
    const res = await request.get('/job');
    expect(res.statusCode).toBe(200);
    expect(res.text).toMatch(/Sponsored Job Board/);
  });

  it('should restrict job posting form to admin', async () => {
    const res = await request.get('/job/new');
    expect([302, 403]).toContain(res.statusCode);
  });
});
