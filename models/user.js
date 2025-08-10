const db = require('../config/db');
const bcrypt = require('bcrypt');

module.exports = {
  // Get user by email
  async getByEmail(email) {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ? LIMIT 1', [email]);
    return rows[0];
  },

  // Get user by id
  async getById(id) {
    const [rows] = await db.query('SELECT * FROM users WHERE id = ? LIMIT 1', [id]);
    return rows[0];
  },

  // Verify password (by user object)
  async verifyPassword(user, inputPassword) {
    return bcrypt.compare(inputPassword, user.password);
  },

  // Verify password (by email)
  async verifyPasswordByEmail(email, password) {
    const user = await this.getByEmail(email);
    if (!user) return false;
    return await bcrypt.compare(password, user.password);
  },

  // Update password
  async updatePassword(id, newPassword) {
    const hash = await bcrypt.hash(newPassword, 10);
    await db.query('UPDATE users SET password = ? WHERE id = ?', [hash, id]);
  },

  // Create user
  async create({ email, password, isAdmin = false, name = null, avatar = null, title = null }) {
    const hash = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      'INSERT INTO users (email, password, isAdmin, name, avatar, title) VALUES (?, ?, ?, ?, ?, ?)',
      [email, hash, isAdmin, name, avatar, title]
    );
    return result.insertId;
  },

  // Get all users
  async getAll() {
    const [rows] = await db.query('SELECT * FROM users ORDER BY created_at DESC');
    return rows;
  },

  // Update user
  async update(id, { email, name, avatar, title, isAdmin }) {
    await db.query(
      'UPDATE users SET email = ?, name = ?, avatar = ?, title = ?, isAdmin = ? WHERE id = ?',
      [email, name, avatar, title, isAdmin, id]
    );
  },

  // Delete user
  async delete(id) {
    await db.query('DELETE FROM users WHERE id = ?', [id]);
  }
};
