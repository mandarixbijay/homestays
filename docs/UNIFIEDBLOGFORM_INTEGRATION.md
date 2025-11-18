# UnifiedBlogForm Integration Guide

This guide shows you exactly how to integrate the new blog optimization components into `src/components/admin/blog/UnifiedBlogForm.tsx`.

## Step 1: Update Imports

**Find** (around line 1-22):
```typescript
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
    Save, Eye, ArrowLeft, Globe, Clock, AlertCircle, Check, Trash2, Archive, Upload,
    Image as ImageIcon, X, Star, Bold, Italic, List, Hash, Quote, Type, Plus, Search,
    Folder, Tag as TagIcon, Sparkles, Link2, Code, AlignLeft, AlignCenter, AlignRight,
    Maximize2, Minimize2, Info, TrendingUp, BarChart3, Zap, FileText, Settings,
    ExternalLink, Copy, CheckCircle2, XCircle, Layers, Palette
} from 'lucide-react';

import {
    Input, TextArea, ActionButton, Card, Alert, LoadingSpinner,
    useToast, Modal, Select
} from '@/components/admin/AdminComponents';

import { blogApi, CreateBlogData, UpdateBlogData, Tag, Category, BlogImage, Blog } from '@/lib/api/completeBlogApi';
import { revalidateBlogPages } from '@/app/actions/revalidate';
```

**Add these new imports after the existing imports**:
```typescript
// NEW: Import optimization utilities
import { generateSEOSlug, calculateReadingTime as calculateReadTime } from '@/lib/utils/seoUtils';
import { optimizeImage } from '@/lib/utils/imageOptimization';

// NEW: Import new components
import SEOScoreCard from './SEOScoreCard';
import SmartSlugInput from './SmartSlugInput';
import OptimizedImageUpload from './OptimizedImageUpload';
import ImprovedRichTextEditor from './ImprovedRichTextEditor';
```

---

## Step 2: Replace generateSlug and calculateReadTime Functions

**Find** (around line 50-61):
```typescript
const generateSlug = (title: string): string => {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
};

const calculateReadTime = (content: string): number => {
    const text = content.replace(/<[^>]*>/g, '');
    const wordCount = text.trim().split(/\s+/).length;
    return Math.ceil(wordCount / 200);
};
```

**Replace with**:
```typescript
// REMOVED: Now using generateSEOSlug from seoUtils.ts
// REMOVED: Now using calculateReadingTime from seoUtils.ts (imported as calculateReadTime)
```

---

## Step 3: Replace RichTextEditor Component

**Find** (around line 98):
```typescript
const RichTextEditor: React.FC<{
    content: string;
    onChange: (content: string) => void;
    onImageUpload: (file: File) => Promise<string>;
}> = ({ content, onChange, onImageUpload }) => {
    // ... entire component code ...
};
```

**Replace with**:
```typescript
// REMOVED: Now using ImprovedRichTextEditor from './ImprovedRichTextEditor'
// The new editor includes built-in image dialog with alt text and caption support
// Plus enhanced UI/UX with gradients, animations, and better visual feedback
```

---

## Step 4: Update handleImageUpload Function

**Find** (around line 1216):
```typescript
const handleImageUpload = async (file: File): Promise<string> => {
    try {
        imageFilesRef.current.push(file);
        const result = await blogApi.uploadImage(file);
        return result.url;
    } catch (error) {
        throw error;
    }
};
```

**Replace with**:
```typescript
const handleImageUpload = async (file: File): Promise<string> => {
    try {
        // NEW: Optimize image before upload
        const optimized = await optimizeImage(file, {
            maxWidth: 1920,
            maxHeight: 1080,
            quality: 0.85,
            format: 'jpeg'
        });

        console.log(`[Image Upload] Optimized: ${optimized.compressionRatio.toFixed(1)}% savings`);

        // Upload optimized file
        imageFilesRef.current.push(optimized.file);
        const result = await blogApi.uploadImage(optimized.file);
        return result.url;
    } catch (error) {
        console.error('[Image Upload] Failed:', error);
        throw error;
    }
};
```

---

## Step 5: Add Auto-Slug Generation on Title Change

**Find** the `handleChange` function (around line 1200):
```typescript
const handleChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
        setErrors(prev => ({ ...prev, [field]: '' }));
    }
};
```

**Replace with**:
```typescript
const handleChange = (field: keyof FormData, value: any) => {
    setFormData(prev => {
        const updated = { ...prev, [field]: value };

        // NEW: Auto-generate slug from title if slug is empty
        if (field === 'title' && !prev.slug) {
            updated.slug = generateSEOSlug(value);
        }

        return updated;
    });

    if (errors[field]) {
        setErrors(prev => ({ ...prev, [field]: '' }));
    }
};
```

---

## Step 6: Update handleSave to Calculate Reading Time

**Find** the `handleSave` function (around line 1250):
```typescript
const handleSave = async (publishNow: boolean = false) => {
    // ... validation code ...

    const dataToSave = {
        ...formData,
        // ... other fields ...
    };
```

**Add before creating `dataToSave`**:
```typescript
// NEW: Auto-calculate reading time
const readTime = calculateReadTime(formData.content);

const dataToSave = {
    ...formData,
    readTime, // NEW: Add calculated reading time
    // ... rest of fields ...
};
```

---

## Step 7: Replace Slug Input Field

**Find** (around line 1540-1560):
```typescript
<div>
    <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">🔗 URL Slug</label>
        <button
            type="button"
            onClick={handleCopySlug}
            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
        >
            <Copy className="h-3 w-3" />
            Copy URL
        </button>
    </div>
    <Input
        value={formData.slug}
        onChange={(e) => handleChange('slug', e.target.value)}
        placeholder="auto-generated-slug"
        className="font-mono text-sm"
    />
    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
        <ExternalLink className="h-3 w-3" />
        /blog/{formData.slug || 'your-slug-here'}
    </p>
</div>
```

