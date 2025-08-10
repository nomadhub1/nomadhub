const { prepareWeeklyDigest } = require('../utils/digestJob');
describe('Weekly Digest Job', () => {
  it('should prepare a digest with recent articles', async () => {
    const digest = await prepareWeeklyDigest();
    expect(digest).toHaveProperty('subject');
    expect(Array.isArray(digest.articles)).toBe(true);
    expect(digest.preview.length).toBeGreaterThanOrEqual(0);
  });
});
