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

function httpsUrlProblem(name: string) {
  const value = readEnv(name);
  if (!value) return undefined;

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return `${name} is not a valid URL.`;
  }
  return url.protocol === 'https:' ? undefined : `${name} must use https:// in production.`;
}

function hostWithoutWww(value: string) {
  return new URL(value).hostname.replace(/^www\./, '');
}

export function validateProductionEnv() {
  if (!isProduction()) return;

  const problems: string[] = [];

  const missing = REQUIRED_PRODUCTION_ENV.filter((key) => !readEnv(key));
  if (missing.length > 0) {
    problems.push(`Missing required production environment variables: ${missing.join(', ')}`);
  }

  for (const name of ['AUTH_URL', 'APP_URL', 'S3_ENDPOINT', 'S3_PUBLIC_URL']) {
    const problem = httpsUrlProblem(name);
    if (problem) problems.push(problem);
  }

  const publicUrl = readEnv('S3_PUBLIC_URL');
  const appUrl = readEnv('APP_URL');
  if (publicUrl && appUrl && !httpsUrlProblem('S3_PUBLIC_URL') && !httpsUrlProblem('APP_URL')) {
    if (hostWithoutWww(publicUrl) === hostWithoutWww(appUrl)) {
      problems.push('S3_PUBLIC_URL must point at the object-storage public host, not the application domain.');
    }
  }

  const forcePathStyle = readEnv('S3_FORCE_PATH_STYLE');
  if (forcePathStyle && forcePathStyle !== 'true' && forcePathStyle !== 'false') {
    problems.push('S3_FORCE_PATH_STYLE must be set to "true" or "false" in production.');
  }

  const smtpPort = readEnv('SMTP_PORT');
  if (smtpPort) {
    const port = Number(smtpPort);
    if (!Number.isInteger(port) || port < 1 || port > 65535) {
      problems.push('SMTP_PORT must be a valid TCP port in production.');
    }
  }

  const smtpSecure = readEnv('SMTP_SECURE');
  if (smtpSecure && smtpSecure !== 'true' && smtpSecure !== 'false') {
    problems.push('SMTP_SECURE must be set to "true" or "false" in production.');
  }

  if (problems.length > 0) {
    throw new Error(`Invalid production environment:\n - ${problems.join('\n - ')}`);
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
