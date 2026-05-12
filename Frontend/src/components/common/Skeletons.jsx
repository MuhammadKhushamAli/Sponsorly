/**
 * Skeleton Loaders
 * ----------------
 * Drop-in replacements for spinners during loading states.
 *
 * Usage:
 *   import { SkeletonCard, SkeletonText, SkeletonList, SkeletonProfile } from '../components/common/Skeletons';
 */
import React from 'react';

// ── Base building blocks ──────────────────────────────────────────────────────
export const SkeletonBox = ({ className = '' }) => (
  <div className={`skeleton ${className}`} />
);

export const SkeletonText = ({ lines = 3, className = '' }) => (
  <div className={`space-y-2 ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <SkeletonBox
        key={i}
        className={`h-3 ${i === lines - 1 && lines > 1 ? 'w-3/4' : 'w-full'}`}
      />
    ))}
  </div>
);

// ── Creator / Sponsor discovery card skeleton ─────────────────────────────────
export const SkeletonCard = () => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
    {/* Gradient header */}
    <SkeletonBox className="h-20 rounded-none" />
    <div className="pt-10 px-5 pb-5 space-y-3">
      <SkeletonBox className="h-4 w-2/3" />
      <SkeletonBox className="h-3 w-1/2" />
      <SkeletonText lines={2} />
      <div className="flex gap-2 pt-1">
        <SkeletonBox className="h-5 w-16 rounded-full" />
        <SkeletonBox className="h-5 w-16 rounded-full" />
        <SkeletonBox className="h-5 w-16 rounded-full" />
      </div>
    </div>
  </div>
);

// ── 4-column grid of cards ────────────────────────────────────────────────────
export const SkeletonCardGrid = ({ count = 8 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
    {Array.from({ length: count }).map((_, i) => <SkeletonCard key={i} />)}
  </div>
);

// ── Dashboard stat cards ──────────────────────────────────────────────────────
export const SkeletonStatCard = () => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
    <SkeletonBox className="w-11 h-11 rounded-xl" />
    <SkeletonBox className="h-3 w-24" />
    <SkeletonBox className="h-7 w-16" />
  </div>
);

export const SkeletonStatRow = ({ count = 4 }) => (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
    {Array.from({ length: count }).map((_, i) => <SkeletonStatCard key={i} />)}
  </div>
);

// ── Activity feed item ────────────────────────────────────────────────────────
export const SkeletonActivityItem = () => (
  <div className="flex items-start gap-3 py-3 border-b border-gray-50">
    <SkeletonBox className="w-8 h-8 rounded-xl shrink-0" />
    <div className="flex-1 space-y-2">
      <SkeletonBox className="h-3 w-3/4" />
      <SkeletonBox className="h-2.5 w-1/2" />
    </div>
    <SkeletonBox className="h-5 w-14 rounded-full" />
  </div>
);

export const SkeletonActivityFeed = ({ count = 6 }) => (
  <div>
    {Array.from({ length: count }).map((_, i) => <SkeletonActivityItem key={i} />)}
  </div>
);

// ── Public profile hero ───────────────────────────────────────────────────────
export const SkeletonProfile = () => (
  <div className="rounded-3xl overflow-hidden shadow-xl">
    <SkeletonBox className="h-48 sm:h-56 rounded-none" />
    <div className="bg-white px-6 sm:px-8 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-end gap-5 -mt-16 mb-6">
        <SkeletonBox className="w-32 h-32 rounded-3xl shrink-0 border-4 border-white" />
        <div className="flex-1 pt-4 sm:pt-0 space-y-3">
          <SkeletonBox className="h-6 w-48" />
          <SkeletonBox className="h-4 w-32" />
          <SkeletonBox className="h-8 w-40 rounded-xl" />
        </div>
      </div>
      <SkeletonText lines={3} />
    </div>
  </div>
);

// ── Chat sidebar item ─────────────────────────────────────────────────────────
export const SkeletonChatItem = () => (
  <div className="flex items-center gap-3 p-3">
    <SkeletonBox className="w-10 h-10 rounded-full shrink-0" />
    <div className="flex-1 space-y-2">
      <SkeletonBox className="h-3 w-2/3" />
      <SkeletonBox className="h-2.5 w-1/2" />
    </div>
  </div>
);

export const SkeletonChatList = ({ count = 5 }) => (
  <div>
    {Array.from({ length: count }).map((_, i) => <SkeletonChatItem key={i} />)}
  </div>
);

// ── Review card ───────────────────────────────────────────────────────────────
export const SkeletonReview = () => (
  <div className="bg-white border border-gray-100 rounded-2xl p-4 space-y-3">
    <div className="flex items-center gap-3">
      <SkeletonBox className="w-9 h-9 rounded-full shrink-0" />
      <div className="flex-1 space-y-1.5">
        <SkeletonBox className="h-3 w-32" />
        <SkeletonBox className="h-2.5 w-20" />
      </div>
    </div>
    <SkeletonText lines={2} />
  </div>
);

export const SkeletonReviews = ({ count = 3 }) => (
  <div className="space-y-3">
    {Array.from({ length: count }).map((_, i) => <SkeletonReview key={i} />)}
  </div>
);
