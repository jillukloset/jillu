import nodemailer from 'nodemailer';
import { validateProductionEnv } from '@/lib/env';

validateProductionEnv();

const transport = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT ?? 1025),
  secure: process.env.SMTP_SECURE === 'true',
  auth: process.env.SMTP_USER
    ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    : undefined,
});

export async function sendMail(opts: { to: string; subject: string; html: string; text: string }) {
  if (process.env.NODE_ENV === 'test') {
    return;
  }

  await transport.sendMail({
    from: process.env.SMTP_FROM ?? 'Jillu Kloset <noreply@jillukloset.com>',
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
    text: opts.text,
  });
}

export function verificationEmail(link: string) {
  return {
    subject: 'Verify your Jillu Kloset account',
    text: `Welcome to Jillu Kloset. Verify your email: ${link}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
        <h1 style="font-size:20px;letter-spacing:0.02em">PRE-LOVED. RE-LOVED.</h1>
        <p>Welcome to Jillu Kloset. Confirm your email to start discovering and selling.</p>
        <p><a href="${link}" style="display:inline-block;background:#171310;color:#fff;padding:12px 20px;text-decoration:none;border-radius:4px">Verify email</a></p>
        <p style="color:#666;font-size:13px">If the button doesn't work, paste this link into your browser: ${link}</p>
      </div>
    `,
  };
}

export function passwordResetEmail(link: string) {
  return {
    subject: 'Reset your Jillu Kloset password',
    text: `Reset your password: ${link}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
        <h1 style="font-size:20px;letter-spacing:0.02em">Reset your password</h1>
        <p>We received a request to reset your Jillu Kloset password.</p>
        <p><a href="${link}" style="display:inline-block;background:#171310;color:#fff;padding:12px 20px;text-decoration:none;border-radius:4px">Reset password</a></p>
        <p style="color:#666;font-size:13px">If you didn't request this, you can ignore this email. This link expires in 1 hour.</p>
      </div>
    `,
  };
}
