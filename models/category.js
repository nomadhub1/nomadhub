const db = require('../config/db');

module.exports = {
  async create({ name, slug }) {
    const [result] = await db.query('INSERT INTO categories (name, slug) VALUES (?, ?)', [name, slug]);
    return result.insertId;
  },
  async getAllWithArticles() {
    // Get all categories
    const [categories] = await db.query(`SELECT * FROM categories ORDER BY name ASC`);
    // For each category, get its articles via join table
    for (const cat of categories) {
      const [acRows] = await db.query(`SELECT article_id FROM article_categories WHERE category_id = ?`, [cat.id]);
      if (acRows.length === 0) {
        cat.articles = [];
        continue;
      }
      const articleIds = acRows.map(r => r.article_id);
      const [articles] = await db.query(`SELECT * FROM articles WHERE id IN (${articleIds.map(() => '?').join(',')}) ORDER BY created_at DESC`, articleIds);
      cat.articles = articles;
    }
    return categories;
  },
  async getAll() {
    const [rows] = await db.query(`SELECT * FROM categories ORDER BY name ASC`);
    return rows;
  },

  async getBySlug(slug) {
    const [rows] = await db.query(`SELECT * FROM categories WHERE slug = ?`, [slug]);
    return rows[0];
  }
};
