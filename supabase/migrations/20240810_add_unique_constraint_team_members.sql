
-- Add unique constraint to team_members table by cabinet and email
-- This ensures that within a cabinet, email addresses must be unique
ALTER TABLE IF EXISTS public.team_members DROP CONSTRAINT IF EXISTS unique_contact_per_cabinet;
ALTER TABLE IF EXISTS public.team_members ADD CONSTRAINT unique_contact_per_cabinet 
  UNIQUE (cabinet_id, contact);

-- Add case-insensitive index for email lookups
CREATE INDEX IF NOT EXISTS idx_team_members_contact_lower ON public.team_members(LOWER(contact));
