-- ============================================================
-- Franchisia — PostgreSQL Schema (Neon)
-- ============================================================
-- Run this in the Neon SQL editor or via psql.
-- All tables use UUIDs, timestamps, and reference constraints.
-- ============================================================

-- -------------------------------
-- Extensions
-- -------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -------------------------------
-- ENUMS
-- -------------------------------
CREATE TYPE user_role AS ENUM ('admin', 'franchisor', 'franchisee', 'consultor', 'investor', 'supplier');
CREATE TYPE listing_status AS ENUM ('active', 'pending', 'suspended', 'inactive');
CREATE TYPE application_status AS ENUM ('submitted', 'reviewing', 'accepted', 'rejected', 'withdrawn');
CREATE TYPE message_type AS ENUM ('text', 'image', 'file', 'system');
CREATE TYPE notification_type AS ENUM (
  'new_lead', 'application_received', 'application_status_changed',
  'meeting_reminder', 'new_message', 'new_review', 'connection_request',
  'system_alert'
);

-- ============================================================
-- 1.  USERS
-- ============================================================
CREATE TABLE users (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email           TEXT NOT NULL UNIQUE,
  email_verified  TIMESTAMPTZ,
  password_hash   TEXT NOT NULL,
  role            user_role NOT NULL DEFAULT 'franchisee',

  -- Profile
  full_name       TEXT NOT NULL,
  avatar_url      TEXT,
  headline        TEXT,                          -- e.g. "Franchise Investor | ex-McDonald's"
  bio             TEXT,
  phone           TEXT,
  location        TEXT,

  -- Franchise-specific
  investment_capacity NUMERIC(12,2),            -- max investment $
  industries          TEXT[],                    -- array of industry names
  experience_years    INT,
  website             TEXT,
  linkedin_url        TEXT,

  -- Meta
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  last_login_at   TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users (email);
CREATE INDEX idx_users_role ON users (role);

-- -------------------------------
-- 1a.  USER SKILLS & INTERESTS
-- -------------------------------
CREATE TABLE user_skills (
  id        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  skill     TEXT NOT NULL,
  UNIQUE(user_id, skill)
);

CREATE TABLE user_interests (
  id        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  interest  TEXT NOT NULL,                       -- industry name
  UNIQUE(user_id, interest)
);

-- -------------------------------
-- 1b.  USER EDUCATION
-- -------------------------------
CREATE TABLE user_education (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  school      TEXT NOT NULL,
  degree      TEXT,
  field       TEXT,
  start_year  INT,
  end_year    INT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -------------------------------
-- 1c.  USER EXPERIENCE
-- -------------------------------
CREATE TABLE user_experience (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company     TEXT NOT NULL,
  role        TEXT NOT NULL,
  description TEXT,
  start_date  DATE NOT NULL,
  end_date    DATE,
  is_current  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 2.  COMPANIES  (franchisor brands)
-- ============================================================
CREATE TABLE companies (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id        UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,

  -- Brand info
  name            TEXT NOT NULL,
  slug            TEXT NOT NULL UNIQUE,
  logo_url        TEXT,
  banner_url      TEXT,
  industry        TEXT NOT NULL,
  description     TEXT,
  website         TEXT,
  founded_year    INT,
  employee_count  TEXT,                          -- "10-50", "50-200", etc.

  -- Contact (editable by admin / owner)
  email           TEXT,
  phone           TEXT,
  address         TEXT,
  city            TEXT,
  country         TEXT,

  -- Verification
  is_verified     BOOLEAN NOT NULL DEFAULT FALSE,
  status          listing_status NOT NULL DEFAULT 'pending',

  -- Stats (denormalised for performance)
  follower_count  INT NOT NULL DEFAULT 0,
  listing_count   INT NOT NULL DEFAULT 0,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_companies_slug ON companies (slug);
CREATE INDEX idx_companies_industry ON companies (industry);
CREATE INDEX idx_companies_status ON companies (status);

-- ============================================================
-- 3.  FRANCHISE LISTINGS  (opportunities)
-- ============================================================
CREATE TABLE franchise_listings (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id        UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  created_by        UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,

  -- Listing details
  title             TEXT NOT NULL,
  slug              TEXT NOT NULL UNIQUE,
  description       TEXT,
  industry          TEXT NOT NULL,
  business_type     TEXT,                        -- single_unit / multi_unit / master / area_development

  -- Financial
  investment_min    NUMERIC(12,2),
  investment_max    NUMERIC(12,2),
  roi_percentage    NUMERIC(5,2),
  franchise_fee     NUMERIC(12,2),
  royalty_fee       TEXT,                        -- "6%", "5-8%", etc.
  break_even_months INT,

  -- Location
  location          TEXT,
  city              TEXT,
  country           TEXT,
  is_remote         BOOLEAN NOT NULL DEFAULT FALSE,

  -- Media
  images            TEXT[],                      -- array of URLs
  video_url         TEXT,

  -- Status
  status            listing_status NOT NULL DEFAULT 'pending',
  is_featured       BOOLEAN NOT NULL DEFAULT FALSE,

  -- Stats
  view_count        INT NOT NULL DEFAULT 0,
  application_count INT NOT NULL DEFAULT 0,

  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  published_at      TIMESTAMPTZ
);

CREATE INDEX idx_listings_company ON franchise_listings (company_id);
CREATE INDEX idx_listings_industry ON franchise_listings (industry);
CREATE INDEX idx_listings_status ON franchise_listings (status);
CREATE INDEX idx_listings_investment ON franchise_listings (investment_min, investment_max);

-- ============================================================
-- 4.  APPLICATIONS  (user → listing)
-- ============================================================
CREATE TABLE applications (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id      UUID NOT NULL REFERENCES franchise_listings(id) ON DELETE CASCADE,
  applicant_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status          application_status NOT NULL DEFAULT 'submitted',

  -- Applicant message
  cover_message   TEXT,
  investment_capacity NUMERIC(12,2),

  -- Admin / franchisor notes
  internal_notes  TEXT,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(listing_id, applicant_id)
);

CREATE INDEX idx_applications_listing ON applications (listing_id);
CREATE INDEX idx_applications_applicant ON applications (applicant_id);

-- ============================================================
-- 5.  CONNECTIONS  (follow / network)
-- ============================================================
CREATE TABLE connections (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  following_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
);

CREATE INDEX idx_connections_follower ON connections (follower_id);
CREATE INDEX idx_connections_following ON connections (following_id);

-- Company follows (users following companies)
CREATE TABLE company_followers (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_id  UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, company_id)
);

CREATE INDEX idx_cf_company ON company_followers (company_id);

-- ============================================================
-- 6.  MESSAGES
-- ============================================================
CREATE TABLE conversations (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subject         TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE conversation_participants (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id   UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  last_read_at      TIMESTAMPTZ,
  UNIQUE(conversation_id, user_id)
);

CREATE TABLE messages (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id   UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content           TEXT NOT NULL,
  message_type      message_type NOT NULL DEFAULT 'text',
  attachment_url    TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation ON messages (conversation_id, created_at);

-- ============================================================
-- 7.  NOTIFICATIONS
-- ============================================================
CREATE TABLE notifications (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type            notification_type NOT NULL,
  title           TEXT NOT NULL,
  body            TEXT,
  data            JSONB,                        -- flexible payload (listing_id, user_id, etc.)
  is_read         BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications (user_id, is_read, created_at DESC);

-- ============================================================
-- 8.  REVIEWS  (user → company or listing)
-- ============================================================
CREATE TABLE reviews (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reviewer_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_id    UUID REFERENCES companies(id) ON DELETE CASCADE,
  listing_id    UUID REFERENCES franchise_listings(id) ON DELETE CASCADE,
  rating        INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title         TEXT,
  content       TEXT,
  is_verified   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT at_least_one_target CHECK (
    company_id IS NOT NULL OR listing_id IS NOT NULL
  )
);

CREATE INDEX idx_reviews_company ON reviews (company_id);
CREATE INDEX idx_reviews_listing ON reviews (listing_id);

-- ============================================================
-- 9.  MEETINGS / EVENTS
-- ============================================================
CREATE TABLE meetings (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organizer_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  description   TEXT,
  meeting_url   TEXT,                            -- video call link
  start_time    TIMESTAMPTZ NOT NULL,
  end_time      TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE meeting_participants (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meeting_id  UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status      TEXT NOT NULL DEFAULT 'pending',   -- pending / accepted / declined
  UNIQUE(meeting_id, user_id)
);

-- ============================================================
-- 10.  ADMIN — SITE SETTINGS  (editable content)
-- ============================================================
CREATE TABLE site_stats (
  id    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  value TEXT NOT NULL,
  label TEXT NOT NULL,
  sort  INT NOT NULL DEFAULT 0
);

CREATE TABLE site_contact (
  id      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email   TEXT NOT NULL,
  phone   TEXT NOT NULL,
  address TEXT NOT NULL
);

CREATE TABLE about_page (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section     TEXT NOT NULL UNIQUE,              -- 'hero_title', 'hero_desc', 'mission', 'vision'
  content     TEXT NOT NULL
);

CREATE TABLE about_team (
  id      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name    TEXT NOT NULL,
  role    TEXT NOT NULL,
  bio     TEXT,
  sort    INT NOT NULL DEFAULT 0
);

CREATE TABLE about_timeline (
  id      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  year    TEXT NOT NULL,
  title   TEXT NOT NULL,
  desc    TEXT,
  sort    INT NOT NULL DEFAULT 0
);

-- Seed default values
INSERT INTO site_contact (email, phone, address)
VALUES ('hello@franchisia.com', '+1 (555) 123-4567', 'San Francisco, CA');

INSERT INTO site_stats (value, label, sort) VALUES
  ('10,000+', 'Active Franchise Listings', 1),
  ('50,000+', 'Registered Professionals', 2),
  ('2,500+',  'Verified Franchisors',     3),
  ('15,000+', 'Successful Matches',        4),
  ('$2.5B+',  'Total Investment Facilitated', 5),
  ('98%',     'Satisfaction Rate',         6);

INSERT INTO about_page (section, content) VALUES
  ('hero_title', 'Building the Future of Franchise Networking'),
  ('hero_desc',  'Franchisia is the leading professional network connecting franchisors, franchisees, consultors, investors, and suppliers worldwide.'),
  ('mission',    'To democratize access to franchise opportunities and create a transparent, efficient ecosystem where every professional can find the perfect match.'),
  ('vision',     'A world where franchise opportunities are accessible to everyone, empowering entrepreneurs to build successful businesses through meaningful connections.');

INSERT INTO about_team (name, role, bio, sort) VALUES
  ('Alexandra Reed',  'CEO & Founder',        'Former franchisor with 15+ years of experience in the franchise industry.', 1),
  ('Marcus Chen',     'CTO',                  'Tech leader who built scalable platforms for Fortune 500 companies.', 2),
  ('Sophia Patel',    'COO',                  'Operations expert with a background in franchise development.', 3),
  ('James Mitchell',  'VP of Sales',          'Helped over 200 franchise brands expand their networks.', 4),
  ('Olivia Torres',   'Head of Marketing',    'Digital marketing strategist specializing in franchise growth.', 5),
  ('Ryan Kim',        'Head of Product',      'Product leader passionate about building intuitive user experiences.', 6);

INSERT INTO about_timeline (year, title, desc, sort) VALUES
  ('2019', 'The Idea',         'Founded with a vision to transform the franchise industry.', 1),
  ('2020', 'Platform Launch',  'Launched the first version of Franchisia with 500 listings.', 2),
  ('2021', '10K Users',        'Reached 10,000 registered professionals on the platform.', 3),
  ('2022', 'Global Expansion', 'Expanded operations to 20 countries worldwide.', 4),
  ('2023', 'AI Features',      'Introduced AI-powered matching and investment calculators.', 5),
  ('2024', 'Industry Leader',  'Recognized as the #1 franchise networking platform.', 6);

-- ============================================================
-- 11.  AUDIT LOG (simple tracking)
-- ============================================================
CREATE TABLE audit_log (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES users(id) ON DELETE SET NULL,
  action      TEXT NOT NULL,
  table_name  TEXT,
  record_id   UUID,
  old_data    JSONB,
  new_data    JSONB,
  ip_address  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_user ON audit_log (user_id);
CREATE INDEX idx_audit_created ON audit_log (created_at DESC);

-- ============================================================
-- 12.  SESSIONS  (optional if not using JWT)
-- ============================================================
CREATE TABLE sessions (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token         TEXT NOT NULL UNIQUE,
  expires_at    TIMESTAMPTZ NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sessions_token ON sessions (token);
CREATE INDEX idx_sessions_user ON sessions (user_id);

-- ============================================================
-- TRIGGER: auto-update updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_users
  BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_companies
  BEFORE UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_franchise_listings
  BEFORE UPDATE ON franchise_listings FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_applications
  BEFORE UPDATE ON applications FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- ============================================================
-- HELPERS
-- ============================================================

-- Create a verified admin user (password: "admin123" — change in production)
-- Hash: SELECT crypt('admin123', gen_salt('bf'));
INSERT INTO users (email, password_hash, full_name, role, email_verified)
VALUES (
  'admin@franchisia.com',
  crypt('admin123', gen_salt('bf')),
  'Admin User',
  'admin',
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- ============================================================
-- Done.  Next:  connect from Node.js via `neon` or `pg`.
-- ============================================================
