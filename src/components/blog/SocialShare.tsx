// src/components/blog/SocialShare.tsx
"use client";
import { Twitter, Facebook } from "lucide-react";

interface SocialShareProps {
  slug: string;
  title: string;
}

export default function SocialShare({ slug, title }: SocialShareProps) {
  return (
    <div className="flex gap-4">
      <button
        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover focus:ring-2 focus:ring-primary focus:outline-none transition-colors"
        aria-label="Share on Twitter"
        onClick={() =>
          window.open(
            `https://twitter.com/intent/tweet?url=https://nepalhomestays.com/blogs/${slug}&text=${encodeURIComponent(title)}`,
            "_blank"
          )
        }
      >
        <Twitter className="w-5 h-5" /> Twitter
      </button>
      <button
        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover focus:ring-2 focus:ring-primary focus:outline-none transition-colors"
        aria-label="Share on Facebook"
        onClick={() =>
          window.open(
            `https://www.facebook.com/sharer/sharer.php?u=https://nepalhomestays.com/blogs/${slug}`,
            "_blank"
          )
        }
      >
        <Facebook className="w-5 h-5" /> Facebook
      </button>
    </div>
  );
}