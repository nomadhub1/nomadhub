const express = require('express');
const router = express.Router();
const { marked } = require('marked');
const path = require('path');
const fs = require('fs');

const articleModel = require('../models/article');
const { fetchOpenGraph } = require('../utils/opengraph');
const { extractDirectImageUrl } = require('../utils/imageExtractor');

// Dynamic AJAX search endpoint
router.get('/search', async (req, res) => {
  const q = req.query.q || '';
  const results = await articleModel.search(q);
  // If AJAX, return JSON
  if (req.xhr || req.headers.accept.indexOf('json') > -1) {
    return res.json({ results });
  }
  // Otherwise, render search results page
  res.render('articles/search', { results, q });
});
const categoryModel = require('../models/category');
const nicheModel = require('../models/niche');
const { ensureAuthenticated, ensureAdmin } = require('../middleware/authMiddleware.js');
const multer = require('multer');
const upload = require('../server').locals?.upload || require('multer')({ dest: path.join(__dirname, '../public/uploads') });

// List all articles
router.get('/', async (req, res) => {
  const articles = await articleModel.getAll();
  // Set activeNiche to null for index
  res.status(200).render('articles/index', {
    articles,
    activeNiche: null,
    pageTitle: 'All Articles | NomadProHub'
  });
});

// New article form
router.get('/new', ensureAdmin, async (req, res) => {
  const categories = await categoryModel.getAll();
  const niches = await nicheModel.getAll();
  let admin = null;
  if (req.session.user && req.session.user.isAdmin) {
    admin = await require('../models/user').getById(req.session.user.id);
  }
  res.render('articles/new', { article: {}, categories, niches, admin });
});



// Helper: Validate file type and size
function validateFile(file, allowedTypes, maxSizeMB) {
  if (!file) return null;
  if (!allowedTypes.includes(file.mimetype)) {
    return 'Invalid file type.';
  }
  if (file.size > maxSizeMB * 1024 * 1024) {
    return 'File too large.';
  }
  return null;
}

// Create article
router.post('/', ensureAdmin, upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'author_avatar', maxCount: 1 }
]), async (req, res) => {
  const {
    title, description, markdown, niche_id, author, author_title, article_date,
    image_link, author_avatar_link, badge
  } = req.body;
  let categories = [];
  let niches = [];
  try {
    categories = await categoryModel.getAll();
    niches = await nicheModel.getAll();
  } catch (err) {
    // If fetching categories/niches fails, log and continue with empty arrays
    console.error('Error fetching categories/niches:', err);
  }
  let errors = [];

  // Required fields
  if (!title || !markdown || !niche_id) errors.push('Title, content, and niche are required.');

  // Validate image
  let image = image_link && image_link.trim() ? image_link.trim() : '';
  if (image) {
    image = await extractDirectImageUrl(image);
  }
  if (req.files && req.files.image && req.files.image[0]) {
    const err = validateFile(req.files.image[0], ['image/jpeg','image/png','image/gif','image/webp'], 2);
    if (err) errors.push('Image: ' + err);
    else image = '/uploads/' + req.files.image[0].filename;
  }

  // Validate author avatar
  let author_avatar = author_avatar_link && author_avatar_link.trim() ? author_avatar_link.trim() : '';
  if (req.files && req.files.author_avatar && req.files.author_avatar[0]) {
    const err = validateFile(req.files.author_avatar[0], ['image/jpeg','image/png','image/gif','image/webp'], 2);
    if (err) errors.push('Author avatar: ' + err);
    else author_avatar = '/uploads/' + req.files.author_avatar[0].filename;
  }

  if (errors.length) {
    console.error('Article creation validation errors:', errors, req.body);
    return res.status(400).render('articles/new', {
      article: req.body,
      categories,
      niches,
      errors
    });
  }

  try {
    // Fetch OpenGraph metadata for image (stub)
    let ogMeta = null;
    if (image) {
      ogMeta = await fetchOpenGraph(image);
    }
    // Normalize category_ids for both single and multiple selection
    let category_ids = req.body.category_ids;
    if (typeof category_ids === 'string') category_ids = [category_ids];
    if (!Array.isArray(category_ids)) category_ids = [];
    // Normalize badge
    const badgeValue = badge && badge.trim() ? badge : null;
    await articleModel.create({
      title,
      description,
      markdown,
      niche_id,
      image,
      author,
      author_title,
      author_avatar,
      article_date: article_date || null,
      badge: badgeValue,
      opengraph_image: ogMeta ? ogMeta.image : null,
      category_ids
    });
    res.redirect('/');
  } catch (e) {
    console.error('Article creation server error:', e);
    errors.push('Server error: ' + e.message);
    res.status(500).render('articles/new', {
      article: req.body,
      categories,
      niches,
      errors
    });
  }
});

