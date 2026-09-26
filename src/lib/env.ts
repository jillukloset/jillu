const REQUIRED_PRODUCTION_ENV = [
  'DATABASE_URL',
  'AUTH_SECRET',
  'AUTH_URL',
  'APP_URL',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_SECURE',
  'SMTP_USER',
  'SMTP_PASS',
  'SMTP_FROM',
  'S3_ENDPOINT',
  'S3_REGION',
  'S3_ACCESS_KEY_ID',
  'S3_SECRET_ACCESS_KEY',
  'S3_BUCKET',
  'S3_FORCE_PATH_STYLE',
  'S3_PUBLIC_URL',
] as const;

export function isProduction() {
  return process.env.NODE_ENV === 'production';
}

export function readEnv(name: string) {
  const value = process.env[name];
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function validateHttpsUrl(name: string) {
  const value = readEnv(name);
  if (!value) return;

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`${name} is not a valid URL.`);
  }
  if (url.protocol !== 'https:') {
    throw new Error(`${name} must use https:// in production.`);
  }
}

function hostWithoutWww(name: string) {
  return new URL(readEnv(name)!).hostname.replace(/^www\./, '');
}

export function validateProductionEnv() {
  if (!isProduction()) return;

  for (const key of REQUIRED_PRODUCTION_ENV) {
    if (!readEnv(key)) {
      throw new Error(`Missing required production environment variable: ${key}`);
    }
  }

  validateHttpsUrl('AUTH_URL');
  validateHttpsUrl('APP_URL');
  validateHttpsUrl('S3_ENDPOINT');
  validateHttpsUrl('S3_PUBLIC_URL');

  if (hostWithoutWww('S3_PUBLIC_URL') === hostWithoutWww('APP_URL')) {
    throw new Error('S3_PUBLIC_URL must point at the object-storage public host, not the application domain.');
  }

  if (readEnv('S3_FORCE_PATH_STYLE') !== 'true' && readEnv('S3_FORCE_PATH_STYLE') !== 'false') {
    throw new Error('S3_FORCE_PATH_STYLE must be set to "true" or "false" in production.');
  }

  const port = Number(readEnv('SMTP_PORT'));
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('SMTP_PORT must be a valid TCP port in production.');
  }

  if (readEnv('SMTP_SECURE') !== 'true' && readEnv('SMTP_SECURE') !== 'false') {
    throw new Error('SMTP_SECURE must be set to "true" or "false" in production.');
  }
}

export function getAppUrl() {
  const configured = readEnv('APP_URL');
  if (configured) return configured.replace(/\/$/, '');
  if (isProduction()) {
    throw new Error('Missing required production environment variable: APP_URL');
  }
  return 'http://localhost:3000';
}

export function getAuthUrl() {
  const configured = readEnv('AUTH_URL');
  if (configured) return configured.replace(/\/$/, '');
  if (isProduction()) {
    throw new Error('Missing required production environment variable: AUTH_URL');
  }
  return getAppUrl();
}
