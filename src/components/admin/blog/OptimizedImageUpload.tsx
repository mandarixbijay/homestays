"use client";

import React, { useState, useCallback } from 'react';
import {
  Upload, X, Check, AlertCircle, Image as ImageIcon,
  Loader2, ZoomIn, AlertTriangle, Star, Edit2, ChevronDown, ChevronUp
} from 'lucide-react';
import {
  optimizeImage,
  validateImageFile,
  formatBytes,
  suggestAltText,
  checkFeaturedImageDimensions,
  type OptimizedImageResult
} from '@/lib/utils/imageOptimization';

interface ImageData {
  url?: string;
  alt?: string;
  caption?: string;
  isMain: boolean;
}

interface OptimizedImageUploadProps {
  images: ImageData[];
  onImagesChange: (images: ImageData[]) => void;
  onFileUpload: (file: File) => Promise<string>;
  maxImages?: number;
  isFeaturedImage?: boolean;
}

export const OptimizedImageUpload: React.FC<OptimizedImageUploadProps> = ({
  images,
  onImagesChange,
  onFileUpload,
  maxImages = 10,
  isFeaturedImage = false
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const [optimizationStats, setOptimizationStats] = useState<OptimizedImageResult | null>(null);
  const [error, setError] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [editingImage, setEditingImage] = useState<number | null>(null);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setError('');
    setIsUploading(true);
    setOptimizationStats(null);

    try {
      const newImages: ImageData[] = [];

      for (const file of files) {
        const validation = validateImageFile(file, 10);
        if (!validation.valid) {
          setError(validation.error || 'Invalid file');
          continue;
        }

        setUploadProgress(`Optimizing ${file.name}...`);

        const optimizationResult = await optimizeImage(file, {
          maxWidth: 1920,
          maxHeight: 1080,
          quality: 0.85,
          format: 'jpeg'
        });

        setOptimizationStats(optimizationResult);

        if (isFeaturedImage) {
          const dimensionCheck = await checkFeaturedImageDimensions(optimizationResult.file);
          if (!dimensionCheck.suitable && dimensionCheck.recommendation) {
            setError(dimensionCheck.recommendation);
          }
        }

        setUploadProgress(`Uploading ${file.name}...`);

        try {
          const url = await onFileUpload(optimizationResult.file);
          newImages.push({
            url,
            alt: suggestAltText(file.name),
            caption: '',
            isMain: isFeaturedImage || (images.length === 0 && newImages.length === 0)
          });
        } catch (uploadError) {
          console.error('Upload error:', uploadError);
          const blobUrl = URL.createObjectURL(optimizationResult.file);
          newImages.push({
            url: blobUrl,
            alt: suggestAltText(file.name),
            caption: '',
            isMain: isFeaturedImage || (images.length === 0 && newImages.length === 0)
          });
          setError(`Note: ${file.name} will upload when you save`);
        }
      }

      onImagesChange([...images, ...newImages]);

    } catch (err) {
      console.error('Image processing error:', err);
      setError(err instanceof Error ? err.message : 'Failed to process image');
    } finally {
      setIsUploading(false);
      setUploadProgress('');
      e.target.value = '';
    }
  }, [images, onImagesChange, onFileUpload, isFeaturedImage]);

  const handleRemoveImage = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index);
    onImagesChange(updatedImages);
    if (editingImage === index) setEditingImage(null);
  };

  const handleSetMainImage = (index: number) => {
    const updatedImages = images.map((img, i) => ({
      ...img,
      isMain: i === index
    }));
    onImagesChange(updatedImages);
  };

  const handleUpdateAlt = (index: number, alt: string) => {
    const updatedImages = [...images];
    updatedImages[index] = { ...updatedImages[index], alt };
    onImagesChange(updatedImages);
  };

  const handleUpdateCaption = (index: number, caption: string) => {
    const updatedImages = [...images];
    updatedImages[index] = { ...updatedImages[index], caption };
    onImagesChange(updatedImages);
  };

  const canAddMore = images.length < maxImages;

  return (
    <div className="space-y-2">
      {/* Compact horizontal layout */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Image thumbnails */}
        {images.map((image, index) => (
          <div
            key={index}
            className={`relative group flex-shrink-0 ${editingImage === index ? 'ring-2 ring-[#1A403D]' : ''}`}
          >
            {/* Thumbnail */}
            <div
              className={`relative w-16 h-16 rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                image.isMain ? 'border-[#1A403D]' : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setEditingImage(editingImage === index ? null : index)}
            >
              {image.url && (
                <img
                  src={image.url}
                  alt={image.alt || 'Preview'}
                  className="w-full h-full object-cover"
                />
              )}

              {/* Featured badge */}
              {image.isMain && (
                <div className="absolute top-0.5 left-0.5">
                  <Star className="h-3 w-3 text-yellow-500 fill-yellow-500 drop-shadow" />
                </div>
              )}

              {/* Alt text warning */}
              {!image.alt && (
                <div className="absolute bottom-0.5 right-0.5">
                  <AlertCircle className="h-3 w-3 text-orange-500" />
                </div>
              )}

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Edit2 className="h-4 w-4 text-white" />
              </div>
            </div>

            {/* Quick remove button */}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); handleRemoveImage(index); }}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center shadow-sm"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}

        {/* Upload button - compact */}
        {canAddMore && (
          <div className="relative flex-shrink-0">
            <input
              type="file"
              accept="image/*"
              multiple={!isFeaturedImage}
              onChange={handleFileSelect}
              disabled={isUploading}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
              id="image-upload-compact"
            />
            <label
              htmlFor="image-upload-compact"
              className={`
                flex items-center justify-center w-16 h-16 rounded-lg cursor-pointer transition-all border-2 border-dashed
                ${isUploading
                  ? 'border-[#1A403D] bg-blue-50'
                  : 'border-gray-300 hover:border-[#1A403D] bg-gray-50 hover:bg-blue-50'
                }
              `}
            >
              {isUploading ? (
                <Loader2 className="h-5 w-5 text-[#1A403D] animate-spin" />
              ) : (
                <Upload className="h-5 w-5 text-gray-400" />
              )}
            </label>
          </div>
        )}

        {/* Empty state hint */}
        {images.length === 0 && !isUploading && (
          <span className="text-xs text-gray-500 ml-2">Click to add images</span>
        )}
      </div>

      {/* Upload progress */}
      {isUploading && uploadProgress && (
        <div className="text-xs text-gray-600 flex items-center gap-2">
          <span>{uploadProgress}</span>
          {optimizationStats && (
            <span className="text-green-600">
              ({optimizationStats.compressionRatio.toFixed(0)}% smaller)
            </span>
          )}
        </div>
      )}

      {/* Error Message - compact */}
      {error && (
        <div className="flex items-center gap-1.5 text-xs text-orange-600">
          <AlertTriangle className="h-3 w-3 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Expanded edit panel for selected image */}
      {editingImage !== null && images[editingImage] && (
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 space-y-2">
          <div className="flex items-start gap-3">
            {/* Larger preview */}
            <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
              <img
                src={images[editingImage].url}
                alt={images[editingImage].alt || 'Preview'}
                className="w-full h-full object-cover cursor-pointer"
                onClick={() => setSelectedImage(editingImage)}
              />
              <button
                type="button"
                onClick={() => setSelectedImage(editingImage)}
                className="absolute bottom-1 right-1 p-1 bg-white/90 rounded shadow-sm"
              >
                <ZoomIn className="h-3 w-3 text-gray-600" />
              </button>
            </div>

            {/* Edit fields */}
            <div className="flex-1 space-y-2 min-w-0">
              <div>
                <label className="block text-[10px] font-medium text-gray-500 mb-0.5">
                  Alt Text <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={images[editingImage].alt || ''}
                  onChange={(e) => handleUpdateAlt(editingImage, e.target.value)}
                  className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:ring-1 focus:ring-[#1A403D] focus:border-[#1A403D]"
                  placeholder="Describe the image for SEO"
                />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-gray-500 mb-0.5">Caption</label>
                <input
                  type="text"
                  value={images[editingImage].caption || ''}
                  onChange={(e) => handleUpdateCaption(editingImage, e.target.value)}
                  className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:ring-1 focus:ring-[#1A403D] focus:border-[#1A403D]"
                  placeholder="Optional caption"
                />
              </div>
              <div className="flex items-center gap-2 pt-1">
                {!images[editingImage].isMain && (
                  <button
                    type="button"
                    onClick={() => handleSetMainImage(editingImage)}
                    className="text-[10px] px-2 py-1 bg-[#1A403D] text-white rounded hover:bg-[#152f2d] transition-colors flex items-center gap-1"
                  >
                    <Star className="h-3 w-3" /> Set as featured
                  </button>
                )}
                {images[editingImage].isMain && (
                  <span className="text-[10px] px-2 py-1 bg-yellow-100 text-yellow-700 rounded flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-500" /> Featured image
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => handleRemoveImage(editingImage)}
                  className="text-[10px] px-2 py-1 text-red-600 hover:bg-red-50 rounded transition-colors flex items-center gap-1 ml-auto"
                >
                  <X className="h-3 w-3" /> Remove
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {selectedImage !== null && images[selectedImage] && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img
              src={images[selectedImage].url}
              alt={images[selectedImage].alt || 'Preview'}
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
            <button
              className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-lg"
              onClick={() => setSelectedImage(null)}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OptimizedImageUpload;
