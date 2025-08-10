const request = require('supertest');
const { app, startServer } = require('../server');
const articleModel = require('../models/article');

describe('Article CRUD', () => {
  let createdArticleId;
  let server;
  beforeAll(async () => {
    server = startServer(0); // Use ephemeral port for tests
    // Cleanup any existing test article with same slug
    const slug = require('../utils/slugify').generateSlug(testArticle.title);
    const foundBySlug = await articleModel.getBySlug(slug);
    if (foundBySlug && foundBySlug.id) {
      await articleModel.delete(foundBySlug.id);
    }
    // Cleanup any existing test article with same title (legacy)
    const foundByTitle = await articleModel.getByTitle(testArticle.title);
    if (foundByTitle && foundByTitle.id) {
      await articleModel.delete(foundByTitle.id);
    }
    const agent = await getAdminAgent();
    let req = agent.post('/articles');
    Object.entries(testArticle).forEach(([key, value]) => {
      req = req.field(key, value);
    });
    const res = await req;
    const location = res.headers.location;
    if (location) {
      const match = location.match(/\/articles\/(\d+)/);
      if (match) createdArticleId = match[1];
    }
    if (!createdArticleId) {
      // Fallback: get latest article by title
      const found = await articleModel.getByTitle(testArticle.title);
      if (found) createdArticleId = found.id;
      else createdArticleId = 1;
    }
  });
  // Utility to login as admin and return a session-enabled agent
  async function getAdminAgent() {
    const agent = request.agent(app);
    const loginRes = await agent
      .post('/admin/login')
      .send('email=admin@hub.com&password=newpassword123')
      .set('Content-Type', 'application/x-www-form-urlencoded');
    // Check session cookie is set
    const setCookie = loginRes.headers['set-cookie'];
    expect(setCookie).toBeDefined();
    expect(setCookie.join(';')).toMatch(/connect\.sid/);
    return agent;
  }

  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
  const testArticle = {
    title: `Test Article ${uniqueSuffix}`,
    description: 'Test description',
    markdown: '# Test',
    niche_id: '1',
    category_ids: ['1'],
    author: 'Tester',
    author_title: 'QA',
    article_date: '2025-07-29',
    image_link: 'https://example.com/test-image.jpg'
  };

  it('should restrict creation to admin', async () => {
    const res = await request(app).post('/articles').send(testArticle);
    expect([403, 401, 302]).toContain(res.statusCode);
  });

  it('should allow admin to create article', async () => {
    // Cleanup any existing test article with same slug and title before create
    const slug = require('../utils/slugify').generateSlug(testArticle.title);
    const foundBySlug = await articleModel.getBySlug(slug);
    if (foundBySlug && foundBySlug.id) {
      await articleModel.delete(foundBySlug.id);
    }
    const foundByTitle = await articleModel.getByTitle(testArticle.title);
    if (foundByTitle && foundByTitle.id) {
      await articleModel.delete(foundByTitle.id);
    }
    const agent = await getAdminAgent();
    let req = agent.post('/articles');
    Object.entries(testArticle).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach(v => {
          req = req.field(key, v);
        });
      } else {
        req = req.field(key, value);
      }
    });
    const res = await req;
    if (![200, 302].includes(res.statusCode)) {
      console.error('Create article failed:', res.statusCode, res.text);
    }
    expect([200, 302]).toContain(res.statusCode);
  });

  it('should allow admin to update article', async () => {
    const agent = await getAdminAgent();
    let req = agent.post(`/articles/update/${createdArticleId}`);
    Object.entries(testArticle).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach(v => {
          req = req.field(key, v);
        });
      } else {
        req = req.field(key, value);
      }
    });
    const res = await req;
    if (![200, 302].includes(res.statusCode)) {
      console.error('Update article failed:', res.statusCode, res.text);
    }
    expect([200, 302]).toContain(res.statusCode);
  });

  it('should allow admin to delete article', async () => {
    const agent = await getAdminAgent();
    const res = await agent.post(`/articles/delete/${createdArticleId}`);
    if (![200, 302].includes(res.statusCode)) {
      console.error('Delete article failed:', res.statusCode, res.text);
    }
    expect([200, 302]).toContain(res.statusCode);
  });

  it('should fail to create article with invalid file type', async () => {
    const agent = await getAdminAgent();
    const badArticle = { ...testArticle };
    const res = await agent.post('/articles').field('title', badArticle.title).attach('image', Buffer.from('dummy'), 'test.txt');
    expect([400, 500]).toContain(res.statusCode);
  });

  it('should fail to create article with missing required fields', async () => {
    const agent = await getAdminAgent();
    const badArticle = { ...testArticle, title: '' };
    const res = await agent.post('/articles').send(badArticle);
    expect([400, 500]).toContain(res.statusCode);
  });

  afterAll(async () => {
    // Cleanup: delete test article
    if (createdArticleId) {
      await articleModel.delete(createdArticleId);
    }
    if (server && server.close) {
      await new Promise(resolve => server.close(resolve));
    }
  });
});
