import '@testing-library/jest-dom/vitest';

if (!process.env.DATABASE_URL) {
  try {
    process.loadEnvFile('.env');
  } catch {
    // .env not found — assume env vars are already provided (CI)
  }
}
