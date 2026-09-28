import React from 'react';
import { Hero } from '@/components/home/Hero';
import { CategoryCards } from '@/components/home/CategoryCards';
import { FeaturedPicks } from '@/components/home/FeaturedPicks';
import { BrandPromise } from '@/components/home/BrandPromise';

export default function HomePage() {
  return (
    <div className="bg-[#080807] min-h-screen">
      {/* 1. Hero Section matching screenshot */}
      <Hero />

      {/* 2. Category Cards matching screenshot */}
      <CategoryCards />

      {/* 3. Featured Picks matching screenshot */}
      <FeaturedPicks />

      {/* 4. Brand Promise matching screenshot */}
      <BrandPromise />
    </div>
  );
}
