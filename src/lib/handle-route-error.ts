import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { AppError, fail } from '@/lib/api-result';

export function handleRouteError(error: unknown) {
  if (error instanceof ZodError) {
    return NextResponse.json(
      fail('VALIDATION_ERROR', error.issues[0]?.message ?? 'Invalid input'),
      { status: 422 },
    );
  }
  if (error instanceof AppError) {
    return NextResponse.json(fail(error.code, error.message), { status: error.status });
  }
  console.error(error);
  return NextResponse.json(
    fail('INTERNAL_ERROR', 'Something went wrong. Please try again.'),
    { status: 500 },
  );
}
