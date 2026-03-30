CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(80) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'owner' CHECK (role IN ('owner', 'caregiver')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS family_members (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  member_name VARCHAR(80) NOT NULL,
  age INTEGER,
  relation VARCHAR(40) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS medicines (
  id BIGSERIAL PRIMARY KEY,
  member_id BIGINT NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
  medicine_name VARCHAR(120) NOT NULL,
  dosage VARCHAR(60) NOT NULL,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  low_stock_threshold INTEGER NOT NULL DEFAULT 5,
  instructions VARCHAR(240),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS schedules (
  id BIGSERIAL PRIMARY KEY,
  medicine_id BIGINT NOT NULL REFERENCES medicines(id) ON DELETE CASCADE,
  time_slot VARCHAR(20) NOT NULL DEFAULT 'custom' CHECK (time_slot IN ('morning', 'afternoon', 'night', 'custom')),
  scheduled_time TIME NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  frequency VARCHAR(30) NOT NULL DEFAULT 'daily' CHECK (frequency IN ('daily', 'weekdays', 'alternate-days')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS dose_tracking (
  id BIGSERIAL PRIMARY KEY,
  schedule_id BIGINT NOT NULL REFERENCES schedules(id) ON DELETE CASCADE,
  dose_date DATE NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('taken', 'missed', 'skipped')),
  notes VARCHAR(240),
  taken_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (schedule_id, dose_date)
);

CREATE TABLE IF NOT EXISTS shared_access (
  id BIGSERIAL PRIMARY KEY,
  owner_user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  caregiver_email VARCHAR(160) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'revoked')),
  invite_token VARCHAR(64) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_family_members_user_id ON family_members(user_id);
CREATE INDEX IF NOT EXISTS idx_medicines_member_id ON medicines(member_id);
CREATE INDEX IF NOT EXISTS idx_schedules_medicine_id ON schedules(medicine_id);
CREATE INDEX IF NOT EXISTS idx_dose_tracking_schedule_date ON dose_tracking(schedule_id, dose_date);
CREATE INDEX IF NOT EXISTS idx_shared_access_owner_user_id ON shared_access(owner_user_id);
