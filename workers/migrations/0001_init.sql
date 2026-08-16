-- FlickBolt initial schema
-- D1 = SQLite. Use TEXT for ids (uuid v4) and INTEGER unix epoch for timestamps.
--
-- Every statement is IF NOT EXISTS. This schema was originally applied to the
-- production database out-of-band (not via `wrangler d1 migrations apply`), so
-- D1's migration ledger has no record of it while the tables plainly exist.
-- Without IF NOT EXISTS, every migration run retries 0001 and dies on
-- "table users already exists", blocking all future migrations. Keeping this
-- file idempotent lets D1 record 0001 as applied and move on to 0002+.
--
-- Write new migrations idempotently too — it costs nothing and makes a partial
-- or out-of-band apply recoverable instead of terminal.

CREATE TABLE IF NOT EXISTS users (
  id              TEXT PRIMARY KEY,
  email           TEXT NOT NULL UNIQUE,
  password_hash   TEXT NOT NULL,
  role            TEXT NOT NULL CHECK (role IN ('customer','capturer','both','admin')),
  display_name    TEXT NOT NULL,
  handle          TEXT NOT NULL UNIQUE,
  avatar_url      TEXT,
  stripe_customer_id TEXT,
  stripe_connect_id  TEXT,
  created_at      INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

CREATE TABLE IF NOT EXISTS capturer_profiles (
  user_id          TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  bio              TEXT,
  equipment        TEXT,
  service_radius_km INTEGER NOT NULL DEFAULT 10,
  base_lat         REAL,
  base_lng         REAL,
  hourly_rate_cents INTEGER NOT NULL DEFAULT 0,
  kyc_status       TEXT NOT NULL DEFAULT 'pending' CHECK (kyc_status IN ('pending','verified','rejected','suspended')),
  is_online        INTEGER NOT NULL DEFAULT 0,
  last_seen_at     INTEGER
);
CREATE INDEX IF NOT EXISTS idx_capturer_online ON capturer_profiles(is_online, last_seen_at);

CREATE TABLE IF NOT EXISTS requests (
  id              TEXT PRIMARY KEY,
  customer_id     TEXT NOT NULL REFERENCES users(id),
  lat             REAL NOT NULL,
  lng             REAL NOT NULL,
  address         TEXT,
  instructions    TEXT NOT NULL,
  max_price_cents INTEGER NOT NULL,
  duration_seconds INTEGER NOT NULL,
  deadline_at     INTEGER,
  status          TEXT NOT NULL DEFAULT 'open'
                  CHECK (status IN ('open','assigned','in_progress','delivered','completed','cancelled','disputed')),
  assigned_capturer_id TEXT REFERENCES users(id),
  stream_video_id TEXT,
  payment_intent_id TEXT,
  is_public       INTEGER NOT NULL DEFAULT 0,
  created_at      INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_requests_status ON requests(status);
CREATE INDEX IF NOT EXISTS idx_requests_customer ON requests(customer_id);
CREATE INDEX IF NOT EXISTS idx_requests_capturer ON requests(assigned_capturer_id);

CREATE TABLE IF NOT EXISTS bids (
  id            TEXT PRIMARY KEY,
  request_id    TEXT NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  capturer_id   TEXT NOT NULL REFERENCES users(id),
  price_cents   INTEGER NOT NULL,
  eta_minutes   INTEGER NOT NULL,
  created_at    INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_bids_request ON bids(request_id);

CREATE TABLE IF NOT EXISTS videos (
  id            TEXT PRIMARY KEY,
  request_id    TEXT REFERENCES requests(id),
  capturer_id   TEXT NOT NULL REFERENCES users(id),
  stream_uid    TEXT NOT NULL,
  duration_s    INTEGER,
  thumbnail_url TEXT,
  is_live       INTEGER NOT NULL DEFAULT 0,
  recorded_at   INTEGER,
  geo_lat       REAL,
  geo_lng       REAL,
  created_at    INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_videos_capturer ON videos(capturer_id);
CREATE INDEX IF NOT EXISTS idx_videos_live ON videos(is_live);

CREATE TABLE IF NOT EXISTS transactions (
  id                 TEXT PRIMARY KEY,
  user_id            TEXT NOT NULL REFERENCES users(id),
  type               TEXT NOT NULL CHECK (type IN ('charge','payout','tip','refund')),
  amount_cents       INTEGER NOT NULL,
  currency           TEXT NOT NULL DEFAULT 'usd',
  stripe_id          TEXT,
  related_request_id TEXT REFERENCES requests(id),
  created_at         INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_tx_user ON transactions(user_id);

CREATE TABLE IF NOT EXISTS tips (
  id          TEXT PRIMARY KEY,
  viewer_id   TEXT NOT NULL REFERENCES users(id),
  capturer_id TEXT NOT NULL REFERENCES users(id),
  video_id    TEXT NOT NULL REFERENCES videos(id),
  amount_cents INTEGER NOT NULL,
  message     TEXT,
  created_at  INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_tips_capturer ON tips(capturer_id);

CREATE TABLE IF NOT EXISTS subscriptions (
  id                  TEXT PRIMARY KEY,
  viewer_id           TEXT NOT NULL REFERENCES users(id),
  capturer_id         TEXT NOT NULL REFERENCES users(id),
  tier                TEXT NOT NULL,
  started_at          INTEGER NOT NULL,
  current_period_end  INTEGER,
  stripe_subscription_id TEXT
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_subs_unique ON subscriptions(viewer_id, capturer_id);

CREATE TABLE IF NOT EXISTS ratings (
  id          TEXT PRIMARY KEY,
  request_id  TEXT NOT NULL REFERENCES requests(id),
  rater_id    TEXT NOT NULL REFERENCES users(id),
  rated_id    TEXT NOT NULL REFERENCES users(id),
  stars       INTEGER NOT NULL CHECK (stars BETWEEN 1 AND 5),
  comment     TEXT,
  created_at  INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_ratings_rated ON ratings(rated_id);

CREATE TABLE IF NOT EXISTS reports (
  id          TEXT PRIMARY KEY,
  reporter_id TEXT NOT NULL REFERENCES users(id),
  target_type TEXT NOT NULL CHECK (target_type IN ('user','video','request','message')),
  target_id   TEXT NOT NULL,
  reason      TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','reviewing','resolved','dismissed')),
  created_at  INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
