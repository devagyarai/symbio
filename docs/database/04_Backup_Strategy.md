# Backup Strategy

For production, the database is hosted on a managed PostgreSQL provider (e.g. Supabase, Neon).

- Point-in-Time Recovery (PITR) is enabled up to 7 days.
- Nightly logical dumps are taken to cold storage.
