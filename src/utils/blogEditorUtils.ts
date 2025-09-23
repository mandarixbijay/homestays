// utils/blogEditorUtils.ts
// Utility functions and components for enhanced blog editing

export const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/[^a-z0-9-]/g, '') // Remove anything that's not letters, numbers, or hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

export const calculateReadTime = (content: string): number => {
  const text = content.replace(/<[^>]*>/g, ''); // Strip HTML tags
  const words = text.trim().split(/\s+/).filter(word => word.length > 0);
  return Math.ceil(words.length / 200); // 200 words per minute average
};

export const validateSlug = (slug: string): boolean => {
  const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugPattern.test(slug);
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
};

export const extractTextFromHtml = (html: string): string => {
  return html.replace(/<[^>]*>/g, '').trim();
};

export const getStatusColor = (status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'): string => {
  switch (status) {
    case 'PUBLISHED':
      return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
    case 'DRAFT':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
    case 'ARCHIVED':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400';
  }
};

// Enhanced Rich Text Editor Styles
export const editorStyles = `
  .rich-text-editor {
    border: 1px solid #d1d5db;
    border-radius: 0.5rem;
    overflow: hidden;
    background: white;
  }

  .dark .rich-text-editor {
    border-color: #4b5563;
    background: #1f2937;
  }

  .editor-toolbar {
    background: #f9fafb;
    border-bottom: 1px solid #e5e7eb;
    padding: 0.5rem;
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
  }

  .dark .editor-toolbar {
    background: #374151;
    border-bottom-color: #4b5563;
  }

  .editor-button {
    padding: 0.5rem;
    border: none;
    background: transparent;
    border-radius: 0.25rem;
    color: #4b5563;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .editor-button:hover {
    background: #e5e7eb;
    color: #1f2937;
  }

  .editor-button:active,
  .editor-button.active {
    background: #3b82f6;
    color: white;
  }

  .editor-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .dark .editor-button {
    color: #d1d5db;
  }

  .dark .editor-button:hover {
    background: #4b5563;
    color: #f9fafb;
  }

  .editor-divider {
    width: 1px;
    background: #e5e7eb;
    margin: 0 0.25rem;
  }

  .dark .editor-divider {
    background: #4b5563;
  }

  .editor-content {
    min-height: 400px;
    padding: 1rem;
    outline: none;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    font-size: 1rem;
    line-height: 1.6;
    color: #1f2937;
    background: white;
  }

  .dark .editor-content {
    color: #f9fafb;
    background: #1f2937;
  }

  .editor-content:empty:before {
    content: attr(data-placeholder);
    color: #9ca3af;
    pointer-events: none;
  }

  .dark .editor-content:empty:before {
    color: #6b7280;
  }

  .editor-content h1 {
    font-size: 2rem;
    font-weight: 700;
    margin: 1.5rem 0 1rem 0;
    line-height: 1.2;
    color: #1f2937;
  }

  .dark .editor-content h1 {
    color: #f9fafb;
  }

  .editor-content h2 {
    font-size: 1.5rem;
    font-weight: 600;
    margin: 1.25rem 0 0.75rem 0;
    line-height: 1.3;
    color: #374151;
  }

  .dark .editor-content h2 {
    color: #e5e7eb;
  }

  .editor-content h3 {
    font-size: 1.25rem;
    font-weight: 600;
    margin: 1rem 0 0.5rem 0;
    line-height: 1.4;
    color: #4b5563;
  }

  .dark .editor-content h3 {
    color: #d1d5db;
  }

  .editor-content p {
    margin: 0.75rem 0;
    line-height: 1.6;
  }

  .editor-content blockquote {
    border-left: 4px solid #e5e7eb;
    padding-left: 1rem;
    margin: 1rem 0;
    font-style: italic;
    color: #6b7280;
    background: #f9fafb;
    padding: 1rem;
    border-radius: 0.25rem;
  }

  .dark .editor-content blockquote {
    border-left-color: #4b5563;
    color: #9ca3af;
    background: #374151;
  }

  .editor-content ul,
  .editor-content ol {
    margin: 1rem 0;
    padding-left: 1.5rem;
  }

  .editor-content li {
    margin: 0.25rem 0;
  }

  .editor-content img {
    max-width: 100%;
    height: auto;
    border-radius: 0.5rem;
    margin: 1rem 0;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }

  .editor-content a {
    color: #3b82f6;
    text-decoration: underline;
    transition: color 0.2s;
  }

  .editor-content a:hover {
    color: #1d4ed8;
  }

  .dark .editor-content a {
    color: #60a5fa;
  }

  .dark .editor-content a:hover {
    color: #93c5fd;
  }

  .editor-content strong {
    font-weight: 600;
  }

  .editor-content em {
    font-style: italic;
  }

  .editor-content code {
    background: #f3f4f6;
    padding: 0.125rem 0.25rem;
    border-radius: 0.25rem;
    font-family: 'Fira Code', 'Consolas', monospace;
    font-size: 0.875rem;
    color: #dc2626;
  }

  .dark .editor-content code {
    background: #374151;
    color: #fca5a5;
  }
`;

