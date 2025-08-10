const db = require('../config/db');

// List all jobs
exports.listJobs = async (req, res) => {
  try {
    const [jobs] = await db.query('SELECT * FROM jobs ORDER BY created_at DESC');
    const isAdmin = res.locals.user && res.locals.user.isAdmin;
    res.render('jobs/index', { jobs, isAdmin });
  } catch (err) {
    res.status(500).send('Error loading jobs');
  }
};

// Show job creation form
exports.showCreateForm = (req, res) => {
  res.render('jobs/new');
};

// Create a job
exports.createJob = async (req, res) => {
  const { title, company, description, location, job_url } = req.body;
  try {
    await db.query(
      'INSERT INTO jobs (title, company, description, location, job_url, posted_by) VALUES (?, ?, ?, ?, ?, ?)',
      [title, company, description, location, job_url, req.user ? req.user.id : null]
    );
    res.redirect('/job');
  } catch (err) {
    res.status(500).send('Error creating job');
  }
};

// Show job edit form
exports.showEditForm = async (req, res) => {
  try {
    const [jobs] = await db.query('SELECT * FROM jobs WHERE id = ?', [req.params.id]);
    if (!jobs.length) return res.status(404).send('Job not found');
    res.render('jobs/edit', { job: jobs[0] });
  } catch (err) {
    res.status(500).send('Error loading job');
  }
};

// Update a job
exports.updateJob = async (req, res) => {
  const { title, company, description, location, job_url } = req.body;
  try {
    await db.query(
      'UPDATE jobs SET title=?, company=?, description=?, location=?, job_url=? WHERE id=?',
      [title, company, description, location, job_url, req.params.id]
    );
    res.redirect('/job');
  } catch (err) {
    res.status(500).send('Error updating job');
  }
};

// Delete a job
exports.deleteJob = async (req, res) => {
  try {
    await db.query('DELETE FROM jobs WHERE id = ?', [req.params.id]);
    res.redirect('/job');
  } catch (err) {
    res.status(500).send('Error deleting job');
  }
};
