const userModel = require('../models/user');
const bcrypt = require('bcrypt');

async function loginPage(req, res) {
  // If already logged in as admin, redirect to dashboard
  if (req.session.user && req.session.user.isAdmin) {
    return res.redirect('/admin/dashboard');
  }
  res.render('admin/login', { error: null });
}

async function loginHandler(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.render('admin/login', { error: 'Email and password required.' });
  }
  try {
    const user = await userModel.getByEmail(email);
    if (!user) {
      return res.render('admin/login', { error: 'Invalid email.' });
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.render('admin/login', { error: 'Invalid password.' });
    }
    req.session.user = {
      id: user.id,
      email: user.email,
      isAdmin: true // Only admin users in this app
    };
    // Set autologout: expire session after 20 minutes of inactivity
    req.session.cookie.maxAge = 20 * 60 * 1000; // 20 minutes
    res.redirect('/admin/dashboard');
  } catch (err) {
    console.error(err);
    res.status(500).render('error', { message: 'Server error' });
  }
}

function logoutHandler(req, res) {
  req.session.destroy((err) => {
    res.clearCookie('connect.sid');
    res.redirect('/admin/login');
  });
}

// Admin: List all users
async function listUsers(req, res) {
  try {
    const users = await userModel.getAll();
    res.render('admin/users', { users, admin: req.session.user });
  } catch (err) {
    res.status(500).render('error', { message: 'Failed to load users.' });
  }
}

// Admin: Edit user (GET)
async function editUserForm(req, res) {
  try {
    const user = await userModel.getById(req.params.id);
    if (!user) return res.status(404).render('error', { message: 'User not found.' });
    res.render('admin/edit_user', { user, admin: req.session.user });
  } catch (err) {
    res.status(500).render('error', { message: 'Failed to load user.' });
  }
}

// Admin: Edit user (POST)
async function updateUser(req, res) {
  try {
      await userModel.update(req.params.id, {
        email: req.body.email,
        name: req.body.name,
        avatar: req.body.avatar,
        title: req.body.title,
        isAdmin: req.body.isAdmin === 'on'
      });
      res.redirect('/admin/users');
  } catch (err) {
      console.error('User update error:', err);
      res.status(500).render('error', { message: 'Failed to update user.', error: err.message });
  }
}

// Admin: Delete user
async function deleteUser(req, res) {
  try {
    await userModel.delete(req.params.id);
    res.redirect('/admin/users');
  } catch (err) {
    res.status(500).render('error', { message: 'Failed to delete user.' });
  }
}

module.exports = {
  loginPage,
  loginHandler,
  logoutHandler,
  listUsers,
  editUserForm,
  updateUser,
  deleteUser,
};
