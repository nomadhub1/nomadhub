const express = require('express');
const router = express.Router();
const { ensureAuthenticated, ensureAdmin } = require('../middleware/authMiddleware');
const categoryModel = require('../models/category');
const authController = require('../controllers/authController');
// Admin logout (GET for link compatibility)
router.get('/logout', authController.logoutHandler);
// Add new category (admin only)
router.post('/categories', ensureAdmin, async (req, res) => {
  const { name, slug } = req.body;
  if (!name || !slug) {
    req.flash('error', 'Name and slug are required.');
    return res.redirect('/admin/dashboard');
  }
  // Check if category exists
  const existing = (await categoryModel.getAll()).find(c => c.slug === slug);
  if (existing) {
    req.flash('error', 'Category already exists.');
    return res.redirect('/admin/dashboard');
  }
  await categoryModel.create({ name, slug });
  req.flash('success', 'Category added.');
  res.redirect('/admin/dashboard');
});
const userModel = require('../models/user');
const articleModel = require('../models/article');

// Dashboard (protected)
router.get('/dashboard', ensureAdmin, async (req, res) => {
  const articles = await articleModel.getAll();
  // Get stats for dashboard
  const [users] = await require('../config/db').query('SELECT COUNT(*) AS count FROM users');
  const [categories] = await require('../config/db').query('SELECT COUNT(*) AS count FROM categories');
  const [pageViews] = await require('../config/db').query('SELECT SUM(views) AS count FROM articles');
  const stats = {
    articles: articles.length,
    users: users[0]?.count || 0,
    categories: categories[0]?.count || 0,
    pageViews: pageViews[0]?.count || 0
  };
  res.render('admin/dashboard', {
    articles,
    stats,
    messages: {
      error: req.flash('error'),
      success: req.flash('success')
    },
    activeNiche: null
  });
});

// Reset password (protected)
router.get('/reset', ensureAdmin, (req, res) => {
  res.render('admin/reset', { success: null, error: null });
});

router.post('/reset', ensureAdmin, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await userModel.getById(req.session.user.id);
  const match = await userModel.verifyPassword(user, currentPassword);

  if (!match) return res.render('admin/reset', { error: 'Wrong password', success: null });

  await userModel.updatePassword(user.id, newPassword);
  res.render('admin/reset', { success: 'Password updated successfully.', error: null });
});

// User management routes
router.get('/users', ensureAdmin, authController.listUsers);
router.get('/users/:id/edit', ensureAdmin, authController.editUserForm);
router.post('/users/:id/edit', ensureAdmin, authController.updateUser);
router.post('/users/:id/delete', ensureAdmin, authController.deleteUser);

module.exports = router;
