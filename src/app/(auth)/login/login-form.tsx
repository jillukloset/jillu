'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { signIn } from 'next-auth/react';
import {
  Crown,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Truck,
  ShieldCheck,
  Sparkles,
  Heart,
  ArrowDown,
} from 'lucide-react';
import { safeRedirectPath } from '@/lib/safe-redirect';

type FormValues = { email: string; password: string };

const ERROR_MESSAGES: Record<string, string> = {
  CredentialsSignin: 'Incorrect email or password.',
  EmailNotVerified: 'Please verify your email before logging in.',
  AccountSuspended: 'This account has been suspended.',
  RateLimited: 'Too many attempts. Please wait a few moments.',
};

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = safeRedirectPath(searchParams?.get('callbackUrl') ?? null);

  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>();

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    try {
      const result = await signIn('credentials', {
        email: values.email,
        password: values.password,
        redirect: false,
      });

      if (result?.error) {
        setServerError(ERROR_MESSAGES[result.error] ?? 'Incorrect email or password.');
        return;
      }
      router.push(callbackUrl);
      router.refresh();
    } catch {
      setServerError('An error occurred while signing in.');
    }
  });

  return (
    <div className="relative min-h-screen w-full bg-[#080807] text-[#F4EFE7] overflow-hidden flex flex-col justify-between font-sans selection:bg-[#C5A880] selection:text-[#080807]">
      {/* Background Editorial Image with Atmospheric Vignette Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/hero_male_model.jpg"
          alt="Jillu Editorial Male Model"
          className="w-full h-full object-cover object-[center_20%] opacity-45 scale-105"
        />
        {/* Multilayered radial and linear dark gradients */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#080807] via-[#080807]/75 to-[#080807]/90" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080807] via-transparent to-[#080807]/80" />
      </div>

      {/* 1. TOP BAR */}
      <header className="relative z-20 max-w-7xl w-full mx-auto px-6 sm:px-10 py-6 sm:py-8 flex items-center justify-between">
        {/* Brand Logo & Tagline */}
        <Link href="/" className="flex flex-col items-start group">
          <div className="flex items-center gap-1.5">
            <Crown className="w-4 h-4 text-brand-gold fill-brand-gold/20" />
            <span className="font-serif tracking-[0.2em] text-lg sm:text-xl font-bold text-brand-cream uppercase group-hover:text-brand-gold transition-colors">
              JILLU KLOSET
            </span>
          </div>
          <span className="text-[9px] tracking-[0.35em] text-brand-muted uppercase pl-5 -mt-0.5 font-mono">
            WEAR YOUR STORY
          </span>
        </Link>

        {/* Back to Home Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs sm:text-sm text-brand-muted hover:text-brand-cream transition-colors group"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
          <span>Back to Home</span>
        </Link>
      </header>

      {/* 2. MAIN CENTER HERO CONTENT & LOGIN CARD */}
      <main className="relative z-20 max-w-7xl w-full mx-auto px-6 sm:px-10 py-6 sm:py-10 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center flex-1">
        {/* Left Side: Editorial Typography */}
        <div className="lg:col-span-7 space-y-8">
          {/* Floating Handwritten Script */}
          <div className="space-y-1">
            <p className="font-script text-3xl sm:text-4xl lg:text-5xl text-brand-gold tracking-wide leading-none -rotate-6">
              Good Clothes
            </p>
            <p className="font-script text-3xl sm:text-4xl lg:text-5xl text-brand-gold tracking-wide leading-none pl-6 -rotate-6">
              Better Days
            </p>
          </div>

          {/* Bold Display Headline */}
          <div className="space-y-2">
            <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-normal tracking-tight text-brand-cream leading-[1.05]">
              Welcome
              <br />
              to <span className="text-brand-gold">JILLU KLOSET</span>
            </h1>

            <div className="pt-2 flex items-center gap-3 text-[10px] sm:text-xs tracking-[0.25em] text-brand-muted uppercase font-mono">
              <span>PREMIUM FASHION</span>
              <span>/</span>
              <span>TRENDY STYLES</span>
              <span>/</span>
              <span>YOURS</span>
            </div>

            <div className="w-16 h-[1.5px] bg-brand-gold/60 mt-4" />
          </div>

          {/* Explore More link */}
          <div className="pt-4">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 text-xs tracking-widest uppercase text-brand-muted hover:text-brand-cream font-mono transition-colors"
            >
              <ArrowDown className="w-3.5 h-3.5 text-brand-gold" />
              <span>EXPLORE MORE</span>
            </Link>
          </div>
        </div>

        {/* Right Side: Floating Luxury Glassmorphic Login Card */}
        <div className="lg:col-span-5 w-full max-w-md mx-auto lg:ml-auto">
          <div className="relative rounded-[28px] sm:rounded-[32px] bg-[#121110]/85 backdrop-blur-2xl border border-[#C5A880]/35 p-8 sm:p-10 shadow-2xl shadow-black/80 space-y-6">
            {/* Crown Logo inside card */}
            <div className="flex flex-col items-center text-center space-y-1 pb-2">
              <Crown className="w-5 h-5 text-brand-gold fill-brand-gold/20" />
              <span className="font-serif tracking-[0.2em] text-base font-bold text-brand-cream uppercase">
                JILLU KLOSET
              </span>
              <span className="text-[8px] tracking-[0.3em] text-brand-muted uppercase font-mono">
                WEAR YOUR STORY
              </span>
            </div>

            {/* Title */}
            <div className="text-left space-y-1">
              <h2 className="font-serif text-2xl sm:text-3xl text-brand-cream font-normal">
                Welcome back
              </h2>
              <p className="text-xs text-brand-muted font-light">
                Log in to continue your style journey.
              </p>
            </div>

            {/* Server Error Alert */}
            {serverError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs leading-snug">
                {serverError}
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={onSubmit} className="space-y-4" noValidate>
              {/* Email Input */}
              <div className="space-y-1">
                <div className="relative flex items-center">
                  <Mail className="absolute left-4 w-4 h-4 text-brand-muted/70 pointer-events-none" />
                  <input
                    type="email"
                    placeholder="Email address"
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /\S+@\S+\.\S+/,
                        message: 'Enter a valid email address',
                      },
                    })}
                    className="w-full bg-[#181715]/90 text-xs text-brand-cream placeholder-brand-muted/60 pl-11 pr-4 py-3.5 rounded-full border border-white/15 focus:border-brand-gold/80 focus:outline-none focus:ring-1 focus:ring-brand-gold/40 transition-all font-sans"
                  />
                </div>
                {errors.email && (
                  <p className="text-[11px] text-rose-400 pl-4">{errors.email.message}</p>
                )}
              </div>

              {/* Password Input with Eye toggle */}
              <div className="space-y-1">
                <div className="relative flex items-center">
                  <Lock className="absolute left-4 w-4 h-4 text-brand-muted/70 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    {...register('password', {
                      required: 'Password is required',
                    })}
                    className="w-full bg-[#181715]/90 text-xs text-brand-cream placeholder-brand-muted/60 pl-11 pr-11 py-3.5 rounded-full border border-white/15 focus:border-brand-gold/80 focus:outline-none focus:ring-1 focus:ring-brand-gold/40 transition-all font-sans"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 text-brand-muted hover:text-brand-cream transition-colors p-1"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-[11px] text-rose-400 pl-4">{errors.password.message}</p>
                )}
              </div>

              {/* Forgot password */}
              <div className="flex justify-end pt-0.5">
                <Link
                  href="/forgot-password"
                  className="text-xs text-brand-muted hover:text-brand-gold transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-6 rounded-full bg-brand-gold-light hover:bg-brand-gold text-brand-dark font-sans text-xs tracking-widest font-bold uppercase transition-all duration-300 hover:scale-102 flex items-center justify-center gap-2 shadow-luxury disabled:opacity-60"
              >
                <span>{isSubmitting ? 'SIGNING IN...' : 'LOG IN'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Divider OR */}
            <div className="relative flex items-center justify-center my-4">
              <div className="w-full border-t border-brand-border" />
              <span className="absolute bg-[#121110] px-3 text-[10px] uppercase font-mono tracking-widest text-brand-muted">
                OR
              </span>
            </div>

            {/* Google Authentication */}
            <button
              type="button"
              onClick={() => signIn('google', { callbackUrl })}
              className="w-full py-3 px-6 rounded-full bg-black/40 hover:bg-white/5 border border-brand-border hover:border-brand-gold/50 text-brand-cream font-sans text-xs font-semibold tracking-wide transition-all flex items-center justify-center gap-3"
            >
              {/* Google Colored Logo */}
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.15z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.16 0 9.97 0 12s.45 3.84 1.24 5.42l4.04-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* Create Account Link */}
            <p className="text-center text-xs text-brand-muted pt-2">
              New to Jillu?{' '}
              <Link href="/signup" className="text-brand-cream hover:text-brand-gold underline underline-offset-4 font-semibold transition-colors">
                Create your closet
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* 3. BOTTOM FEATURE STRIP */}
      <footer className="relative z-20 border-t border-brand-border/60 bg-black/60 backdrop-blur-md py-6">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 flex flex-col md:flex-row items-center justify-between gap-6">
          {/* 4 Brand Pillars */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-10 w-full md:w-auto">
            {/* Free Shipping */}
            <div className="flex items-center gap-3">
              <Truck className="w-5 h-5 text-brand-gold flex-shrink-0" />
              <div>
                <span className="text-[11px] font-bold text-brand-cream uppercase tracking-wider block">
                  FREE SHIPPING
                </span>
                <span className="text-[10px] text-brand-muted block">
                  On orders above ₹999
                </span>
              </div>
            </div>

            {/* Secure Payments */}
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-brand-gold flex-shrink-0" />
              <div>
                <span className="text-[11px] font-bold text-brand-cream uppercase tracking-wider block">
                  SECURE PAYMENTS
                </span>
                <span className="text-[10px] text-brand-muted block">
                  100% Safe & Trusted
                </span>
              </div>
            </div>

            {/* Premium Quality */}
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-brand-gold flex-shrink-0" />
              <div>
                <span className="text-[11px] font-bold text-brand-cream uppercase tracking-wider block">
                  PREMIUM QUALITY
                </span>
                <span className="text-[10px] text-brand-muted block">
                  Style that lasts
                </span>
              </div>
            </div>

            {/* Easy Returns */}
            <div className="flex items-center gap-3">
              <Heart className="w-5 h-5 text-brand-gold flex-shrink-0" />
              <div>
                <span className="text-[11px] font-bold text-brand-cream uppercase tracking-wider block">
                  EASY RETURNS
                </span>
                <span className="text-[10px] text-brand-muted block">
                  Hassle-free process
                </span>
              </div>
            </div>
          </div>

          {/* Right Script Signature */}
          <div className="hidden lg:block text-right">
            <span className="font-script text-2xl text-brand-gold tracking-wide rotate-[-3deg] block">
              More Than Just Clothes
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
