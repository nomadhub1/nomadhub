
const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Fetch OpenGraph metadata for a given URL
 * Returns { image, title, description, url }
 */
async function fetchOpenGraph(url) {
  try {
    const { data } = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const $ = cheerio.load(data);
    const ogImage = $('meta[property="og:image"]').attr('content') || '';
    const ogTitle = $('meta[property="og:title"]').attr('content') || '';
    const ogDesc = $('meta[property="og:description"]').attr('content') || '';
    return {
      image: ogImage,
      title: ogTitle,
      description: ogDesc,
      url
    };
  } catch (err) {
    console.error('fetchOpenGraph error:', err);
    return {
      image: '',
      title: '',
      description: '',
      url
    };
  }
}

module.exports = { fetchOpenGraph };
