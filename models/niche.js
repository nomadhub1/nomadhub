const db = require('../config/db');

const nicheModel = {
  async getAll() {
    const [rows] = await db.query('SELECT * FROM niches ORDER BY id ASC');
    return rows;
  },
  async getById(id) {
    const [rows] = await db.query('SELECT * FROM niches WHERE id = ?', [id]);
    return rows[0] || null;
  },
  async getBySlug(slug) {
    const [rows] = await db.query('SELECT * FROM niches WHERE slug = ?', [slug]);
    return rows[0] || null;
  }
};

module.exports = nicheModel;
