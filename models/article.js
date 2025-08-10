// Get article by title (for test cleanup)

const db = require('../config/db');
const { generateSlug } = require('../utils/slugify');

const articleModel = {
  async getAll() {
    const [rows] = await db.query(`
      SELECT a.*, n.name AS niche_name, n.slug AS niche_slug
      FROM articles a
      JOIN niches n ON a.niche_id = n.id
      ORDER BY a.created_at DESC
    `);
    for (const article of rows) {
      article.categories = await articleModel.getCategoriesForArticle(article.id);
    }
    return rows;
  },
  async search(query) {
    if (!query || !query.trim()) return [];
    const like = `%${query.trim()}%`;
    const [rows] = await db.query(`
      SELECT * FROM articles
      WHERE title LIKE ? OR description LIKE ? OR markdown LIKE ? OR author LIKE ?
      ORDER BY created_at DESC
      LIMIT 20
    `, [like, like, like, like]);
    for (const article of rows) {
      article.categories = await articleModel.getCategoriesForArticle(article.id);
    }
    return rows;
  },
  async getByTitle(title) {
    const [rows] = await db.query('SELECT * FROM articles WHERE title = ?', [title]);
    return rows[0] || null;
  },
  async getBySlug(slug) {
    const [rows] = await db.query(`
      SELECT a.*, n.name AS niche_name, n.slug AS niche_slug
      FROM articles a
      JOIN niches n ON a.niche_id = n.id
      WHERE a.slug = ? LIMIT 1
    `, [slug]);
    const article = rows[0];
    if (article) {
      article.categories = await articleModel.getCategoriesForArticle(article.id);
    }
    return article;
  },
  async getById(id) {
    const [rows] = await db.query(`
      SELECT a.*, n.name AS niche_name, n.slug AS niche_slug
      FROM articles a
      JOIN niches n ON a.niche_id = n.id
      WHERE a.id = ?
    `, [id]);
    return rows[0];
  },
  async getByCategorySlug(categorySlug) {
    const [catRows] = await db.query(`SELECT id FROM categories WHERE slug = ?`, [categorySlug]);
    if (!catRows[0]) return [];
    const categoryId = catRows[0].id;
    const [acRows] = await db.query(`SELECT article_id FROM article_categories WHERE category_id = ?`, [categoryId]);
    if (acRows.length === 0) return [];
    const articleIds = acRows.map(r => r.article_id);
    if (articleIds.length === 0) return [];
    const [articles] = await db.query(`
      SELECT a.*, n.name AS niche_name
      FROM articles a
      JOIN niches n ON a.niche_id = n.id
      WHERE a.id IN (${articleIds.map(() => '?').join(',')})
      ORDER BY a.created_at DESC
    `, articleIds);
    for (const article of articles) {
      article.categories = await articleModel.getCategoriesForArticle(article.id);
    }
    return articles;
  },
  async getCategoriesForArticle(articleId) {
    const [rows] = await db.query(`
      SELECT c.* FROM categories c
      JOIN article_categories ac ON ac.category_id = c.id
      WHERE ac.article_id = ?
    `, [articleId]);
    return rows;
  },
  async addCategoriesToArticle(articleId, categoryIds) {
    await db.query(`DELETE FROM article_categories WHERE article_id = ?`, [articleId]);
    for (const catId of categoryIds) {
      await db.query(`INSERT INTO article_categories (article_id, category_id) VALUES (?, ?)`, [articleId, catId]);
    }
  },
  async create({ title, description, markdown, image, niche_id, author, author_title, author_avatar, article_date, badge, category_ids, opengraph_image }) {
    const slug = generateSlug(title);
    // Ensure badge and opengraph_image are set to null if empty
    const badgeValue = badge && badge.trim() ? badge : null;
    const ogImageValue = opengraph_image && opengraph_image.trim() ? opengraph_image : null;
    // Only 12 columns, so 12 placeholders
    const [result] = await db.query(
      `INSERT INTO articles (title, slug, description, markdown, image, niche_id, author, author_title, author_avatar, article_date, badge, opengraph_image)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, slug, description, markdown, image, niche_id, author, author_title, author_avatar, article_date, badgeValue, ogImageValue]
    );
    if (category_ids && category_ids.length) {
      await articleModel.addCategoriesToArticle(result.insertId, category_ids);
    }
    return result.insertId;
  },
  async update(id, { title, description, markdown, image, niche_id, author, author_title, author_avatar, article_date, badge, category_ids, opengraph_image }) {
    const slug = generateSlug(title);
    await db.query(`
      UPDATE articles
      SET title = ?, slug = ?, description = ?, markdown = ?, image = ?, niche_id = ?, author = ?, author_title = ?, author_avatar = ?, article_date = ?, badge = ?, opengraph_image = ?, updated_at = NOW()
      WHERE id = ?
    `, [title, slug, description, markdown, image, niche_id, author, author_title, author_avatar, article_date, badge, opengraph_image, id]);
    if (category_ids) {
      await articleModel.addCategoriesToArticle(id, category_ids);
    }
  },
  async delete(id) {
    await db.query(`DELETE FROM article_categories WHERE article_id = ?`, [id]);
    await db.query(`DELETE FROM articles WHERE id = ?`, [id]);
  },
  async getRecentSince(date) {
    const [rows] = await db.query(`SELECT * FROM articles WHERE created_at >= ? ORDER BY created_at DESC`, [date]);
    return rows;
  },
  async incrementViews(slug) {
    await db.query(`UPDATE articles SET views = COALESCE(views,0)+1 WHERE slug = ?`, [slug]);
  }
};
module.exports = articleModel;
