const express = require('express');
const path = require('path');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const dbConfig = require('./config/db');
const bodyParser = require('body-parser');
require('dotenv').config();
const sanitizeHtml = require('sanitize-html');
const logger = require('./utils/logger');

const methodOverride = require('method-override');
const multer = require('multer');

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'public/uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname.replace(/\s+/g, '_'));
  }
});
const upload = multer({ storage });
const app = express();
app.locals.upload = upload;

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public'), {
  setHeaders: (res, filePath) => {
    if (filePath.match(/\.(jpg|jpeg|png|gif|webp|svg|css|js)$/i)) {
      res.setHeader('Cache-Control', 'public, max-age=604800, immutable'); // 7 days
    }
  }
}));
app.set('view engine', 'ejs');
app.use(methodOverride('_method'));

const flash = require('connect-flash');
app.use(flash());

// Trust proxy for secure cookies if behind a proxy (e.g., nginx, Heroku)
app.set('trust proxy', 1);
// Set secure cookies if HTTPS is enabled in production
const isProduction = process.env.NODE_ENV === 'production';
let sessionStore;
if (isProduction) {
  // Use MySQL session store in production
  sessionStore = new MySQLStore({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'nomadprohub',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306
  });
}
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'supersecret',
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: isProduction // true if HTTPS, false otherwise
    }
  })
);

// Attach user to res.locals for all views
const { attachUser } = require('./middleware/authMiddleware');
app.use(attachUser);

// Routers
const indexRouter = require('./routes/index');
const articleRouter = require('./routes/articles');
const adminRouter = require('./routes/admin');
const authRouter = require('./routes/auth');

const categoriesRouter = require('./routes/categories');
const jobRouter = require('./routes/job');

// Middleware to sanitize markdown output (assumes article.rendered is used in EJS)
app.use((req, res, next) => {
  res.locals.sanitize = (html) => sanitizeHtml(html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'h1', 'h2', 'u']),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      img: ['src', 'alt', 'title', 'loading']
    }
  });
  next();
});



app.use('/', indexRouter);
app.use('/articles', articleRouter);
app.use('/categories', categoriesRouter); // <-- Register categories router

app.use('/admin', authRouter); // /admin/login, /admin/logout
app.use('/admin', adminRouter); // dashboard, reset, etc.
app.use('/job', jobRouter); // Sponsored Job Board (Beta)


// 404 handler
app.use((req, res, next) => {
  res.status(404).render('404');
});

// Error handler
app.use((err, req, res, next) => {
  // Use Winston for error logging in production, console in development
  if (isProduction) {
    logger.error(err);
  } else {
    console.error(err.stack);
  }
  res.status(500).render('error', { message: err.message });
});

// Export app and startServer for testing, only start server if run directly
const PORT = process.env.PORT || 3000;
function startServer(port = PORT) {
  return app.listen(port, '0.0.0.0', () => console.log(`✅ Server running on http://localhost:${port}`));
}
if (require.main === module) {
  startServer();
}
module.exports = { app, startServer };
