const express = require('express');
const router = express.Router();
const articleModel = require('../models/article');
const categoryModel = require('../models/category');
const nicheModel = require('../models/niche');

// List articles by category
router.get('/categories/:slug', async (req, res) => {
  const category = await categoryModel.getBySlug(req.params.slug);
  if (!category) return res.status(404).render('404');
  const articles = await articleModel.getByCategorySlug(req.params.slug);
  // Pass activeNiche for nav highlight
  res.render('articles/category', { category, articles, activeNiche: category.slug });
});
// List all niches
router.get('/niches', async (req, res) => {
  const niches = await nicheModel.getAll();
  res.render('niches', { niches });
});

// List articles by niche
router.get('/niches/:slug', async (req, res) => {
  const niche = await nicheModel.getBySlug(req.params.slug);
  if (!niche) return res.status(404).send('Niche not found');
  // Get all articles for this niche
  const [rows] = await require('../config/db').query('SELECT * FROM articles WHERE niche_id = ? ORDER BY created_at DESC', [niche.id]);
  // Attach categories to each article
  for (const article of rows) {
    article.categories = await articleModel.getCategoriesForArticle(article.id);
  }
  // Pass activeNiche for nav highlight
  res.render('articles/niche', { niche, articles: rows, activeNiche: niche.slug });
});

router.get('/', async (req, res) => {
  const categories = await categoryModel.getAllWithArticles();
  res.render('index', { categories, isHome: true });
});


// List all categories
router.get('/categories', async (req, res) => {
  const categories = await categoryModel.getAllWithArticles();
  res.render('categories', { categories });
});


// Catch-all route for clean niche URLs like /nomad-travel-visas
router.get('/:slug', async (req, res, next) => {
  // Try to find a niche with this slug
  const niche = await nicheModel.getBySlug(req.params.slug);
  if (niche) {
    // Get all articles for this niche
    const [rows] = await require('../config/db').query('SELECT * FROM articles WHERE niche_id = ? ORDER BY created_at DESC', [niche.id]);
    // Attach categories to each article
    for (const article of rows) {
      article.categories = await articleModel.getCategoriesForArticle(article.id);
    }
    // Pass activeNiche for nav highlight
    return res.render('articles/category', { niche, articles: rows, activeNiche: niche.slug });
  }
  // If not a niche, pass to next route (could be 404 or other handler)
  return next();
});

// Legal pages
router.get('/legal/:page', (req, res) => {
  const legalPages = ['privacy', 'terms', 'cookie', 'gdpr', 'disclaimer'];
  const page = req.params.page;
  if (!legalPages.includes(page)) {
    return res.status(404).render('404');
  }
  res.render(`legal/${page}`);
});

// Company pages
router.get('/company/about', (req, res) => {
  res.render('company/about');
});
router.get('/company/story', (req, res) => {
  res.render('company/story');
});
router.get('/company/team', (req, res) => {
  res.render('company/team');
});
router.get('/company/careers', (req, res) => {
  res.render('company/careers');
});
router.get('/company/contact', (req, res) => {
  res.render('company/contact');
});

// Affiliate marketing page
router.get('/affiliate', (req, res) => {
  res.render('affiliate');
});

module.exports = router;
