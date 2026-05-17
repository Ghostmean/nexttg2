-- Create ENUM for member role
DO $$ BEGIN
  CREATE TYPE member_role AS ENUM ('monitor', 'student');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create groups table
CREATE TABLE IF NOT EXISTS groups_table (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  invite_code TEXT UNIQUE NOT NULL,
  created_by BIGINT NOT NULL REFERENCES profiles(telegram_id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create group members table
CREATE TABLE IF NOT EXISTS group_members (
  id BIGSERIAL PRIMARY KEY,
  group_id BIGINT NOT NULL REFERENCES groups_table(id) ON DELETE CASCADE,
  profile_id BIGINT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role member_role NOT NULL DEFAULT 'student',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(group_id, profile_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_profile_id ON group_members(profile_id);
CREATE INDEX IF NOT EXISTS idx_groups_invite_code ON groups_table(invite_code);
CREATE INDEX IF NOT EXISTS idx_groups_created_by ON groups_table(created_by);

-- Triggers for updated_at
DROP TRIGGER IF EXISTS set_groups_updated_at ON groups_table;
CREATE TRIGGER set_groups_updated_at
  BEFORE UPDATE ON groups_table
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE groups_table ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
