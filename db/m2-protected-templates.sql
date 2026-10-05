-- M2: replace unprotected embeddings with cancelable (IronMask) templates.
--
-- Run ONCE against any database created before M2, BEFORE `npx drizzle-kit push`:
--   docker exec -i face-db sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"' < db/m2-protected-templates.sql
-- Fresh databases don't need it: `drizzle-kit push` creates the new schema directly.
--
-- Raw embeddings cannot be converted: a protected template is built from 5 enrolment photos,
-- and a single stored embedding fails the M2 accuracy bar. So the old templates are deleted
-- and their subjects kept; verifying such a subject returns 409 "must re-enroll with 5 photos".
-- Consent records are kept as the audit trail of the original enrolment.
--
-- Face-login demo accounts (no password) are deleted, cascading to their keys, subjects,
-- consents and usage: they can't re-enroll (register refuses an existing email and there is
-- no other authenticated path), so they would be locked out for good. They are demo accounts.
--
-- Guarded: does nothing once the old `embedding` column is gone, so a second run can never
-- delete protected templates.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'biometrics' AND column_name = 'embedding'
  ) THEN
    DELETE FROM biometrics;
    DELETE FROM users WHERE password IS NULL;
    ALTER TABLE biometrics DROP COLUMN embedding;
    ALTER TABLE biometrics ADD COLUMN digest bytea NOT NULL, ADD COLUMN helper bytea NOT NULL;
    RAISE NOTICE 'M2: unprotected templates and face-login demo accounts removed; affected subjects must re-enroll.';
  ELSE
    RAISE NOTICE 'M2: already migrated, nothing to do.';
  END IF;
END $$;
