"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";

export function BlogCardSkeleton() {
  return (
    <Card className="overflow-hidden bg-card">
      <div className="relative h-56 bg-muted">
        <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-background/20 to-transparent shimmer" />
      </div>
      <div className="p-6 space-y-4">
        <div className="flex gap-3">
          <div className="h-4 w-16 bg-muted animate-pulse rounded" />
          <div className="h-4 w-20 bg-muted animate-pulse rounded" />
        </div>
        <div className="space-y-2">
          <div className="h-6 bg-muted animate-pulse rounded" />
          <div className="h-6 w-3/4 bg-muted animate-pulse rounded" />
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-muted/70 animate-pulse rounded" />
          <div className="h-4 bg-muted/70 animate-pulse rounded" />
          <div className="h-4 w-2/3 bg-muted/70 animate-pulse rounded" />
        </div>
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-muted animate-pulse rounded-full" />
            <div className="h-4 w-20 bg-muted animate-pulse rounded" />
          </div>
          <div className="h-4 w-12 bg-muted/70 animate-pulse rounded" />
        </div>
      </div>
    </Card>
  );
}

export function FeaturedBlogSkeleton() {
  return (
    <Card className="relative h-[500px] overflow-hidden border-0 bg-card">
      <div className="absolute inset-0 bg-muted animate-pulse">
        <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-background/20 to-transparent shimmer" />
      </div>
      <div className="absolute inset-0 p-8 flex flex-col justify-end">
        <div className="h-6 w-24 bg-muted/50 animate-pulse rounded mb-4" />
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="h-4 w-16 bg-muted/50 animate-pulse rounded" />
            <div className="h-4 w-16 bg-muted/50 animate-pulse rounded" />
            <div className="h-4 w-16 bg-muted/50 animate-pulse rounded" />
          </div>
          <div className="space-y-2">
            <div className="h-8 bg-muted/50 animate-pulse rounded" />
            <div className="h-8 w-3/4 bg-muted/50 animate-pulse rounded" />
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-muted/30 animate-pulse rounded" />
            <div className="h-4 w-2/3 bg-muted/30 animate-pulse rounded" />
          </div>
        </div>
      </div>
    </Card>
  );
}

export function BlogDetailSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Skeleton */}
      <section className="relative h-[75vh]">
        <div className="absolute inset-0 bg-muted animate-pulse">
          <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-background/30 to-transparent shimmer" />
        </div>
        <div className="relative z-10 container mx-auto px-4 pt-32">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="h-6 w-32 bg-muted/50 animate-pulse rounded-full mx-auto" />
            <div className="space-y-3">
              <div className="h-12 bg-muted/50 animate-pulse rounded mx-auto" />
              <div className="h-12 w-3/4 bg-muted/50 animate-pulse rounded mx-auto" />
            </div>
            <div className="h-6 w-2/3 bg-muted/30 animate-pulse rounded mx-auto" />
          </div>
        </div>
      </section>

      {/* Content Skeleton */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 max-w-7xl mx-auto">
            <div className="lg:col-span-8 space-y-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="space-y-3">
                  <div className="h-4 bg-muted animate-pulse rounded" />
                  <div className="h-4 bg-muted animate-pulse rounded" />
                  <div className="h-4 w-5/6 bg-muted animate-pulse rounded" />
                </div>
              ))}
            </div>
            <div className="lg:col-span-4 space-y-6">
              <Card className="p-6 bg-card">
                <div className="space-y-4">
                  <div className="h-6 w-32 bg-muted animate-pulse rounded" />
                  <div className="space-y-2">
                    <div className="h-4 bg-muted/70 animate-pulse rounded" />
                    <div className="h-4 bg-muted/70 animate-pulse rounded" />
                  </div>
                  <div className="h-10 bg-muted animate-pulse rounded" />
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export function TrendingBlogSkeleton() {
  return (
    <div className="space-y-4">
      <div className="relative w-full h-24 rounded-lg overflow-hidden bg-muted animate-pulse">
        <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-background/20 to-transparent shimmer" />
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-muted animate-pulse rounded" />
        <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
      </div>
      <div className="flex gap-3">
        <div className="h-3 w-16 bg-muted/70 animate-pulse rounded" />
        <div className="h-3 w-16 bg-muted/70 animate-pulse rounded" />
      </div>
    </div>
  );
}
