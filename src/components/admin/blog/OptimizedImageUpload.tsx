"use client";

import React, { useState, useCallback } from 'react';
import {
    Upload, X, Check, AlertCircle, Image as ImageIcon,
    Loader2, ZoomIn, AlertTriangle
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

    const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;

        setError('');
        setIsUploading(true);
        setOptimizationStats(null);

        try {
            const newImages: ImageData[] = [];

            for (const file of files) {
                // Validate file
                const validation = validateImageFile(file, 10); // 10MB max
                if (!validation.valid) {
                    setError(validation.error || 'Invalid file');
                    continue;
                }

                setUploadProgress(`Optimizing ${file.name}...`);

                // Optimize image on client side
                const optimizationResult = await optimizeImage(file, {
                    maxWidth: 1920,
                    maxHeight: 1080,
                    quality: 0.85,
                    format: 'jpeg'
                });

                setOptimizationStats(optimizationResult);

                // Check featured image dimensions if needed
                if (isFeaturedImage) {
                    const dimensionCheck = await checkFeaturedImageDimensions(optimizationResult.file);
                    if (!dimensionCheck.suitable && dimensionCheck.recommendation) {
                        setError(dimensionCheck.recommendation);
                        // Still allow upload but show warning
                    }
                }

                setUploadProgress(`Uploading ${file.name}...`);

                try {
                    // Upload to server (will get blob URL immediately for preview)
                    const url = await onFileUpload(optimizationResult.file);

                    // Create image data with suggested alt text
                    newImages.push({
                        url,
                        alt: suggestAltText(file.name),
                        caption: '',
                        isMain: isFeaturedImage || (images.length === 0 && newImages.length === 0)
                    });
                } catch (uploadError) {
                    console.error('Upload error:', uploadError);
                    // Even if upload fails, create preview with blob URL for user to see
                    const blobUrl = URL.createObjectURL(optimizationResult.file);
                    newImages.push({
                        url: blobUrl,
                        alt: suggestAltText(file.name),
                        caption: '',
                        isMain: isFeaturedImage || (images.length === 0 && newImages.length === 0)
                    });
                    setError(`Note: ${file.name} will upload when you save (backend image optimization pending)`);
                }
            }

            // Update images
            onImagesChange([...images, ...newImages]);

        } catch (err) {
            console.error('Image processing error:', err);
            setError(err instanceof Error ? err.message : 'Failed to process image');
        } finally {
            setIsUploading(false);
            setUploadProgress('');

            // Clear file input
            e.target.value = '';
        }
    }, [images, onImagesChange, onFileUpload, isFeaturedImage]);

    const handleRemoveImage = (index: number) => {
        const updatedImages = images.filter((_, i) => i !== index);
        onImagesChange(updatedImages);
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
        <div className="space-y-4">
            {/* Upload Area */}
            {canAddMore && (
                <div className="relative">
                    <input
                        type="file"
                        accept="image/*"
                        multiple={!isFeaturedImage}
                        onChange={handleFileSelect}
                        disabled={isUploading}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
                        id="image-upload"
                    />
                    <label
                        htmlFor="image-upload"
                        className={`
 flex flex-col items-center justify-center w-full h-48
 border-2 border-dashed rounded-lg cursor-pointer transition-all
 ${isUploading
 ? 'border-[#1A403D] bg-blue-50'
 : 'border-gray-300 hover:border-[#1A403D] bg-gray-50 hover:bg-blue-50'
 }
 `}
 >
 {isUploading ? (
 <div className="flex flex-col items-center gap-3">
 <Loader2 className="h-12 w-12 text-[#1A403D] animate-spin" />
 <div className="text-center">
 <div className="text-sm font-medium text-gray-900 ">
 {uploadProgress}
 </div>
 {optimizationStats && (
 <div className="text-xs text-gray-600 mt-2">
 Compressed {formatBytes(optimizationStats.originalSize)} → {formatBytes(optimizationStats.optimizedSize)}
 <span className="text-green-600 ml-1">
 ({optimizationStats.compressionRatio.toFixed(1)}% savings)
 </span>
 </div>
 )}
 </div>
 </div>
 ) : (
 <>
 <Upload className="h-12 w-12 text-gray-400 mb-3" />
 <div className="text-center">
 <span className="text-sm font-medium text-gray-900 ">
 Click to upload {isFeaturedImage ? 'featured image' : 'images'}
 </span>
 <p className="text-xs text-gray-500 mt-1">
 PNG, JPG, WebP up to 10MB
 </p>
 <p className="text-xs text-[#1A403D] mt-1">
 Images will be automatically optimized
 </p>
 </div>
 </>
 )}
 </label>
 </div>
 )}

 {/* Error Message */}
 {error && (
 <div className="flex items-start gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
 <AlertTriangle className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
 <div className="text-sm text-orange-700 ">{error}</div>
 </div>
 )}

 {/* Image Grid */}
 {images.length > 0 && (
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {images.map((image, index) => (
 <div
 key={index}
 className={`relative group bg-white rounded-lg border-2 transition-all ${
 image.isMain
 ? 'border-[#1A403D] ring-2 ring-blue-200'
 : 'border-gray-200'
 }`}
 >
 {/* Image Preview */}
 <div className="relative aspect-video bg-gray-100 rounded-t-lg overflow-hidden">
 {image.url && (
 <img
 src={image.url}
 alt={image.alt || 'Preview'}
 className="w-full h-full object-cover"
 />
 )}

 {/* Main Badge */}
 {image.isMain && (
 <div className="absolute top-2 left-2 px-2 py-1 bg-[#1A403D] text-white text-xs font-medium rounded-full flex items-center gap-1">
 <Check className="h-3 w-3" />
 Featured
 </div>
 )}

 {/* Actions */}
 <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
 {!image.isMain && (
 <button
 type="button"
 onClick={() => handleSetMainImage(index)}
 className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors"
 title="Set as featured image"
 >
 <ImageIcon className="h-4 w-4 text-gray-700 " />
 </button>
 )}
 <button
 type="button"
 onClick={() => setSelectedImage(index)}
 className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors"
 title="Preview"
 >
 <ZoomIn className="h-4 w-4 text-gray-700 " />
 </button>
 <button
 type="button"
 onClick={() => handleRemoveImage(index)}
 className="p-2 bg-white rounded-full shadow-lg hover:bg-red-50 transition-colors"
 title="Remove"
 >
 <X className="h-4 w-4 text-red-600 " />
 </button>
 </div>
 </div>

 {/* Image Details */}
 <div className="p-3 space-y-2">
 {/* Alt Text */}
 <div>
 <label className="block text-xs font-medium text-gray-700 mb-1">
 Alt Text (Required for SEO)
 </label>
 <input
 type="text"
 value={image.alt || ''}
 onChange={(e) => handleUpdateAlt(index, e.target.value)}
 className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded bg-white text-gray-900 focus:ring-2 focus:ring-[#1A403D]"
 placeholder="Describe the image"
 />
 {!image.alt && (
 <div className="flex items-center gap-1 mt-1 text-xs text-orange-600 ">
 <AlertCircle className="h-3 w-3" />
 Alt text is missing
 </div>
 )}
 </div>

 {/* Caption (Optional) */}
 <div>
 <label className="block text-xs font-medium text-gray-700 mb-1">
 Caption (Optional)
 </label>
 <input
 type="text"
 value={image.caption || ''}
 onChange={(e) => handleUpdateCaption(index, e.target.value)}
 className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded bg-white text-gray-900 focus:ring-2 focus:ring-[#1A403D]"
 placeholder="Optional caption"
 />
 </div>
 </div>
 </div>
 ))}
 </div>
 )}

 {/* Stats */}
 {images.length > 0 && (
 <div className="flex items-center justify-between text-sm text-gray-600 ">
 <span>{images.length} image{images.length !== 1 ? 's' : ''} uploaded</span>
 {!canAddMore && (
 <span className="text-orange-600 ">
 Maximum {maxImages} images reached
 </span>
 )}
 </div>
 )}

 {/* Image Preview Modal */}
 {selectedImage !== null && images[selectedImage] && (
 <div
 className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
 onClick={() => setSelectedImage(null)}
 >
 <div className="relative max-w-6xl max-h-screen">
 <img
 src={images[selectedImage].url}
 alt={images[selectedImage].alt || 'Preview'}
 className="max-w-full max-h-screen object-contain rounded-lg"
 />
 <button
 className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg"
 onClick={() => setSelectedImage(null)}
 >
 <X className="h-6 w-6" />
 </button>
 </div>
 </div>
 )}
 </div>
 );
};

export default OptimizedImageUpload;
