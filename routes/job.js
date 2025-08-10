const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const { ensureAdmin } = require('../middleware/authMiddleware');

// User view
router.get('/', jobController.listJobs);

// Admin create

// Admin create
router.get('/new', ensureAdmin, jobController.showCreateForm);
router.post('/new', ensureAdmin, jobController.createJob);

// Admin update
router.get('/:id/edit', ensureAdmin, jobController.showEditForm);
router.post('/:id/edit', ensureAdmin, jobController.updateJob);

// Admin delete
router.post('/:id/delete', ensureAdmin, jobController.deleteJob);

module.exports = router;
