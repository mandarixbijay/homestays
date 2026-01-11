"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
  Image as ImageIcon, X, Upload, Check, AlertCircle, Loader2,
  Edit3, Trash2, RefreshCw, CheckCircle, ExternalLink
} from 'lucide-react';
import { blogApi } from '@/lib/api/completeBlogApi';
import { optimizeImage } from '@/lib/utils/imageOptimization';

// ============================================================================
// TYPES
// ============================================================================

export interface ContentImage {
  id: string;
  originalSrc: string;
  uploadedUrl?: string;
  alt: string;
  caption: string;
  isBase64: boolean;
  isUploading: boolean;
  isUploaded: boolean;
  error?: string;
}

interface ContentImageManagerProps {
  content: string;
  onContentUpdate: (newContent: string) => void;
  onImagesChange?: (images: ContentImage[]) => void;
}

// ============================================================================
// IMAGE EDIT MODAL
// ============================================================================

const ImageEditModal: React.FC<{
  image: ContentImage;
  onSave: (alt: string, caption: string) => void;
  onClose: () => void;
  onUpload: () => void;
  onRemove: () => void;
}> = ({ image, onSave, onClose, onUpload, onRemove }) => {
  const [alt, setAlt] = useState(image.alt);
  const [caption, setCaption] = useState(image.caption);

  const handleSave = () => {
    onSave(alt, caption);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1A403D] to-[#224240] text-white p-6 rounded-t-2xl flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold">Edit Image</h3>
            <p className="text-sm text-white/80 mt-1">Add alt text and caption for SEO</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Image Preview */}
          <div className="relative rounded-xl overflow-hidden bg-gray-100 border-2 border-gray-200">
            <img
              src={image.uploadedUrl || image.originalSrc}
              alt={alt || 'Image preview'}
              className="w-full h-64 object-contain"
            />
            {/* Status Badge */}
            <div className="absolute top-3 right-3">
              {image.isUploading && (
                <span className="px-3 py-1.5 bg-blue-500 text-white rounded-full text-xs font-semibold flex items-center gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Uploading...
                </span>
              )}
              {image.isUploaded && (
                <span className="px-3 py-1.5 bg-green-500 text-white rounded-full text-xs font-semibold flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Uploaded
                </span>
              )}
              {image.isBase64 && !image.isUploaded && !image.isUploading && (
                <span className="px-3 py-1.5 bg-orange-500 text-white rounded-full text-xs font-semibold flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Needs Upload
                </span>
              )}
            </div>
          </div>

          {/* Error Message */}
          {image.error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
              <p className="text-sm text-red-600">{image.error}</p>
            </div>
          )}

          {/* Upload Button for Base64 Images */}
          {image.isBase64 && !image.isUploaded && (
            <button
              onClick={onUpload}
              disabled={image.isUploading}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              {image.isUploading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Uploading & Optimizing...
                </>
              ) : (
                <>
                  <Upload className="h-5 w-5" />
                  Upload to Server
                </>
              )}
            </button>
          )}

          {/* Alt Text */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Alt Text <span className="text-red-500">*</span>
              <span className="ml-2 text-xs font-normal text-gray-500">(Required for SEO & accessibility)</span>
            </label>
            <input
              type="text"
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#1A403D] focus:ring-2 focus:ring-[#1A403D]/20 transition"
              placeholder="Describe what's in the image..."
            />
            {alt && (
              <p className="mt-2 text-xs text-green-600 flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Alt text set
              </p>
            )}
          </div>

          {/* Caption */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Caption
              <span className="ml-2 text-xs font-normal text-gray-500">(Optional - displays below image)</span>
            </label>
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#1A403D] focus:ring-2 focus:ring-[#1A403D]/20 transition"
              placeholder="Add a caption for this image..."
            />
          </div>

          {/* Current URL Info */}
          {image.uploadedUrl && (
            <div className="p-4 bg-green-50 rounded-xl border border-green-200">
              <p className="text-xs font-semibold text-green-700 mb-1">Uploaded URL:</p>
              <p className="text-xs text-green-600 break-all font-mono">{image.uploadedUrl}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 p-6 border-t bg-gray-50 rounded-b-2xl">
          <button
            onClick={onRemove}
            className="px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-xl flex items-center gap-2 transition"
          >
            <Trash2 className="h-4 w-4" />
            Remove Image
          </button>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-200 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!alt.trim()}
              className="px-6 py-2.5 text-sm font-semibold text-white bg-[#1A403D] hover:bg-[#152f2d] rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition"
            >
              <Check className="h-4 w-4" />
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const ContentImageManager: React.FC<ContentImageManagerProps> = ({
  content,
  onContentUpdate,
  onImagesChange
}) => {
  const [images, setImages] = useState<ContentImage[]>([]);
  const [editingImage, setEditingImage] = useState<ContentImage | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  // Generate unique ID for images
  const generateId = () => `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Scan content for images
  const scanForImages = useCallback(() => {
    setIsScanning(true);

    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    const imgElements = doc.querySelectorAll('img');

    const foundImages: ContentImage[] = [];

    imgElements.forEach((img, index) => {
      const src = img.getAttribute('src') || '';
      const alt = img.getAttribute('alt') || '';

      // Get caption from figcaption if in figure
      let caption = '';
      const figure = img.closest('figure');
      if (figure) {
        const figcaption = figure.querySelector('figcaption');
        if (figcaption) {
          caption = figcaption.textContent || '';
        }
      }

      const isBase64 = src.startsWith('data:image');

      // Check if already in our list
      const existingImage = images.find(i => i.originalSrc === src);

      foundImages.push({
        id: existingImage?.id || generateId(),
        originalSrc: src,
        uploadedUrl: existingImage?.uploadedUrl,
        alt: existingImage?.alt || alt,
        caption: existingImage?.caption || caption,
        isBase64,
        isUploading: existingImage?.isUploading || false,
        isUploaded: existingImage?.isUploaded || false,
        error: existingImage?.error
      });
    });

    setImages(foundImages);
    onImagesChange?.(foundImages);
    setIsScanning(false);
  }, [content, images, onImagesChange]);

  // Scan for images when content changes
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      scanForImages();
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [content]);

  // Upload a single image
  const uploadImage = async (imageId: string) => {
    const image = images.find(i => i.id === imageId);
    if (!image || !image.isBase64 || image.isUploaded) return;

    // Update state to show uploading
    setImages(prev => prev.map(img =>
      img.id === imageId ? { ...img, isUploading: true, error: undefined } : img
    ));

    try {
      // Convert base64 to file
      const file = blogApi.base64ToFile(image.originalSrc, `content-image-${Date.now()}.jpg`);

      // Optimize before upload
      const optimized = await optimizeImage(file, {
        maxWidth: 1920,
        maxHeight: 1080,
        quality: 0.85,
        format: 'jpeg'
      });

      console.log(`[ContentImageManager] Optimized: ${optimized.compressionRatio.toFixed(1)}% savings`);

      // Upload to server
      const result = await blogApi.uploadContentImage(optimized.file);

      // Update image state
      setImages(prev => prev.map(img =>
        img.id === imageId ? {
          ...img,
          uploadedUrl: result.url,
          isUploading: false,
          isUploaded: true
        } : img
      ));

      // Update content HTML with new URL
      updateContentWithNewUrl(image.originalSrc, result.url, image.alt, image.caption);

    } catch (error: any) {
      console.error('[ContentImageManager] Upload failed:', error);
      setImages(prev => prev.map(img =>
        img.id === imageId ? {
          ...img,
          isUploading: false,
          error: error.message || 'Upload failed'
        } : img
      ));
    }
  };

  // Upload all base64 images
  const uploadAllImages = async () => {
    const base64Images = images.filter(img => img.isBase64 && !img.isUploaded);
    for (const image of base64Images) {
      await uploadImage(image.id);
    }
  };

  // Update content HTML with new URL and metadata
  const updateContentWithNewUrl = (oldSrc: string, newUrl: string, alt: string, caption: string) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');

    const imgElements = doc.querySelectorAll('img');
    imgElements.forEach(img => {
      if (img.getAttribute('src') === oldSrc) {
        img.setAttribute('src', newUrl);
        if (alt) img.setAttribute('alt', alt);

        // Handle figure/figcaption for caption
        const figure = img.closest('figure');
        if (caption) {
          if (figure) {
            let figcaption = figure.querySelector('figcaption');
            if (!figcaption) {
              figcaption = doc.createElement('figcaption');
              figcaption.style.cssText = 'text-align: center; color: #6b7280; font-size: 14px; margin-top: 8px; font-style: italic;';
              figure.appendChild(figcaption);
            }
            figcaption.textContent = caption;
          } else {
            // Wrap in figure with figcaption
            const newFigure = doc.createElement('figure');
            newFigure.style.cssText = 'margin: 24px 0; text-align: center;';

            const newImg = img.cloneNode(true) as HTMLImageElement;
            newImg.style.cssText = 'max-width: 100%; height: auto; border-radius: 12px;';

            const newFigcaption = doc.createElement('figcaption');
            newFigcaption.style.cssText = 'text-align: center; color: #6b7280; font-size: 14px; margin-top: 8px; font-style: italic;';
            newFigcaption.textContent = caption;

            newFigure.appendChild(newImg);
            newFigure.appendChild(newFigcaption);

            img.parentNode?.replaceChild(newFigure, img);
          }
        }
      }
    });

    const newContent = doc.body.innerHTML;
    onContentUpdate(newContent);
  };

  // Update image metadata (alt, caption)
  const updateImageMetadata = (imageId: string, alt: string, caption: string) => {
    const image = images.find(i => i.id === imageId);
    if (!image) return;

    // Update state
    setImages(prev => prev.map(img =>
      img.id === imageId ? { ...img, alt, caption } : img
    ));

    // Update content HTML
    const currentSrc = image.uploadedUrl || image.originalSrc;

    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');

    const imgElements = doc.querySelectorAll('img');
    imgElements.forEach(img => {
      const imgSrc = img.getAttribute('src');
      if (imgSrc === currentSrc || imgSrc === image.originalSrc) {
        img.setAttribute('alt', alt);

        // Handle caption
        const figure = img.closest('figure');
        if (caption) {
          if (figure) {
            let figcaption = figure.querySelector('figcaption');
            if (!figcaption) {
              figcaption = doc.createElement('figcaption');
              figcaption.style.cssText = 'text-align: center; color: #6b7280; font-size: 14px; margin-top: 8px; font-style: italic;';
              figure.appendChild(figcaption);
            }
            figcaption.textContent = caption;
          } else {
            // Wrap in figure
            const newFigure = doc.createElement('figure');
            newFigure.style.cssText = 'margin: 24px 0; text-align: center;';

            const clonedImg = img.cloneNode(true) as HTMLImageElement;
            clonedImg.style.cssText = 'max-width: 100%; height: auto; border-radius: 12px;';

            const newFigcaption = doc.createElement('figcaption');
            newFigcaption.style.cssText = 'text-align: center; color: #6b7280; font-size: 14px; margin-top: 8px; font-style: italic;';
            newFigcaption.textContent = caption;

            newFigure.appendChild(clonedImg);
            newFigure.appendChild(newFigcaption);

            img.parentNode?.replaceChild(newFigure, img);
          }
        } else if (figure) {
          // Remove figcaption if caption is empty
          const figcaption = figure.querySelector('figcaption');
          if (figcaption) {
            figcaption.remove();
          }
        }
      }
    });

    const newContent = doc.body.innerHTML;
    onContentUpdate(newContent);
  };

  // Remove image from content
  const removeImage = (imageId: string) => {
    const image = images.find(i => i.id === imageId);
    if (!image) return;

    const currentSrc = image.uploadedUrl || image.originalSrc;

    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');

    const imgElements = doc.querySelectorAll('img');
    imgElements.forEach(img => {
      const imgSrc = img.getAttribute('src');
      if (imgSrc === currentSrc || imgSrc === image.originalSrc) {
        // Remove figure if exists, otherwise just the img
        const figure = img.closest('figure');
        if (figure) {
          figure.remove();
        } else {
          img.remove();
        }
      }
    });

    const newContent = doc.body.innerHTML;
    onContentUpdate(newContent);

    // Update state
    setImages(prev => prev.filter(img => img.id !== imageId));
    setEditingImage(null);
  };

  const base64Count = images.filter(img => img.isBase64 && !img.isUploaded).length;
  const uploadedCount = images.filter(img => img.isUploaded).length;
  const missingAltCount = images.filter(img => !img.alt.trim()).length;

  if (images.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200 p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500 rounded-lg">
            <ImageIcon className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Content Images</h3>
            <p className="text-xs text-gray-600">
              {images.length} image{images.length !== 1 ? 's' : ''} detected
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={scanForImages}
            disabled={isScanning}
            className="p-2 hover:bg-purple-100 rounded-lg transition"
            title="Rescan for images"
          >
            <RefreshCw className={`h-4 w-4 text-purple-600 ${isScanning ? 'animate-spin' : ''}`} />
          </button>

          {base64Count > 0 && (
            <button
              onClick={uploadAllImages}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-lg flex items-center gap-2 transition"
            >
              <Upload className="h-4 w-4" />
              Upload All ({base64Count})
            </button>
          )}
        </div>
      </div>

      {/* Status Summary */}
      <div className="flex flex-wrap gap-2 mb-4">
        {base64Count > 0 && (
          <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {base64Count} need upload
          </span>
        )}
        {uploadedCount > 0 && (
          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            {uploadedCount} uploaded
          </span>
        )}
        {missingAltCount > 0 && (
          <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {missingAltCount} missing alt text
          </span>
        )}
      </div>

      {/* Image Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {images.map(image => (
          <div
            key={image.id}
            onClick={() => setEditingImage(image)}
            className="group relative aspect-square rounded-lg overflow-hidden bg-white border-2 border-gray-200 hover:border-purple-400 cursor-pointer transition-all hover:shadow-lg"
          >
            <img
              src={image.uploadedUrl || image.originalSrc}
              alt={image.alt || 'Content image'}
              className="w-full h-full object-cover"
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
              <Edit3 className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition" />
            </div>

            {/* Status Indicators */}
            <div className="absolute top-2 right-2 flex flex-col gap-1">
              {image.isUploading && (
                <span className="p-1.5 bg-blue-500 text-white rounded-full">
                  <Loader2 className="h-3 w-3 animate-spin" />
                </span>
              )}
              {image.isBase64 && !image.isUploaded && !image.isUploading && (
                <span className="p-1.5 bg-orange-500 text-white rounded-full" title="Needs upload">
                  <Upload className="h-3 w-3" />
                </span>
              )}
              {image.isUploaded && (
                <span className="p-1.5 bg-green-500 text-white rounded-full" title="Uploaded">
                  <CheckCircle className="h-3 w-3" />
                </span>
              )}
              {!image.alt && (
                <span className="p-1.5 bg-red-500 text-white rounded-full" title="Missing alt text">
                  <AlertCircle className="h-3 w-3" />
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editingImage && (
        <ImageEditModal
          image={editingImage}
          onSave={(alt, caption) => updateImageMetadata(editingImage.id, alt, caption)}
          onClose={() => setEditingImage(null)}
          onUpload={() => uploadImage(editingImage.id)}
          onRemove={() => removeImage(editingImage.id)}
        />
      )}
    </div>
  );
};

export default ContentImageManager;
