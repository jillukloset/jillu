'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import {
  Crown,
  Mail,
  Lock,
  User,
  AtSign,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Truck,
  ShieldCheck,
  Sparkles,
  Heart,
  CheckCircle,
} from 'lucide-react';

type FormValues = {
  displayName: string;
  username: string;
  email: string;
  password: string;
};

export function SignupForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>();

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setServerError(json.error?.message ?? 'Something went wrong. Please try again.');
        return;
      }
      setSubmitted(true);
      router.refresh();
    } catch {
      setServerError('An error occurred during registration.');
    }
  });

  return (
    <div className="relative min-h-screen w-full bg-[#080807] text-[#F4EFE7] overflow-hidden flex flex-col justify-between font-sans selection:bg-[#C5A880] selection:text-[#080807]">
      {/* Background Editorial Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/hero_male_model.jpg"
          alt="Jillu Editorial Male Model"
          className="w-full h-full object-cover object-[center_20%] opacity-40 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#080807] via-[#080807]/75 to-[#080807]/90" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080807] via-transparent to-[#080807]/80" />
      </div>

      {/* 1. TOP BAR */}
      <header className="relative z-20 max-w-7xl w-full mx-auto px-6 sm:px-10 py-6 sm:py-8 flex items-center justify-between">
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

        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs sm:text-sm text-brand-muted hover:text-brand-cream transition-colors group"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
          <span>Back to Home</span>
        </Link>
      </header>

      {/* 2. MAIN CENTER HERO CONTENT & SIGNUP CARD */}
      <main className="relative z-20 max-w-7xl w-full mx-auto px-6 sm:px-10 py-6 sm:py-10 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center flex-1">
        {/* Left Side: Editorial Typography */}
        <div className="lg:col-span-7 space-y-8">
          <div className="space-y-1">
            <p className="font-script text-3xl sm:text-4xl lg:text-5xl text-brand-gold tracking-wide leading-none -rotate-6">
              Your Style
            </p>
            <p className="font-script text-3xl sm:text-4xl lg:text-5xl text-brand-gold tracking-wide leading-none pl-6 -rotate-6">
              Our Story
            </p>
          </div>

          <div className="space-y-2">
            <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-normal tracking-tight text-brand-cream leading-[1.05]">
              Join the
              <br />
              <span className="text-brand-gold">JILLU CIRCLE</span>
            </h1>

            <div className="pt-2 flex items-center gap-3 text-[10px] sm:text-xs tracking-[0.25em] text-brand-muted uppercase font-mono">
              <span>EXCLUSIVE DROPS</span>
              <span>/</span>
              <span>PRIVATE PREVIEWS</span>
              <span>/</span>
              <span>CURATION</span>
            </div>

            <div className="w-16 h-[1.5px] bg-brand-gold/60 mt-4" />
          </div>
        </div>

        {/* Right Side: Floating Luxury Glassmorphic Signup Card */}
        <div className="lg:col-span-5 w-full max-w-md mx-auto lg:ml-auto">
          <div className="relative rounded-[28px] sm:rounded-[32px] bg-[#121110]/85 backdrop-blur-2xl border border-[#C5A880]/35 p-8 sm:p-10 shadow-2xl shadow-black/80 space-y-6">
            <div className="flex flex-col items-center text-center space-y-1 pb-1">
              <Crown className="w-5 h-5 text-brand-gold fill-brand-gold/20" />
              <span className="font-serif tracking-[0.2em] text-base font-bold text-brand-cream uppercase">
                JILLU KLOSET
              </span>
              <span className="text-[8px] tracking-[0.3em] text-brand-muted uppercase font-mono">
                WEAR YOUR STORY
              </span>
            </div>

            {submitted ? (
              <div className="text-center py-6 space-y-4 animate-fade-in">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle className="w-7 h-7" />
                </div>
                <h3 className="font-serif text-2xl text-brand-cream font-normal">Check your inbox</h3>
                <p className="text-xs text-brand-muted leading-relaxed font-light">
                  We sent an invitation link to confirm your membership and activate your private closet.
                </p>
                <Link
                  href="/login"
                  className="inline-block mt-4 w-full py-3 rounded-full bg-brand-gold-light hover:bg-brand-gold text-brand-dark font-sans text-xs tracking-widest font-bold uppercase transition-all"
                >
                  RETURN TO LOG IN
                </Link>
              </div>
            ) : (
              <>
                <div className="text-left space-y-1">
                  <h2 className="font-serif text-2xl sm:text-3xl text-brand-cream font-normal">
                    Create your closet
                  </h2>
                  <p className="text-xs text-brand-muted font-light">
                    Join our private fashion community.
                  </p>
                </div>

                {serverError && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs leading-snug">
                    {serverError}
                  </div>
                )}

                <form onSubmit={onSubmit} className="space-y-3.5" noValidate>
                  {/* Display Name */}
                  <div className="space-y-1">
                    <div className="relative flex items-center">
                      <User className="absolute left-4 w-4 h-4 text-brand-muted/70 pointer-events-none" />
                      <input
                        type="text"
                        placeholder="Display name"
                        {...register('displayName', { required: 'Display name is required' })}
                        className="w-full bg-[#181715]/90 text-xs text-brand-cream placeholder-brand-muted/60 pl-11 pr-4 py-3 rounded-full border border-white/15 focus:border-brand-gold/80 focus:outline-none focus:ring-1 focus:ring-brand-gold/40 transition-all font-sans"
                      />
                    </div>
                    {errors.displayName && (
                      <p className="text-[11px] text-rose-400 pl-4">{errors.displayName.message}</p>
                    )}
                  </div>

                  {/* Username */}
                  <div className="space-y-1">
                    <div className="relative flex items-center">
                      <AtSign className="absolute left-4 w-4 h-4 text-brand-muted/70 pointer-events-none" />
                      <input
                        type="text"
                        placeholder="Username (e.g. julian)"
                        {...register('username', {
                          required: 'Username is required',
                          pattern: {
                            value: /^[a-z0-9_.]{3,24}$/,
                            message: '3-24 letters, numbers, or _',
                          },
                        })}
                        className="w-full bg-[#181715]/90 text-xs text-brand-cream placeholder-brand-muted/60 pl-11 pr-4 py-3 rounded-full border border-white/15 focus:border-brand-gold/80 focus:outline-none focus:ring-1 focus:ring-brand-gold/40 transition-all font-sans"
                      />
                    </div>
                    {errors.username && (
                      <p className="text-[11px] text-rose-400 pl-4">{errors.username.message}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="space-y-1">
                    <div className="relative flex items-center">
                      <Mail className="absolute left-4 w-4 h-4 text-brand-muted/70 pointer-events-none" />
                      <input
                        type="email"
                        placeholder="Email address"
                        {...register('email', {
                          required: 'Email is required',
                          pattern: { value: /\S+@\S+\.\S+/, message: 'Valid email is required' },
                        })}
                        className="w-full bg-[#181715]/90 text-xs text-brand-cream placeholder-brand-muted/60 pl-11 pr-4 py-3 rounded-full border border-white/15 focus:border-brand-gold/80 focus:outline-none focus:ring-1 focus:ring-brand-gold/40 transition-all font-sans"
                      />
                    </div>
                    {errors.email && (
                      <p className="text-[11px] text-rose-400 pl-4">{errors.email.message}</p>
                    )}
                  </div>

                  {/* Password */}
                  <div className="space-y-1">
                    <div className="relative flex items-center">
                      <Lock className="absolute left-4 w-4 h-4 text-brand-muted/70 pointer-events-none" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Password (min 8 characters)"
                        {...register('password', {
                          required: 'Password is required',
                          minLength: { value: 8, message: 'Minimum 8 characters' },
                        })}
                        className="w-full bg-[#181715]/90 text-xs text-brand-cream placeholder-brand-muted/60 pl-11 pr-11 py-3 rounded-full border border-white/15 focus:border-brand-gold/80 focus:outline-none focus:ring-1 focus:ring-brand-gold/40 transition-all font-sans"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 text-brand-muted hover:text-brand-cream p-1"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-[11px] text-rose-400 pl-4">{errors.password.message}</p>
                    )}
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full mt-2 py-3.5 px-6 rounded-full bg-brand-gold-light hover:bg-brand-gold text-brand-dark font-sans text-xs tracking-widest font-bold uppercase transition-all duration-300 hover:scale-102 flex items-center justify-center gap-2 shadow-luxury disabled:opacity-60"
                  >
                    <span>{isSubmitting ? 'CREATING CLOSET...' : 'CREATE ACCOUNT'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>

                <p className="text-center text-xs text-brand-muted pt-1">
                  Already have an account?{' '}
                  <Link href="/login" className="text-brand-cream hover:text-brand-gold underline underline-offset-4 font-semibold transition-colors">
                    Log in
                  </Link>
                </p>
              </>
            )}
          </div>
        </div>
      </main>

      {/* 3. BOTTOM FEATURE STRIP */}
      <footer className="relative z-20 border-t border-brand-border/60 bg-black/60 backdrop-blur-md py-6">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-10 w-full md:w-auto">
            <div className="flex items-center gap-3">
              <Truck className="w-5 h-5 text-brand-gold flex-shrink-0" />
              <div>
                <span className="text-[11px] font-bold text-brand-cream uppercase tracking-wider block">
                  FREE SHIPPING
                </span>
                <span className="text-[10px] text-brand-muted block">On orders above ₹999</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-brand-gold flex-shrink-0" />
              <div>
                <span className="text-[11px] font-bold text-brand-cream uppercase tracking-wider block">
                  SECURE PAYMENTS
                </span>
                <span className="text-[10px] text-brand-muted block">100% Safe & Trusted</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-brand-gold flex-shrink-0" />
              <div>
                <span className="text-[11px] font-bold text-brand-cream uppercase tracking-wider block">
                  PREMIUM QUALITY
                </span>
                <span className="text-[10px] text-brand-muted block">Style that lasts</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Heart className="w-5 h-5 text-brand-gold flex-shrink-0" />
              <div>
                <span className="text-[11px] font-bold text-brand-cream uppercase tracking-wider block">
                  EASY RETURNS
                </span>
                <span className="text-[10px] text-brand-muted block">Hassle-free process</span>
              </div>
            </div>
          </div>

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