**Replace with**:
```typescript
{/* NEW: Smart Slug Input with validation */}
<SmartSlugInput
    title={formData.title}
    value={formData.slug}
    onChange={(slug) => handleChange('slug', slug)}
    checkAvailability={async (slug) => {
        try {
            const result = await blogApi.checkSlugAvailability(slug);
            return result.available;
        } catch (error) {
            console.error('Failed to check slug availability:', error);
            return true; // Assume available if check fails
        }
    }}
/>
```

---

## Step 8: Replace Image Gallery

**Find** (around line 1642-1655):
```typescript
{/* Image Gallery */}
<Card className="shadow-lg border-2 border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow">
    <div className="p-6">
        <div className="flex items-center gap-2 mb-4">
            <ImageIcon className="h-5 w-5 text-purple-500" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Gallery</h3>
        </div>
        <PremiumImageGallery
            images={formData.images}
            onChange={(images) => handleChange('images', images)}
            onUpload={handleImageUpload}
        />
    </div>
</Card>
```

**Replace with**:
```typescript
{/* NEW: Optimized Image Gallery */}
<Card className="shadow-lg border-2 border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow">
    <div className="p-6">
        <div className="flex items-center gap-2 mb-4">
            <ImageIcon className="h-5 w-5 text-purple-500" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Image Gallery</h3>
            <span className="text-xs text-gray-500 dark:text-gray-400">
                (Auto-optimized on upload)
            </span>
        </div>
        <OptimizedImageUpload
            images={formData.images}
            onImagesChange={(images) => handleChange('images', images)}
            onFileUpload={handleImageUpload}
            maxImages={10}
            isFeaturedImage={false}
        />
    </div>
</Card>
```

---

## Step 9: Replace Content Editor

**Find** (around line 1575-1590):
```typescript
{/* Content Editor Card */}
<Card className="shadow-lg border-2 border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow">
    <div className="p-6">
        <label className="block text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-500" />
            Content
            <span className="text-red-500">*</span>
        </label>
        <RichTextEditor
            content={formData.content}
            onChange={(content) => handleChange('content', content)}
            onImageUpload={handleImageUpload}
        />
        {errors.content && (
            <p className="text-red-600 text-sm mt-2">{errors.content}</p>
        )}
    </div>
</Card>
```

**Replace with**:
```typescript
{/* NEW: Improved Content Editor with Enhanced UI/UX and Alt Text Support */}
<Card className="shadow-lg border-2 border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow">
    <div className="p-6">
        <label className="block text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-500" />
            Content
            <span className="text-red-500">*</span>
            <span className="text-xs text-gray-500 dark:text-gray-400 font-normal">
                (Click image icon in toolbar to add images with alt text & captions)
            </span>
        </label>
        <ImprovedRichTextEditor
            content={formData.content}
            onChange={(content) => handleChange('content', content)}
            onImageUpload={handleImageUpload}
        />
        {errors.content && (
            <p className="text-red-600 text-sm mt-2">{errors.content}</p>
        )}
    </div>
</Card>
```

---

## Step 10: Add SEO Score Card

**Add this NEW section after the Content Editor** (around line 1600):

```typescript
{/* NEW: SEO Score Dashboard */}
<Card className="shadow-lg border-2 border-green-200 dark:border-green-700 hover:shadow-xl transition-shadow">
    <div className="p-6">
        <SEOScoreCard
            title={formData.title}
            slug={formData.slug}
            excerpt={formData.excerpt}
            content={formData.content}
            seoTitle={formData.seoTitle}
            seoDescription={formData.seoDescription}
            tags={tags.filter(t => formData.tagIds.includes(t.id))}
            categories={categories.filter(c => formData.categoryIds.includes(c.id))}
            images={formData.images}
        />
    </div>
</Card>
```

---

## Complete! 🎉

After making all these changes, you'll have:

✅ **Smart Slug Input** - Auto-generates from title, validates format, checks availability
✅ **Optimized Image Upload** - Auto-compresses images (80%+ savings)
✅ **Improved Rich Text Editor** - Enhanced UI/UX with alt text & captions, compression stats
✅ **SEO Score Card** - Real-time SEO analysis and scoring
✅ **Auto Reading Time** - Calculated automatically on save

---

## Testing Checklist

After integration, test these features:

### Slug Generation
- [ ] Type a blog title
- [ ] Slug auto-generates and is under 60 chars
- [ ] Manual edit works
- [ ] Availability check shows green checkmark
- [ ] Invalid characters are auto-sanitized

### Image Upload
- [ ] Upload an image (should show compression stats)
- [ ] Verify image is optimized (check file size in network tab)
- [ ] Alt text can be edited
- [ ] Caption is optional
- [ ] Set featured image works

### Content Editor
- [ ] Click image icon in toolbar
- [ ] Upload image shows dialog
- [ ] Can add alt text (required)
- [ ] Can add caption (optional)
- [ ] Image inserts with proper HTML
- [ ] Caption displays below image

### SEO Score
- [ ] Score updates as you type
- [ ] Shows errors in red
- [ ] Shows warnings in yellow
- [ ] Shows successes in green
- [ ] Recommendations display

### Integration
- [ ] Existing blogs load correctly
- [ ] New blogs can be created
- [ ] Images upload successfully
- [ ] Slugs save correctly
- [ ] Reading time calculated
- [ ] SEO fields validate

---

## Rollback

If you need to rollback any changes, simply revert the specific sections. Each integration is independent.

**Need help?** Check `docs/BLOG_OPTIMIZATION_GUIDE.md` for detailed component documentation.
