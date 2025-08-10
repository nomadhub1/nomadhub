
-- NomadProHub 2.1 Consolidated Production Schema
CREATE DATABASE IF NOT EXISTS nomadprohub CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE nomadprohub;

-- Categories (flexible, user-defined)
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE
);

-- Niches (fixed, 6 only)
CREATE TABLE IF NOT EXISTS niches (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE
);

-- Articles (each article belongs to one niche, and many categories)
CREATE TABLE IF NOT EXISTS articles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  markdown TEXT NOT NULL,
  image VARCHAR(512),
  niche_id INT NOT NULL,
  author VARCHAR(128),
  author_title VARCHAR(128),
  author_avatar VARCHAR(512),
  article_date DATE,
  views INT DEFAULT 0,
  opengraph_image VARCHAR(512),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (niche_id) REFERENCES niches(id) ON DELETE RESTRICT
);

-- Many-to-many: Article Categories
CREATE TABLE IF NOT EXISTS article_categories (
  article_id INT NOT NULL,
  category_id INT NOT NULL,
  PRIMARY KEY (article_id, category_id),
  FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- Users (admin only for now)
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(128),
  avatar VARCHAR(512),
  title VARCHAR(128),
  isAdmin BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Jobs (sponsored jobs board)
CREATE TABLE IF NOT EXISTS jobs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  company VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  location VARCHAR(128),
  job_url VARCHAR(512),
  posted_by INT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (posted_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Default niches (fixed, 6 only)
INSERT INTO niches (name, slug) VALUES
('Remote Work Tools & Productivity', 'remote-work-tools'),
('AI & Automation for Freelancers', 'ai-for-freelancers'),
('Digital Nomad Travel & Visas', 'nomad-travel-visas'),
('Side Hustles & Passive Income', 'side-hustles'),
('Freelancing & Digital Skill Growth', 'freelance-skills'),
('How-To Guides for Solopreneurs', 'how-to-guides');

-- Default categories (can be edited/added by admin)
INSERT INTO categories (name, slug) VALUES
('Remote Work Tools & Productivity', 'remote-work-tools'),
('AI & Automation for Freelancers', 'ai-for-freelancers'),
('Digital Nomad Travel & Visas', 'nomad-travel-visas'),
('Side Hustles & Passive Income', 'side-hustles'),
('Freelancing & Digital Skill Growth', 'freelance-skills'),
('How-To Guides for Solopreneurs', 'how-to-guides');

-- Default admin user
INSERT INTO users (email, password, isAdmin) VALUES
('admin@hub.com', '$2b$10$F6I8F7v1EyxQO.g0vLJu1u2YhQJ0f4XlEeXzhZPbyQpLPv0IXwxCm', TRUE);

-- Sample articles
INSERT INTO articles (
  title, slug, description, markdown, image, niche_id, author, author_title, author_avatar, article_date, views, opengraph_image, created_at
) VALUES
('Essential Remote Work Stack for 2025', 'essential-remote-work-stack-2025', 'Discover the productivity apps, communication tools, and workspace essentials that top remote professionals use to stay productive and connected.', '# Essential Remote Work Stack\n\nBest tools for 2025...', 'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg', 1, 'Sarah Chen', 'Remote Work Expert', 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg', '2025-07-23', 120, 'https://og-image-service.example.com/remote-work-stack.png', NOW()),
('50+ ChatGPT Prompts for Freelancers', '50-chatgpt-prompts-for-freelancers', 'Transform your workflow with proven prompts for content creation, client communication, and project management.', '# ChatGPT Prompts\n\n- Prompt 1\n- Prompt 2...', 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg', 2, 'Marcus Rodriguez', 'AI Consultant', 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg', '2025-07-23', 95, 'https://og-image-service.example.com/chatgpt-prompts.png', NOW()),
('Complete Digital Nomad Visa Guide 2025', 'complete-digital-nomad-visa-guide-2025', 'Every country offering nomad visas, requirements, costs, and application processes explained in detail.', '# Visa Guide\n\nAll you need to know...', 'https://images.pexels.com/photos/1008155/pexels-photo-1008155.jpeg', 3, 'Elena Vasquez', 'Travel Expert', 'https://images.pexels.com/photos/1239288/pexels-photo-1239288.jpeg', '2025-07-23', 80, 'https://og-image-service.example.com/visa-guide.png', NOW());

-- Sample article-category relationships
INSERT INTO article_categories (article_id, category_id) VALUES
(1, 1),
(2, 2),
(3, 3);
