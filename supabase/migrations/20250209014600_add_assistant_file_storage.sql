-- Migration: Add assistant file storage fields
-- Created: 2026-02-09 01:46 UTC
-- Description: Add columns to store assistant-related markdown files and server assignment

-- Add file storage columns to assistants table
ALTER TABLE assistants
  ADD COLUMN IF NOT EXISTS soul_md TEXT,
  ADD COLUMN IF NOT EXISTS user_md TEXT,
  ADD COLUMN IF NOT EXISTS tools_md TEXT,
  ADD COLUMN IF NOT EXISTS server_host TEXT;

-- Add comment for documentation
COMMENT ON COLUMN assistants.soul_md IS 'Content of SOUL.md - assistant personality and behavior definition';
COMMENT ON COLUMN assistants.user_md IS 'Content of USER.md - user preferences and context for the assistant';
COMMENT ON COLUMN assistants.tools_md IS 'Content of TOOLS.md - tool definitions and usage instructions';
COMMENT ON COLUMN assistants.server_host IS 'Hostname or identifier of the server this assistant runs on (e.g., server-01, aws-east-1)';
