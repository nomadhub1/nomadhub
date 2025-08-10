const db = require('../config/db');

module.exports = {
  async getByCategoryId(categoryId) {
    const [rows] = await db.query(`
      SELECT a.*, c.name AS category_name, c.slug AS category_slug
      FROM articles a
      JOIN categories c ON a.category_id = c.id
      WHERE c.id = ?
      ORDER BY a.created_at DESC
    `, [categoryId]);
    return rows;
  }
};