// Enhanced Form Validation
export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
}

export interface ValidationSchema {
  [key: string]: ValidationRule;
}

export const validateForm = (data: Record<string, any>, schema: ValidationSchema): Record<string, string> => {
  const errors: Record<string, string> = {};

  Object.entries(schema).forEach(([field, rules]) => {
    const value = data[field];

    if (rules.required && (!value || (typeof value === 'string' && !value.trim()))) {
      errors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
      return;
    }

    if (value && typeof value === 'string') {
      if (rules.minLength && value.length < rules.minLength) {
        errors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} must be at least ${rules.minLength} characters`;
        return;
      }

      if (rules.maxLength && value.length > rules.maxLength) {
        errors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} must be no more than ${rules.maxLength} characters`;
        return;
      }

      if (rules.pattern && !rules.pattern.test(value)) {
        errors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} format is invalid`;
        return;
      }
    }

    if (rules.custom) {
      const customError = rules.custom(value);
      if (customError) {
        errors[field] = customError;
      }
    }
  });

  return errors;
};

// Blog Form Validation Schema
export const blogFormValidationSchema: ValidationSchema = {
  title: {
    required: true,
    minLength: 3,
    maxLength: 200
  },
  slug: {
    required: true,
    minLength: 3,
    maxLength: 100,
    pattern: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    custom: (value: string) => {
      if (value && !validateSlug(value)) {
        return 'Slug can only contain lowercase letters, numbers, and hyphens';
      }
      return null;
    }
  },
  excerpt: {
    required: true,
    minLength: 10,
    maxLength: 300
  },
  content: {
    required: true,
    minLength: 50,
    custom: (value: string) => {
      const textContent = extractTextFromHtml(value);
      if (textContent.length < 50) {
        return 'Content must be at least 50 characters';
      }
      return null;
    }
  },
  seoTitle: {
    maxLength: 60
  },
  seoDescription: {
    maxLength: 160
  }
};

// Enhanced Image Upload Handler
export interface ImageUploadOptions {
  maxSize?: number; // in bytes
  allowedTypes?: string[];
  maxDimensions?: { width: number; height: number };
}

export const validateImageFile = (
  file: File, 
  options: ImageUploadOptions = {}
): { valid: boolean; error?: string } => {
  const {
    maxSize = 10 * 1024 * 1024, // 10MB default
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    maxDimensions
  } = options;

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: ${allowedTypes.map(type => type.split('/')[1]).join(', ')}`
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size too large. Maximum size: ${(maxSize / 1024 / 1024).toFixed(1)}MB`
    };
  }

  return { valid: true };
};

export const resizeImage = (
  file: File,
  maxWidth: number,
  maxHeight: number,
  quality: number = 0.8
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to compress image'));
          }
        },
        file.type,
        quality
      );
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};

// Enhanced Auto-Save Functionality
export class AutoSaveManager {
  private saveCallback: (data: any) => Promise<void>;
  private interval: number;
  private timeoutId: NodeJS.Timeout | null = null;
  private lastSavedData: string = '';

  constructor(saveCallback: (data: any) => Promise<void>, interval: number = 30000) {
    this.saveCallback = saveCallback;
    this.interval = interval;
  }

  scheduleAutoSave(data: any): void {
    const currentData = JSON.stringify(data);
    
    // Don't save if data hasn't changed
    if (currentData === this.lastSavedData) return;

    // Clear existing timeout
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }

    // Schedule new save
    this.timeoutId = setTimeout(async () => {
      try {
        await this.saveCallback(data);
        this.lastSavedData = currentData;
        console.log('Auto-saved successfully');
      } catch (error) {
        console.error('Auto-save failed:', error);
      }
    }, this.interval);
  }

  destroy(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }
}
