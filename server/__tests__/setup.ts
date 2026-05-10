// Test-time fallback so server/db.ts loads cleanly. Real DB is never queried
// in unit tests; integration tests should override DATABASE_URL.
process.env.DATABASE_URL ||= "postgresql://fake:fake@localhost:5432/fake";
