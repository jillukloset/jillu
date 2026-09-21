import { CredentialsSignin } from 'next-auth';

export class InvalidCredentialsError extends CredentialsSignin {
  code = 'CredentialsSignin';
}

export class EmailNotVerifiedError extends CredentialsSignin {
  code = 'EmailNotVerified';
}

export class AccountSuspendedError extends CredentialsSignin {
  code = 'AccountSuspended';
}

export class RateLimitedError extends CredentialsSignin {
  code = 'RateLimited';
}
