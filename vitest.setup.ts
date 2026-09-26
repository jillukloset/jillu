import '@testing-library/jest-dom/vitest';

if (!process.env.DATABASE_URL) {
  try {
    process.loadEnvFile('.env');
  } catch {
    // .env not found — assume env vars are already provided (CI)
  }
}

if (process.env.TEST_DATABASE_URL) {
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
}

// Tests create and delete real rows; never let them run against a shared/production database by accident.
const testDbHost = (() => {
  try {
    return new URL(process.env.DATABASE_URL ?? '').hostname;
  } catch {
    return '';
  }
})();
if (!['localhost', '127.0.0.1', '[::1]', '::1'].includes(testDbHost) && process.env.ALLOW_REMOTE_TEST_DB !== 'true') {
  throw new Error(
    'Refusing to run tests against a non-local database. Set TEST_DATABASE_URL to a local/disposable database ' +
      '(or ALLOW_REMOTE_TEST_DB=true if you are certain it is disposable).',
  );
}