// Show single article
// Track views and show single article
router.get('/:slug', async (req, res) => {
  await articleModel.incrementViews(req.params.slug); // View tracking, no PII stored
  const article = await articleModel.getBySlug(req.params.slug);
  if (!article) return res.redirect('/');

  // ✅ Render Markdown to HTML
  article.rendered = marked(article.markdown);

  // Set activeNiche for header highlight
  // Use the niche slug, not the name
  const nicheSlug = article.niche_slug || (article.niche_name ? article.niche_name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '') : null);
  res.render('articles/show', {
    article,
    activeNiche: nicheSlug,
    pageTitle: `${article.title} | ${article.niche_name} | NomadProHub`,
    session: req.session
  });
});

// Edit article form
router.get('/edit/:id', ensureAdmin, async (req, res) => {
  const article = await articleModel.getById(req.params.id);
  article.categories = await articleModel.getCategoriesForArticle(req.params.id);
  const categories = await categoryModel.getAll();
  const niches = await nicheModel.getAll();
  res.render('articles/edit', { article, categories, niches });
});



// Update article
router.post('/update/:id', ensureAdmin, upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'author_avatar', maxCount: 1 }
]), async (req, res) => {
  const {
    title, description, markdown, niche_id, author, author_title, article_date,
    image_link, author_avatar_link, badge
  } = req.body;
  const categories = await categoryModel.getAll();
  const niches = await nicheModel.getAll();
  let errors = [];
  const existing = await articleModel.getById(req.params.id);

  if (!title || !markdown || !niche_id) errors.push('Title, content, and niche are required.');

  // Validate image
  let image = image_link && image_link.trim() ? image_link.trim() : (existing && existing.image ? existing.image : '');
  if (image) {
    image = await extractDirectImageUrl(image);
  }
  if (req.files && req.files.image && req.files.image[0]) {
    const err = validateFile(req.files.image[0], ['image/jpeg','image/png','image/gif','image/webp'], 2);
    if (err) errors.push('Image: ' + err);
    else image = '/uploads/' + req.files.image[0].filename;
  }

  // Validate author avatar
  let author_avatar = author_avatar_link && author_avatar_link.trim() ? author_avatar_link.trim() : (existing && existing.author_avatar ? existing.author_avatar : '');
  if (req.files && req.files.author_avatar && req.files.author_avatar[0]) {
    const err = validateFile(req.files.author_avatar[0], ['image/jpeg','image/png','image/gif','image/webp'], 2);
    if (err) errors.push('Author avatar: ' + err);
    else author_avatar = '/uploads/' + req.files.author_avatar[0].filename;
  }

  if (errors.length) {
    console.error('Article update validation errors:', errors, req.body);
    return res.status(400).render('articles/edit', {
      article: { ...existing, ...req.body, image, author_avatar },
      categories,
      niches,
      errors
    });
  }

  try {
    // Normalize category_ids for both single and multiple selection
    let category_ids = req.body.category_ids;
    if (typeof category_ids === 'string') category_ids = [category_ids];
    if (!Array.isArray(category_ids)) category_ids = [];
    // Normalize badge
    const badgeValue = badge && badge.trim() ? badge : null;
    await articleModel.update(req.params.id, {
      title,
      description,
      markdown,
      niche_id,
      image,
      author,
      author_title,
      author_avatar,
      article_date: article_date || null,
      badge: badgeValue,
      category_ids
    });
    res.redirect('/');
  } catch (e) {
    console.error('Article update server error:', e);
    errors.push('Server error: ' + e.message);
    res.status(500).render('articles/edit', {
      article: { ...existing, ...req.body, image, author_avatar },
      categories,
      errors
    });
  }
});

// Delete article
router.post('/delete/:id', ensureAdmin, async (req, res) => {
  await articleModel.delete(req.params.id);
  res.redirect('/');
});

module.exports = router;
