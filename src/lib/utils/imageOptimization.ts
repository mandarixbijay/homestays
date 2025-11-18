// Image Optimization Utilities for Blog Management

export interface ImageOptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0-1
  format?: 'jpeg' | 'png' | 'webp';
}

export interface OptimizedImageResult {
  file: File;
  originalSize: number;
  optimizedSize: number;
  compressionRatio: number;
  dimensions: { width: number; height: number };
}

/**
 * Optimizes an image file by resizing and compressing
 * Returns a promise with the optimized file
 */
export async function optimizeImage(
  file: File,
  options: ImageOptimizationOptions = {}
): Promise<OptimizedImageResult> {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.85,
    format = 'jpeg'
  } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        try {
          // Calculate new dimensions while maintaining aspect ratio
          let { width, height } = img;
          const aspectRatio = width / height;

          if (width > maxWidth) {
            width = maxWidth;
            height = width / aspectRatio;
          }

          if (height > maxHeight) {
            height = maxHeight;
            width = height * aspectRatio;
          }

          // Create canvas and draw resized image
          const canvas = document.createElement('canvas');
          canvas.width = Math.round(width);
          canvas.height = Math.round(height);

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
          }

          // Enable image smoothing for better quality
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          // Draw the image
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          // Convert to blob
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Could not create blob'));
                return;
              }

              // Create optimized file
              const optimizedFile = new File(
                [blob],
                file.name.replace(/\.[^.]+$/, `.${format === 'jpeg' ? 'jpg' : format}`),
                { type: `image/${format}` }
              );

              const compressionRatio = ((file.size - blob.size) / file.size) * 100;

              resolve({
                file: optimizedFile,
                originalSize: file.size,
                optimizedSize: blob.size,
                compressionRatio,
                dimensions: { width: canvas.width, height: canvas.height }
              });
            },
            `image/${format}`,
            quality
          );
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Optimizes multiple images in parallel
 */
export async function optimizeImages(
  files: File[],
  options?: ImageOptimizationOptions
): Promise<OptimizedImageResult[]> {
  return Promise.all(files.map(file => optimizeImage(file, options)));
}

/**
 * Validates if a file is an image and within size limits
 */
export function validateImageFile(file: File, maxSizeInMB: number = 10): { valid: boolean; error?: string } {
  // Check if it's an image
  if (!file.type.startsWith('image/')) {
    return { valid: false, error: 'File must be an image' };
  }

  // Check size
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  if (file.size > maxSizeInBytes) {
    return {
      valid: false,
      error: `File size (${formatBytes(file.size)}) exceeds limit (${maxSizeInMB}MB)`
    };
  }

  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowedTypes.includes(file.type.toLowerCase())) {
    return { valid: false, error: 'Unsupported image format. Use JPG, PNG, WebP, or GIF.' };
  }

  return { valid: true };
}

/**
 * Formats bytes to human-readable string
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Generates alt text suggestions based on filename
 */
export function suggestAltText(filename: string): string {
  return filename
    .replace(/\.[^.]+$/, '') // Remove extension
    .replace(/[-_]/g, ' ') // Replace hyphens and underscores with spaces
    .replace(/\b\w/g, char => char.toUpperCase()); // Capitalize first letter of each word
}

/**
 * Checks if image dimensions are suitable for featured image
 */
export async function checkFeaturedImageDimensions(file: File): Promise<{
  suitable: boolean;
  dimensions: { width: number; height: number };
  recommendation?: string;
}> {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        const { width, height } = img;
        const aspectRatio = width / height;

        // Ideal for Open Graph is 1.91:1 (1200x630)
        const idealRatio = 1.91;
        const ratioTolerance = 0.2;

        let suitable = true;
        let recommendation: string | undefined;

        if (width < 1200 || height < 630) {
          suitable = false;
          recommendation = 'Image should be at least 1200x630px for optimal social media sharing.';
        } else if (Math.abs(aspectRatio - idealRatio) > ratioTolerance) {
          recommendation = `Image aspect ratio is ${aspectRatio.toFixed(2)}:1. Ideal is 1.91:1 (1200x630px) for social media.`;
        }

        resolve({
          suitable,
          dimensions: { width, height },
          recommendation
        });
      };

      img.src = e.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Creates a preview URL for an image file
 */
export function createImagePreview(file: File): string {
  return URL.createObjectURL(file);
}

/**
 * Revokes a preview URL to free memory
 */
export function revokeImagePreview(url: string): void {
  URL.revokeObjectURL(url);
}

/**
 * Batch image operations with progress tracking
 */
export interface BatchOptimizationProgress {
  total: number;
  completed: number;
  current?: string;
  percentage: number;
}

export async function batchOptimizeWithProgress(
  files: File[],
  options: ImageOptimizationOptions,
  onProgress: (progress: BatchOptimizationProgress) => void
): Promise<OptimizedImageResult[]> {
  const results: OptimizedImageResult[] = [];
  const total = files.length;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];

    onProgress({
      total,
      completed: i,
      current: file.name,
      percentage: (i / total) * 100
    });

    try {
      const result = await optimizeImage(file, options);
      results.push(result);
    } catch (error) {
      console.error(`Failed to optimize ${file.name}:`, error);
      // Continue with other files even if one fails
    }
  }

  onProgress({
    total,
    completed: total,
    percentage: 100
  });

  return results;
}
