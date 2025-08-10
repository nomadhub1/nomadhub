# 🚀 NomadProHub

NomadProHub is a full-featured content platform for digital nomads, freelancers, and solopreneurs. Built with Node.js, Express, EJS, and MySQL, it provides a modern publishing experience, admin dashboard, and flexible content architecture.

## Features

- 6 fixed niches (Remote Work, AI, Travel, Side Hustles, Skills, How-Tos)
- Flexible, user-defined categories (many-to-many with articles)
- **Admin-only user model:** Only the site owner/admin can log in; all other visitors are public viewers
- Admin-only article creation, editing, and deletion
- Markdown content rendering with image and author support
- Category and niche-based navigation and clean URLs
- Session-based authentication and password reset
- Flash messages for user feedback
- Modern, Figma-inspired UI (responsive, card-based, consistent spacing between header/content/footer)
- Sponsored job board (beta)
- File uploads for article images and author avatars
- Secure session cookies and input sanitization
- Jest/Supertest backend testing
- **Legal compliance:** Privacy Policy, Terms of Service, Cookie Policy, GDPR, Disclaimer pages
- **Company info pages:** About Us, Our Story, Team, Careers, Contact

## Directory Structure

- `server.js` — Main Express server
- `config/` — Database config
- `controllers/` — Route logic
- `middleware/` — Auth and other middleware
- `models/` — Database models
- `routes/` — Express routers
- `views/` — EJS templates (articles, admin, jobs, categories, legal, company, partials)
- `public/` — Static assets (CSS, JS, uploads)
- `tests/` — Jest/Supertest test files
- `utils/` — Utility functions
- `schema.sql`, `schema.many-to-many.sql`, `schema.deploy.sql` — Database schemas

## Database Schema

- **Users:** Admins only, with email/password
- **Niches:** 6 fixed, each with name/slug
- **Categories:** Flexible, user-defined
- **Articles:** Belong to one niche, many categories, support Markdown, images, author info
- **article_categories:** Many-to-many join table for articles and categories

## Setup

1. Clone the repo:
   ```bash
   git clone https://github.com/yourname/nomadprohub.git
   cd nomadprohub
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure your `.env` file (see `config/db.js` for DB settings)
4. Import the schema (`schema.deploy.sql`) into your MySQL database
5. Start the server:
   ```bash
   npm start
   ```

## Usage

- Visit `/admin/login` to log in as admin (default user: `admin@hub.com`, password: `password123`)
- Create, edit, and delete articles and categories from the dashboard
- Browse articles by niche and category
- Use the job board for sponsored jobs
- View legal pages at `/legal/privacy`, `/legal/terms`, `/legal/cookie`, `/legal/gdpr`, `/legal/disclaimer`
- View company info pages at `/company/about`, `/company/story`, `/company/team`, `/company/careers`, `/company/contact`

## Testing

Run backend tests with:
```bash
npm test
```

## Architecture

- Node.js + Express backend
- EJS templating for views
- MySQL for data storage
- Multer for file uploads
- connect-flash for flash messages
- bcrypt for password hashing
- winston for logging

## Security

- Session-based authentication
- Input sanitization
- Secure cookies

## License

MIT
