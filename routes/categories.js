const express = require('express');
const router = express.Router();
const categoryModel = require('../models/category');
const articleModel = require('../models/article');

// List all categories
router.get('/', async (req, res) => {
  const categories = await categoryModel.getAllWithArticles();
  res.render('categories', { categories });
});

// List articles by category
router.get('/:slug', async (req, res) => {
  const category = await categoryModel.getBySlug(req.params.slug);
  if (!category) return res.status(404).render('404');
  const articles = await articleModel.getByCategorySlug(req.params.slug);
  // Pass activeNiche for nav highlight
  res.render('articles/category', { category, articles, activeNiche: category.slug });
});

module.exports = router;
