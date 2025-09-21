"use client";

import React from "react";
import { Facebook, Twitter, Linkedin, Link, Copy, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface SocialShareProps {
  slug: string;
  title: string;
  excerpt?: string;
}

export default function SocialShare({ slug, title, excerpt }: SocialShareProps) {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const url = `${baseUrl}/blogs/${slug}`;
  const encodedTitle = encodeURIComponent(title);
  const encodedUrl = encodeURIComponent(url);
  const encodedExcerpt = encodeURIComponent(excerpt || title);

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`
  };

  const handleShare = (platform: string) => {
    if (platform === 'copy') {
      navigator.clipboard.writeText(url).then(() => {
        toast.success('Link copied to clipboard!');
      }).catch(() => {
        toast.error('Failed to copy link');
      });
      return;
    }

    // For mobile devices, try native sharing first
    if (navigator.share && platform === 'native') {
      navigator.share({
        title,
        text: excerpt,
        url
      }).catch(() => {
        // Fallback to Twitter if native sharing fails
        window.open(shareLinks.twitter, '_blank', 'noopener,noreferrer');
      });
      return;
    }

    // Open social platform
    const shareUrl = shareLinks[platform as keyof typeof shareLinks];
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'noopener,noreferrer,width=600,height=400');
    }
  };

  return (
    <div className="flex flex-wrap gap-3">
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleShare('facebook')}
        className="hover:bg-[#1877F2] hover:text-white hover:border-[#1877F2] transition-colors"
      >
        <Facebook className="w-4 h-4 mr-2" />
        Facebook
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleShare('twitter')}
        className="hover:bg-[#1DA1F2] hover:text-white hover:border-[#1DA1F2] transition-colors"
      >
        <Twitter className="w-4 h-4 mr-2" />
        Twitter
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleShare('linkedin')}
        className="hover:bg-[#0077B5] hover:text-white hover:border-[#0077B5] transition-colors"
      >
        <Linkedin className="w-4 h-4 mr-2" />
        LinkedIn
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleShare('whatsapp')}
        className="hover:bg-[#25D366] hover:text-white hover:border-[#25D366] transition-colors"
      >
        <MessageCircle className="w-4 h-4 mr-2" />
        WhatsApp
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleShare('copy')}
        className="hover:bg-gray-700 hover:text-white hover:border-gray-700 transition-colors"
      >
        <Copy className="w-4 h-4 mr-2" />
        Copy Link
      </Button>

      {/* Native Share button for mobile */}
      {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleShare('native')}
          className="sm:hidden hover:bg-primary hover:text-white hover:border-primary transition-colors"
        >
          <Link className="w-4 h-4 mr-2" />
          Share
        </Button>
      )}
    </div>
  );
}