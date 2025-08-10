// Weekly Email Digest Job (placeholder)
// This function prepares a digest of recent articles for email delivery.
// TODO: Integrate with Mailchimp or email service

const articleModel = require('../models/article');

async function prepareWeeklyDigest() {
  // Get articles from the past 7 days
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const articles = await articleModel.getRecentSince(oneWeekAgo);
  // Format digest (stub)
  return {
    subject: 'NomadProHub Weekly Digest',
    articles,
    preview: articles.map(a => ({ title: a.title, link: `/articles/${a.slug}` }))
  };
}

module.exports = { prepareWeeklyDigest };
