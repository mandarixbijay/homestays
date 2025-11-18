// SEO Utilities for Blog Management

/**
 * Generates an SEO-friendly slug from a title
 * - Removes stop words
 * - Limits to 60 characters
 * - Preserves important keywords
 * - Handles special characters properly
 */
export function generateSEOSlug(title: string, maxLength: number = 60): string {
  // Common stop words to remove for shorter, more meaningful slugs
  const stopWords = new Set([
    'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
    'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
    'to', 'was', 'will', 'with', 'this', 'but', 'they', 'have', 'had',
    'what', 'when', 'where', 'who', 'which', 'why', 'how', 'all', 'each',
    'every', 'both', 'few', 'more', 'most', 'other', 'some', 'such', 'than',
    'too', 'very', 'can', 'just', 'should', 'now'
  ]);

  // Step 1: Basic sanitization
  let slug = title
    .toLowerCase()
    .trim()
    // Replace ampersands with 'and'
    .replace(/&/g, 'and')
    // Remove apostrophes
    .replace(/'/g, '')
    // Replace any non-alphanumeric characters with spaces
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

  // Step 2: Remove stop words but keep at least 3 words
  const words = slug.split(/\s+/);
  const importantWords = words.filter((word, index) => {
    // Always keep numbers (years, quantities, etc.)
    if (/^\d+$/.test(word)) return true;
    // Keep the first 3 words to maintain context
    if (index < 3) return true;
    // Remove stop words after first 3 words
    return !stopWords.has(word);
  });

  // Step 3: Join words and limit length
  slug = importantWords.join('-');

  // Step 4: If still too long, intelligently truncate
  if (slug.length > maxLength) {
    // Try to keep complete words
    const truncated = slug.substring(0, maxLength);
    const lastDash = truncated.lastIndexOf('-');
    slug = lastDash > maxLength * 0.7 ? truncated.substring(0, lastDash) : truncated;
  }

  // Step 5: Clean up any edge cases
  slug = slug
    .replace(/^-+|-+$/g, '') // Remove leading/trailing dashes
    .replace(/-{2,}/g, '-'); // Replace multiple dashes with single dash

  return slug;
}

/**
 * Validates if a slug is SEO-friendly
 */
export function validateSlug(slug: string): { valid: boolean; issues: string[] } {
  const issues: string[] = [];

  if (!slug) {
    issues.push('Slug is required');
    return { valid: false, issues };
  }

  if (slug.length < 3) {
    issues.push('Slug is too short (minimum 3 characters)');
  }

  if (slug.length > 60) {
    issues.push(`Slug is too long (${slug.length}/60 characters). Shorter URLs rank better.`);
  }

  if (!/^[a-z0-9-]+$/.test(slug)) {
    issues.push('Slug should only contain lowercase letters, numbers, and hyphens');
  }

  if (slug.startsWith('-') || slug.endsWith('-')) {
    issues.push('Slug should not start or end with a hyphen');
  }

  if (slug.includes('--')) {
    issues.push('Slug should not contain consecutive hyphens');
  }

  const wordCount = slug.split('-').length;
  if (wordCount < 3) {
    issues.push('Slug should contain at least 3 words for better SEO');
  }

  return {
    valid: issues.length === 0,
    issues
  };
}

/**
 * SEO Content Analyzer
 * Analyzes blog content for SEO best practices
 */
export interface SEOAnalysis {
  score: number; // 0-100
  issues: Array<{
    type: 'error' | 'warning' | 'info';
    category: string;
    message: string;
  }>;
  recommendations: string[];
}

export function analyzeSEO(data: {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  seoTitle?: string;
  seoDescription?: string;
  tags: string[];
  categories: string[];
  images: Array<{ url?: string; alt?: string }>;
}): SEOAnalysis {
  const issues: SEOAnalysis['issues'] = [];
  const recommendations: string[] = [];
  let score = 100;

  // Title Analysis
  if (!data.title) {
    issues.push({ type: 'error', category: 'Title', message: 'Title is required' });
    score -= 20;
  } else {
    if (data.title.length < 30) {
      issues.push({ type: 'warning', category: 'Title', message: `Title is short (${data.title.length}/60 chars). Aim for 50-60 characters.` });
      score -= 5;
    } else if (data.title.length > 60) {
      issues.push({ type: 'warning', category: 'Title', message: `Title is long (${data.title.length}/60 chars). Keep under 60 for better display.` });
      score -= 5;
    } else {
      issues.push({ type: 'info', category: 'Title', message: `Title length is optimal (${data.title.length}/60 chars)` });
    }
  }

  // SEO Title
  const effectiveTitle = data.seoTitle || data.title;
  if (effectiveTitle && effectiveTitle.length > 60) {
    issues.push({ type: 'warning', category: 'Meta', message: 'SEO title may be truncated in search results' });
    score -= 3;
  }

  // Excerpt/Description
  if (!data.excerpt) {
    issues.push({ type: 'warning', category: 'Excerpt', message: 'Excerpt is recommended for better previews' });
    score -= 10;
  } else {
    if (data.excerpt.length < 120) {
      issues.push({ type: 'warning', category: 'Excerpt', message: `Excerpt is short (${data.excerpt.length}/160 chars)` });
      score -= 3;
    } else if (data.excerpt.length > 160) {
      issues.push({ type: 'warning', category: 'Excerpt', message: `Excerpt is too long (${data.excerpt.length}/160 chars)` });
      score -= 3;
    } else {
      issues.push({ type: 'info', category: 'Excerpt', message: `Excerpt length is optimal (${data.excerpt.length}/160 chars)` });
    }
  }

  // SEO Description
  const effectiveDescription = data.seoDescription || data.excerpt;
  if (effectiveDescription && effectiveDescription.length > 160) {
    issues.push({ type: 'warning', category: 'Meta', message: 'Meta description may be truncated in search results' });
    score -= 3;
  }

  // Slug Analysis
  const slugValidation = validateSlug(data.slug);
  if (!slugValidation.valid) {
    slugValidation.issues.forEach(issue => {
      issues.push({ type: 'error', category: 'Slug', message: issue });
      score -= 5;
    });
  } else {
    issues.push({ type: 'info', category: 'Slug', message: 'Slug is SEO-friendly' });
  }

  // Content Analysis
  if (!data.content) {
    issues.push({ type: 'error', category: 'Content', message: 'Content is required' });
    score -= 20;
  } else {
    // Remove HTML tags for word count
    const textContent = data.content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    const wordCount = textContent.split(' ').filter(w => w).length;

    if (wordCount < 300) {
      issues.push({ type: 'warning', category: 'Content', message: `Content is short (${wordCount} words). Aim for 800+ words.` });
      score -= 10;
    } else if (wordCount < 800) {
      issues.push({ type: 'info', category: 'Content', message: `Content has ${wordCount} words. Consider adding more for better SEO.` });
      recommendations.push('Expand content to 1000+ words for pillar articles');
    } else {
      issues.push({ type: 'info', category: 'Content', message: `Content has ${wordCount} words ✓` });
    }

    // Check for headings
    const hasH2 = /<h2/i.test(data.content);
    const hasH3 = /<h3/i.test(data.content);

    if (!hasH2) {
      issues.push({ type: 'warning', category: 'Content', message: 'No H2 headings found. Use headings to structure content.' });
      score -= 5;
    }

    if (!hasH3 && wordCount > 500) {
      issues.push({ type: 'info', category: 'Content', message: 'Consider using H3 headings for subsections' });
    }
  }

  // Images Analysis
  if (data.images.length === 0) {
    issues.push({ type: 'warning', category: 'Images', message: 'No images added. Visual content improves engagement.' });
    score -= 10;
  } else {
    const imagesWithoutAlt = data.images.filter(img => !img.alt || img.alt.trim() === '');
    if (imagesWithoutAlt.length > 0) {
      issues.push({
        type: 'warning',
        category: 'Images',
        message: `${imagesWithoutAlt.length} image(s) missing alt text. Alt text is crucial for SEO.`
      });
      score -= 5;
    } else {
      issues.push({ type: 'info', category: 'Images', message: 'All images have alt text ✓' });
    }
  }

  // Tags and Categories
  if (data.tags.length === 0) {
    issues.push({ type: 'warning', category: 'Taxonomy', message: 'No tags added. Tags help with content discovery.' });
    score -= 5;
  } else if (data.tags.length > 10) {
    issues.push({ type: 'warning', category: 'Taxonomy', message: `Too many tags (${data.tags.length}). Use 3-7 relevant tags.` });
    score -= 3;
  } else {
    issues.push({ type: 'info', category: 'Taxonomy', message: `${data.tags.length} tags added ✓` });
  }

  if (data.categories.length === 0) {
    issues.push({ type: 'warning', category: 'Taxonomy', message: 'No categories added. Categories improve organization.' });
    score -= 5;
  } else {
    issues.push({ type: 'info', category: 'Taxonomy', message: `${data.categories.length} category(ies) added ✓` });
  }

  // Generate recommendations
  if (score < 70) {
    recommendations.push('Address errors and warnings to improve SEO score');
  }

  if (!data.seoTitle) {
    recommendations.push('Add a custom SEO title optimized for search engines');
  }

  if (!data.seoDescription) {
    recommendations.push('Add a custom meta description to control search preview');
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    issues,
    recommendations
  };
}

/**
 * Estimates reading time based on word count
 */
export function calculateReadingTime(content: string): number {
  const textContent = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  const wordCount = textContent.split(' ').filter(w => w).length;
  const wordsPerMinute = 200; // Average reading speed
  return Math.max(1, Math.round(wordCount / wordsPerMinute));
}

/**
 * Extracts keywords from content
 */
export function extractKeywords(text: string, limit: number = 10): string[] {
  const stopWords = new Set([
    'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
    'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
    'to', 'was', 'will', 'with', 'this', 'but', 'they', 'have', 'had'
  ]);

  // Remove HTML and normalize
  const clean = text
    .replace(/<[^>]*>/g, ' ')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ');

  // Count word frequency
  const words = clean.split(/\s+/).filter(w => w.length > 3 && !stopWords.has(w));
  const frequency = new Map<string, number>();

  words.forEach(word => {
    frequency.set(word, (frequency.get(word) || 0) + 1);
  });

  // Sort by frequency and return top keywords
  return Array.from(frequency.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([word]) => word);
}
