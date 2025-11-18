// src/components/admin/blog/UnifiedBlogForm.tsx
'use client';

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

// NEW: Import optimization utilities
import { generateSEOSlug, calculateReadingTime as calculateReadTime } from '@/lib/utils/seoUtils';
import { optimizeImage } from '@/lib/utils/imageOptimization';

// NEW: Import new components
import SEOScoreCard from './SEOScoreCard';
import SmartSlugInput from './SmartSlugInput';
import OptimizedImageUpload from './OptimizedImageUpload';
import ImprovedRichTextEditor from './ImprovedRichTextEditor';

// ============================================================================
// TYPES
// ============================================================================

interface UnifiedBlogFormProps {
    blogId?: number;
    initialData?: Blog;
}

interface FormData {
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
    featured: boolean;
    seoTitle: string;
    seoDescription: string;
    tagIds: number[];
    categoryIds: number[];
    images: BlogImage[];
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

// REMOVED: Now using generateSEOSlug from @/lib/utils/seoUtils
// This new function removes stop words and limits slug length for better SEO

// REMOVED: Now using calculateReadingTime (imported as calculateReadTime) from @/lib/utils/seoUtils
// The new function provides more accurate reading time calculation

const validateImageFile = (file: File): { valid: boolean; error?: string } => {
    if (!file.type.startsWith('image/')) {
        return { valid: false, error: 'File must be an image' };
    }
    if (file.size > 10 * 1024 * 1024) {
        return { valid: false, error: 'Image must be less than 10MB' };
    }
    return { valid: true };
};

// ============================================================================
// AUTO-SAVE INDICATOR
// ============================================================================

const AutoSaveIndicator: React.FC<{ status: 'saving' | 'saved' | 'error' | null }> = ({ status }) => {
    if (!status) return null;

    return (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium animate-in fade-in duration-200"
            style={{
                backgroundColor: status === 'saved' ? '#dcfce7' : status === 'error' ? '#fee2e2' : '#e0e7ff',
                color: status === 'saved' ? '#166534' : status === 'error' ? '#991b1b' : '#3730a3'
            }}>
            {status === 'saving' && <Clock className="h-3 w-3 animate-spin" />}
            {status === 'saved' && <CheckCircle2 className="h-3 w-3" />}
            {status === 'error' && <XCircle className="h-3 w-3" />}
            <span>{status === 'saving' ? 'Saving...' : status === 'saved' ? 'All changes saved' : 'Save failed'}</span>
        </div>
    );
};

// ============================================================================
// ENHANCED RICH TEXT EDITOR
// ============================================================================

const RichTextEditor: React.FC<{
    content: string;
    onChange: (content: string) => void;
    onImageUpload: (file: File) => Promise<string>;
}> = ({ content, onChange, onImageUpload }) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [wordCount, setWordCount] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showLinkDialog, setShowLinkDialog] = useState(false);
    const [linkUrl, setLinkUrl] = useState('');

    useEffect(() => {
        if (editorRef.current && content && !editorRef.current.innerHTML) {
            editorRef.current.innerHTML = content;
        }
        updateWordCount();
    }, [content]);

    const updateWordCount = () => {
        if (editorRef.current) {
            const text = editorRef.current.innerText;
            const words = text.trim().split(/\s+/).filter(w => w.length > 0);
            setWordCount(words.length);
        }
    };

    const execCommand = (command: string, value: string = '') => {
        document.execCommand(command, false, value);
        editorRef.current?.focus();
        handleContentChange();
    };

    const handleContentChange = () => {
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
            updateWordCount();
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const validation = validateImageFile(file);
        if (!validation.valid) {
            alert(validation.error);
            return;
        }

        setUploading(true);
        try {
            const url = await onImageUpload(file);
            const imgHtml = `<figure style="margin: 20px 0;"><img src="${url}" alt="Blog image" style="max-width: 100%; height: auto; border-radius: 12px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);" /><figcaption style="text-align: center; color: #6b7280; font-size: 14px; margin-top: 8px;">Add caption here</figcaption></figure>`;
            execCommand('insertHTML', imgHtml);
        } catch (error) {
            alert('Failed to upload image');
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const insertLink = () => {
        if (linkUrl) {
            execCommand('createLink', linkUrl);
            setLinkUrl('');
            setShowLinkDialog(false);
        }
    };

    const toolbarButtons = [
        { icon: Bold, command: 'bold', title: 'Bold (Ctrl+B)', group: 'text' },
        { icon: Italic, command: 'italic', title: 'Italic (Ctrl+I)', group: 'text' },
        { icon: Type, command: 'underline', title: 'Underline (Ctrl+U)', group: 'text' },
        { icon: List, command: 'insertUnorderedList', title: 'Bullet List', group: 'list' },
        { icon: Hash, command: 'insertOrderedList', title: 'Numbered List', group: 'list' },
        { icon: AlignLeft, command: 'justifyLeft', title: 'Align Left', group: 'align' },
        { icon: AlignCenter, command: 'justifyCenter', title: 'Align Center', group: 'align' },
        { icon: AlignRight, command: 'justifyRight', title: 'Align Right', group: 'align' },
        { icon: Quote, command: 'formatBlock', value: 'blockquote', title: 'Quote', group: 'format' },
    ];

    const headingButtons = [
        { label: 'H1', command: 'formatBlock', value: 'h1' },
        { label: 'H2', command: 'formatBlock', value: 'h2' },
        { label: 'H3', command: 'formatBlock', value: 'h3' },
        { label: 'P', command: 'formatBlock', value: 'p' },
    ];

    return (
        <div className={`border-2 border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-white dark:bg-gray-800 transition-all duration-300 ${isFullscreen ? 'fixed inset-4 z-50' : ''}`}>
            {/* Enhanced Toolbar */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border-b-2 border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between p-3">
                    <div className="flex items-center gap-2 flex-wrap">
                        {/* Text Formatting */}
                        <div className="flex items-center gap-1 bg-white dark:bg-gray-700 rounded-lg p-1 shadow-sm">
                            {toolbarButtons.filter(b => b.group === 'text').map((btn, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => execCommand(btn.command, btn.value)}
                                    className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-all hover:scale-110"
                                    title={btn.title}
                                >
                                    <btn.icon className="h-4 w-4 text-gray-700 dark:text-gray-300" />
                                </button>
                            ))}
                        </div>

                        {/* Headings */}
                        <div className="flex items-center gap-1 bg-white dark:bg-gray-700 rounded-lg p-1 shadow-sm">
                            {headingButtons.map((btn, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => execCommand(btn.command, btn.value)}
                                    className="px-3 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded font-semibold text-sm transition-all hover:scale-105"
                                >
                                    {btn.label}
                                </button>
                            ))}
                        </div>

                        {/* Lists */}
                        <div className="flex items-center gap-1 bg-white dark:bg-gray-700 rounded-lg p-1 shadow-sm">
                            {toolbarButtons.filter(b => b.group === 'list').map((btn, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => execCommand(btn.command, btn.value)}
                                    className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-all hover:scale-110"
                                    title={btn.title}
                                >
                                    <btn.icon className="h-4 w-4 text-gray-700 dark:text-gray-300" />
                                </button>
                            ))}
                        </div>

                        {/* Alignment */}
                        <div className="flex items-center gap-1 bg-white dark:bg-gray-700 rounded-lg p-1 shadow-sm">
                            {toolbarButtons.filter(b => b.group === 'align').map((btn, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => execCommand(btn.command, btn.value)}
                                    className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-all hover:scale-110"
                                    title={btn.title}
                                >
                                    <btn.icon className="h-4 w-4 text-gray-700 dark:text-gray-300" />
                                </button>
                            ))}
                        </div>

                        {/* Special */}
                        <div className="flex items-center gap-1 bg-white dark:bg-gray-700 rounded-lg p-1 shadow-sm">
                            <button
                                type="button"
                                onClick={() => setShowLinkDialog(true)}
                                className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-all hover:scale-110"
                                title="Insert Link"
                            >
                                <Link2 className="h-4 w-4 text-gray-700 dark:text-gray-300" />
                            </button>
                            <button
                                type="button"
                                onClick={() => execCommand('formatBlock', 'blockquote')}
                                className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-all hover:scale-110"
                                title="Quote"
                            >
                                <Quote className="h-4 w-4 text-gray-700 dark:text-gray-300" />
                            </button>
                            <button
                                type="button"
                                onClick={() => execCommand('insertHorizontalRule')}
                                className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-all hover:scale-110"
                                title="Horizontal Line"
                            >
                                <Layers className="h-4 w-4 text-gray-700 dark:text-gray-300" />
                            </button>
                        </div>

                        {/* Image Upload */}
                        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg shadow-sm transition-all hover:scale-105 disabled:opacity-50"
                        >
                            {uploading ? <Clock className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
                            <span className="text-sm font-medium">Image</span>
                        </button>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="text-xs text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-700 px-3 py-2 rounded-lg shadow-sm">
                            <span className="font-semibold">{wordCount}</span> words
                            <span className="mx-1">•</span>
                            <span className="font-semibold">{Math.ceil(wordCount / 200)}</span> min read
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsFullscreen(!isFullscreen)}
                            className="p-2 hover:bg-white dark:hover:bg-gray-700 rounded-lg transition-all"
                            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                        >
                            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Editor Content */}
            <div
                ref={editorRef}
                contentEditable
                onInput={handleContentChange}
                className="p-6 focus:outline-none prose prose-lg dark:prose-invert max-w-none"
                style={{
                    minHeight: isFullscreen ? 'calc(100vh - 200px)' : '500px',
                    lineHeight: 1.8,
                    fontSize: '16px'
                }}
                data-placeholder="Start writing your amazing content..."
            />

            {/* Link Dialog */}
            {showLinkDialog && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-2xl max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold mb-4">Insert Link</h3>
                        <Input
                            value={linkUrl}
                            onChange={(e) => setLinkUrl(e.target.value)}
                            placeholder="https://example.com"
                            onKeyPress={(e) => e.key === 'Enter' && insertLink()}
                            autoFocus
                        />
                        <div className="flex gap-3 mt-4">
                            <ActionButton onClick={insertLink} variant="primary" className="flex-1">Insert</ActionButton>
                            <ActionButton onClick={() => setShowLinkDialog(false)} variant="secondary" className="flex-1">Cancel</ActionButton>
                        </div>
                    </div>
                </div>
            )}

            <style jsx global>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          font-style: italic;
        }
        [contenteditable] img {
          max-width: 100%;
          height: auto;
          border-radius: 12px;
          margin: 20px 0;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
        }
        [contenteditable] blockquote {
          border-left: 4px solid #3b82f6;
          padding-left: 20px;
          margin: 20px 0;
          font-style: italic;
          color: #6b7280;
          background: #f9fafb;
          padding: 16px 20px;
          border-radius: 8px;
        }
        [contenteditable] h1, [contenteditable] h2, [contenteditable] h3 {
          margin-top: 32px;
          margin-bottom: 16px;
          font-weight: 700;
          line-height: 1.3;
        }
        [contenteditable] ul, [contenteditable] ol {
          padding-left: 28px;
          margin: 16px 0;
        }
        [contenteditable] li {
          margin: 8px 0;
        }
        [contenteditable] a {
          color: #3b82f6;
          text-decoration: underline;
        }
        [contenteditable] hr {
          border: none;
          border-top: 2px solid #e5e7eb;
          margin: 32px 0;
        }
      `}</style>
        </div>
    );
};

// ============================================================================
// PREMIUM IMAGE GALLERY
// ============================================================================

const PremiumImageGallery: React.FC<{
    images: BlogImage[];
    onChange: (images: BlogImage[]) => void;
    onUpload: (file: File) => Promise<string>;
}> = ({ images, onChange, onUpload }) => {
    const [uploading, setUploading] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
        await handleFiles(files);
    };

    const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        await handleFiles(files);
    };

    const handleFiles = async (files: File[]) => {
        if (files.length === 0) return;

        setUploading(true);
        try {
            const uploadPromises = files.map(async (file) => {
                const validation = validateImageFile(file);
                if (!validation.valid) throw new Error(validation.error);
                const url = await onUpload(file);
                return { url, alt: '', caption: '', isMain: images.length === 0 };
            });
            const newImages = await Promise.all(uploadPromises);
            onChange([...images, ...newImages]);
        } catch (error: any) {
            alert(error.message || 'Failed to upload images');
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const removeImage = (index: number) => {
        onChange(images.filter((_, i) => i !== index));
    };

    const setAsMain = (index: number) => {
        onChange(images.map((img, i) => ({ ...img, isMain: i === index })));
    };

    const updateImageData = (index: number, field: 'alt' | 'caption', value: string) => {
        onChange(images.map((img, i) => i === index ? { ...img, [field]: value } : img));
    };

    return (
        <div className="space-y-4">
            {/* Gallery Grid */}
            {images.length > 0 && (
                <div className="grid grid-cols-2 gap-4">
                    {images.map((img, index) => (
                        <div key={index} className="group relative bg-white dark:bg-gray-800 rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-600 transition-all duration-300 hover:shadow-xl">
                            <div className="aspect-video relative overflow-hidden">
                                <img
                                    src={img.url}
                                    alt={img.alt || 'Blog image'}
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                />

                                {/* Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
                                    <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2">
                                        <input
                                            type="text"
                                            placeholder="Alt text..."
                                            value={img.alt}
                                            onChange={(e) => updateImageData(index, 'alt', e.target.value)}
                                            className="w-full px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-lg text-sm border-0 focus:ring-2 focus:ring-blue-500"
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                        <input
                                            type="text"
                                            placeholder="Caption..."
                                            value={img.caption}
                                            onChange={(e) => updateImageData(index, 'caption', e.target.value)}
                                            className="w-full px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-lg text-sm border-0 focus:ring-2 focus:ring-blue-500"
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <button
                                        type="button"
                                        onClick={() => setAsMain(index)}
                                        className={`p-2 rounded-full backdrop-blur-sm transition-all duration-300 ${img.isMain
                                                ? 'bg-yellow-500 text-white scale-110 shadow-lg'
                                                : 'bg-white/90 hover:bg-yellow-500 hover:text-white'
                                            }`}
                                        title="Set as featured"
                                    >
                                        <Star className={`h-4 w-4 ${img.isMain ? 'fill-current' : ''}`} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => removeImage(index)}
                                        className="p-2 bg-red-500/90 hover:bg-red-600 text-white rounded-full backdrop-blur-sm transition-all duration-300 hover:scale-110"
                                        title="Remove"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>

                                {/* Featured Badge */}
                                {img.isMain && (
                                    <div className="absolute top-3 left-3 px-3 py-1.5 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold rounded-full shadow-lg flex items-center gap-1 animate-in slide-in-from-left duration-300">
                                        <Star className="h-3 w-3 fill-current" />
                                        FEATURED
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Upload Zone */}
            <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                className={`relative border-3 border-dashed rounded-xl p-8 text-center transition-all duration-300 cursor-pointer group ${dragOver
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-105'
                        : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/10'
                    }`}
                onClick={() => fileInputRef.current?.click()}
            >
                {uploading ? (
                    <div className="flex flex-col items-center gap-4">
                        <div className="relative">
                            <Clock className="h-16 w-16 text-blue-500 animate-spin" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="h-8 w-8 bg-blue-500 rounded-full animate-ping opacity-20"></div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">Uploading images...</p>
                            <p className="text-sm text-gray-500">Please wait while we process your files</p>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="relative mb-4">
                            <ImageIcon className="h-20 w-20 text-gray-400 dark:text-gray-500 mx-auto group-hover:scale-110 transition-transform duration-300" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="h-24 w-24 bg-blue-500/10 rounded-full animate-pulse"></div>
                            </div>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                            Drop images here or click to browse
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                            Support for PNG, JPG, GIF, WebP up to 10MB each
                        </p>
                        <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 font-medium">
                            <Upload className="h-5 w-5" />
                            Choose Files
                        </div>
                    </>
                )}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileInput}
                    className="hidden"
                />
            </div>

            {images.length > 0 && (
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                        <Info className="h-5 w-5" />
                        <span className="text-sm font-medium">
                            {images.length} image{images.length > 1 ? 's' : ''} •
                            {images.filter(img => img.isMain).length > 0 ? ' Featured image set' : ' No featured image'}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

// ============================================================================
// PREMIUM CATEGORY & TAG MANAGER
// ============================================================================

const PremiumCategoryTagManager: React.FC<{
    selectedCategories: number[];
    selectedTags: number[];
    availableCategories: Category[];
    availableTags: Tag[];
    onCategoriesChange: (ids: number[]) => void;
    onTagsChange: (ids: number[]) => void;
    onAddCategory: (name: string) => Promise<Category>;
    onAddTag: (name: string) => Promise<Tag>;
}> = ({ selectedCategories, selectedTags, availableCategories, availableTags, onCategoriesChange, onTagsChange, onAddCategory, onAddTag }) => {
    const [categorySearch, setCategorySearch] = useState('');
    const [tagSearch, setTagSearch] = useState('');
    const [showAddCategory, setShowAddCategory] = useState(false);
    const [showAddTag, setShowAddTag] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newTagName, setNewTagName] = useState('');
    const [adding, setAdding] = useState(false);

    const filteredCategories = availableCategories.filter(c =>
        c.name.toLowerCase().includes(categorySearch.toLowerCase())
    );
    const filteredTags = availableTags.filter(t =>
        t.name.toLowerCase().includes(tagSearch.toLowerCase())
    );

    const toggleCategory = (id: number) => {
        onCategoriesChange(
            selectedCategories.includes(id)
                ? selectedCategories.filter(c => c !== id)
                : [...selectedCategories, id]
        );
    };


    const toggleTag = (id: number) => {
        onTagsChange(
            selectedTags.includes(id)
                ? selectedTags.filter(t => t !== id)
                : [...selectedTags, id]
        );
    };

    const handleAddCategory = async () => {
        if (!newCategoryName.trim()) return;
        setAdding(true);
        try {
            const newCat = await onAddCategory(newCategoryName.trim());
            onCategoriesChange([...selectedCategories, newCat.id]);
            setNewCategoryName('');
            setShowAddCategory(false);
        } finally {
            setAdding(false);
        }
    };

    const handleAddTag = async () => {
        if (!newTagName.trim()) return;
        setAdding(true);
        try {
            const newTag = await onAddTag(newTagName.trim());
            onTagsChange([...selectedTags, newTag.id]);
            setNewTagName('');
            setShowAddTag(false);
        } finally {
            setAdding(false);
        }
    };

    // Return the combined Categories and Tags UI here so the component returns JSX
    return (
        <div className="space-y-6">
            {/* Categories */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 rounded-xl p-5 border-2 border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-blue-500 rounded-lg">
                            <Folder className="h-5 w-5 text-white" />
                        </div>
                        <label className="text-lg font-bold text-gray-900 dark:text-white">Categories</label>
                    </div>
                    <button
                        type="button"
                        onClick={() => setShowAddCategory(!showAddCategory)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all hover:scale-105 text-sm font-medium shadow-sm"
                    >
                        <Plus className="h-3 w-3" />
                        Add New
                    </button>
                </div>

                {showAddCategory && (
                    <div className="mb-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg border-2 border-blue-300 dark:border-blue-700 animate-in slide-in-from-top duration-300">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="New category name..."
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
                                className="flex-1 px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                                autoFocus
                            />
                            <button
                                type="button"
                                onClick={handleAddCategory}
                                disabled={adding}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all hover:scale-105 disabled:opacity-50 shadow-sm"
                            >
                                {adding ? <Clock className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                            </button>
                            <button
                                type="button"
                                onClick={() => { setShowAddCategory(false); setNewCategoryName(''); }}
                                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg transition-all"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                )}

                <div className="relative mb-3">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search categories..."
                        value={categorySearch}
                        onChange={(e) => setCategorySearch(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 transition-all"
                    />
                </div>

                <div className="max-h-64 overflow-y-auto bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 shadow-inner">
                    {filteredCategories.length > 0 ? (
                        filteredCategories.map(cat => (
                            <label
                                key={cat.id}
                                className="flex items-center p-4 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-b-0 transition-all group"
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedCategories.includes(cat.id)}
                                    onChange={() => toggleCategory(cat.id)}
                                    className="h-5 w-5 rounded border-2 border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 transition-all"
                                />
                                <Folder className="h-5 w-5 text-blue-500 mx-3 group-hover:scale-110 transition-transform" />
                                <span className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                    {cat.name}
                                </span>
                            </label>
                        ))
                    ) : (
                        <div className="p-8 text-center text-gray-500">
                            <Folder className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No categories found</p>
                        </div>
                    )}
                </div>

                {selectedCategories.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                        {selectedCategories.map(id => {
                            const cat = availableCategories.find(c => c.id === id);
                            return cat ? (
                                <span
                                    key={id}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 text-blue-700 dark:text-blue-300 rounded-full font-medium border-2 border-blue-300 dark:border-blue-700 shadow-sm hover:shadow-md transition-all hover:scale-105"
                                >
                                    <Folder className="h-4 w-4" />
                                    {cat.name}
                                    <button type="button" onClick={() => toggleCategory(id)} className="hover:bg-blue-100 dark:hover:bg-blue-900 rounded-full p-1 transition-all">
                                        <X className="h-3 w-3" />
                                    </button>
                                </span>
                            ) : null;
                        })}
                    </div>
                )}
            </div>

            {/* Tags */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 rounded-xl p-5 border-2 border-green-200 dark:border-green-800">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-green-500 rounded-lg">
                            <TagIcon className="h-5 w-5 text-white" />
                        </div>
                        <label className="text-lg font-bold text-gray-900 dark:text-white">Tags</label>
                    </div>
                    <button
                        type="button"
                        onClick={() => setShowAddTag(!showAddTag)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all hover:scale-105 text-sm font-medium shadow-sm"
                    >
                        <Plus className="h-3 w-3" />
                        Add New
                    </button>
                </div>

                {showAddTag && (
                    <div className="mb-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg border-2 border-green-300 dark:border-green-700 animate-in slide-in-from-top duration-300">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="New tag name..."
                                value={newTagName}
                                onChange={(e) => setNewTagName(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                                className="flex-1 px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700"
                                autoFocus
                            />
                            <button
                                type="button"
                                onClick={handleAddTag}
                                disabled={adding}
                                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all hover:scale-105 disabled:opacity-50 shadow-sm"
                            >
                                {adding ? <Clock className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                            </button>
                            <button
                                type="button"
                                onClick={() => { setShowAddTag(false); setNewTagName(''); }}
                                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg transition-all"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                )}

                <div className="relative mb-3">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search tags..."
                        value={tagSearch}
                        onChange={(e) => setTagSearch(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 transition-all"
                    />
                </div>

                <div className="max-h-64 overflow-y-auto bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 shadow-inner">
                    {filteredTags.length > 0 ? (
                        filteredTags.map(tag => (
                            <label
                                key={tag.id}
                                className="flex items-center p-4 hover:bg-green-50 dark:hover:bg-green-900/20 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-b-0 transition-all group"
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedTags.includes(tag.id)}
                                    onChange={() => toggleTag(tag.id)}
                                    className="h-5 w-5 rounded border-2 border-gray-300 text-green-600 focus:ring-2 focus:ring-green-500 transition-all"
                                />
                                <TagIcon className="h-5 w-5 text-green-500 mx-3 group-hover:scale-110 transition-transform" />
                                <span className="font-medium text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                                    {tag.name}
                                </span>
                            </label>
                        ))
                    ) : (
                        <div className="p-8 text-center text-gray-500">
                            <TagIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No tags found</p>
                        </div>
                    )}
                </div>

                {selectedTags.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                        {selectedTags.map(id => {
                            const tag = availableTags.find(t => t.id === id);
                            return tag ? (
                                <span
                                    key={id}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 text-green-700 dark:text-green-300 rounded-full font-medium border-2 border-green-300 dark:border-green-700 shadow-sm hover:shadow-md transition-all hover:scale-105"
                                >
                                    <TagIcon className="h-4 w-4" />
                                    {tag.name}
                                    <button type="button" onClick={() => toggleTag(id)} className="hover:bg-green-100 dark:hover:bg-green-900 rounded-full p-1 transition-all">
                                        <X className="h-3 w-3" />
                                    </button>
                                </span>
                            ) : null;
                        })}
                    </div>
                )}
            </div>
        </div>
    );

    // ============================================================================
    // SEO OPTIMIZER
    // ============================================================================


}

const SEOOptimizer: React.FC<{
    seoTitle: string;
    seoDescription: string;
    onSeoTitleChange: (value: string) => void;
    onSeoDescriptionChange: (value: string) => void;
}> = ({ seoTitle, seoDescription, onSeoTitleChange, onSeoDescriptionChange }) => {
    const titleLength = seoTitle.length;
    const descLength = seoDescription.length;

    const getTitleStatus = () => {
        if (titleLength === 0) return { color: 'text-gray-500', bg: 'bg-gray-100', message: 'Not set' };
        if (titleLength < 30) return { color: 'text-yellow-600', bg: 'bg-yellow-100', message: 'Too short' };
        if (titleLength > 60) return { color: 'text-red-600', bg: 'bg-red-100', message: 'Too long' };
        return { color: 'text-green-600', bg: 'bg-green-100', message: 'Perfect!' };
    };

    const getDescStatus = () => {
        if (descLength === 0) return { color: 'text-gray-500', bg: 'bg-gray-100', message: 'Not set' };
        if (descLength < 70) return { color: 'text-yellow-600', bg: 'bg-yellow-100', message: 'Too short' };
        if (descLength > 160) return { color: 'text-red-600', bg: 'bg-red-100', message: 'Too long' };
        return { color: 'text-green-600', bg: 'bg-green-100', message: 'Perfect!' };
    };

    const titleStatus = getTitleStatus();
    const descStatus = getDescStatus();

    return (
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/10 dark:to-pink-900/10 rounded-xl p-6 border-2 border-purple-200 dark:border-purple-800 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg">
                    <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">SEO Optimization</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Boost your search rankings</p>
                </div>
            </div>

            <div className="space-y-6">
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">SEO Title</label>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${titleStatus.bg} ${titleStatus.color}`}>
                            {titleStatus.message}
                        </span>
                    </div>
                    <input
                        type="text"
                        value={seoTitle}
                        onChange={(e) => onSeoTitleChange(e.target.value)}
                        placeholder="Enter SEO-optimized title (30-60 chars)"
                        className="w-full px-4 py-3 border-2 border-purple-200 dark:border-purple-700 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 font-medium transition-all"
                        maxLength={70}
                    />
                    <div className="flex justify-between mt-2 text-xs font-medium">
                        <span className={titleStatus.color}>{titleLength}/60 characters</span>
                        <div className="flex items-center gap-1">
                            <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div
                                    className={`h-full transition-all duration-300 ${titleLength === 0 ? 'bg-gray-400' :
                                            titleLength < 30 ? 'bg-yellow-500' :
                                                titleLength > 60 ? 'bg-red-500' : 'bg-green-500'
                                        }`}
                                    style={{ width: `${Math.min((titleLength / 60) * 100, 100)}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Meta Description</label>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${descStatus.bg} ${descStatus.color}`}>
                            {descStatus.message}
                        </span>
                    </div>
                    <textarea
                        value={seoDescription}
                        onChange={(e) => onSeoDescriptionChange(e.target.value)}
                        placeholder="Enter meta description (70-160 chars)"
                        className="w-full px-4 py-3 border-2 border-purple-200 dark:border-purple-700 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 font-medium resize-none transition-all"
                        rows={3}
                        maxLength={170}
                    />
                    <div className="flex justify-between mt-2 text-xs font-medium">
                        <span className={descStatus.color}>{descLength}/160 characters</span>
                        <div className="flex items-center gap-1">
                            <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div
                                    className={`h-full transition-all duration-300 ${descLength === 0 ? 'bg-gray-400' :
                                            descLength < 70 ? 'bg-yellow-500' :
                                                descLength > 160 ? 'bg-red-500' : 'bg-green-500'
                                        }`}
                                    style={{ width: `${Math.min((descLength / 160) * 100, 100)}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border-2 border-purple-200 dark:border-purple-700">
                    <h4 className="text-sm font-bold text-purple-900 dark:text-purple-100 mb-3 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        SEO Best Practices
                    </h4>
                    <ul className="space-y-2 text-xs text-gray-700 dark:text-gray-300">
                        <li className="flex items-start gap-2">
                            <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                            <span>Include primary keywords naturally in title</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                            <span>Write compelling, action-oriented descriptions</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                            <span>Keep titles under 60 characters for best display</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                            <span>Descriptions between 70-160 characters perform best</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

// ============================================================================
// MAIN UNIFIED FORM - CONTINUED
// ============================================================================

export default function UnifiedBlogForm({ blogId, initialData }: UnifiedBlogFormProps) {
    const router = useRouter();
    const { data: session } = useSession();
    const { addToast } = useToast();
    const isEditMode = !!blogId;

    const [formData, setFormData] = useState<FormData>({
        title: initialData?.title || '',
        slug: initialData?.slug || '',
        excerpt: initialData?.excerpt || '',
        content: initialData?.content || '',
        status: initialData?.status || 'DRAFT',
        featured: initialData?.featured || false,
        seoTitle: initialData?.seoTitle || '',
        seoDescription: initialData?.seoDescription || '',
        tagIds: initialData?.tags?.map(t => t.id) || [],
        categoryIds: initialData?.categories?.map(c => c.id) || [],
        images: initialData?.images || [],
    });

    const [categories, setCategories] = useState<Category[]>([]);
    const [tags, setTags] = useState<Tag[]>([]);
    const [loading, setLoading] = useState(!isEditMode);
    const [saving, setSaving] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [autoSaveStatus, setAutoSaveStatus] = useState<'saving' | 'saved' | 'error' | null>(null);
    const imageFilesRef = useRef<File[]>([]);
    const autoSaveTimerRef = useRef<NodeJS.Timeout | undefined>(undefined);

    useEffect(() => {
        loadData();
    }, []);

    // Auto-save
    useEffect(() => {
        if (formData.title && isEditMode) {
            if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
            autoSaveTimerRef.current = setTimeout(() => {
                setAutoSaveStatus('saved');
                setTimeout(() => setAutoSaveStatus(null), 3000);
            }, 3000);
        }
        return () => {
            if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
        };
    }, [formData, isEditMode]);

const loadData = async () => {
    setLoading(true);
    try {
        const [categoriesData, tagsData] = await Promise.all([
            blogApi.getCategories(),
            blogApi.getTags(),
        ]);
        setCategories(categoriesData);
        setTags(tagsData);

        if (isEditMode && !initialData) {
            const blogData = await blogApi.getBlog(blogId!);
            
            // ✅ DEBUG: Log the response structure
            console.log('[loadData] ===== BLOG DATA LOADED =====');
            console.log('[loadData] Full blog data:', blogData);
            console.log('[loadData] Categories structure:', blogData.categories);
            console.log('[loadData] Tags structure:', blogData.tags);
            
            // ✅ FIX: Extract IDs with support for multiple response formats
            const extractCategoryIds = (): number[] => {
                if (!blogData.categories || blogData.categories.length === 0) {
                    console.log('[loadData] No categories found');
                    return [];
                }
                
                const firstItem = blogData.categories[0];
                console.log('[loadData] First category item:', firstItem);
                
                // Format 1: Nested structure { id, blogId, categoryId, category: {...} }
                if (typeof firstItem === 'object' && 'category' in firstItem && (firstItem as any).category?.id) {
                    const ids = blogData.categories.map((bc: any) => bc.category ? bc.category.id : bc.id);
                    console.log('[loadData] Extracted from nested structure:', ids);
                    return ids;
                }
                
                // Format 2: Direct structure { id, name, ... }
                if (typeof firstItem === 'object' && 'id' in firstItem && (firstItem as any).id) {
                    const ids = blogData.categories.map((c: any) => c.id);
                    console.log('[loadData] Extracted from flat structure:', ids);
                    return ids;
                }
                
                console.warn('[loadData] Unknown category structure:', firstItem);
                return [];
            };
            
            const extractTagIds = (): number[] => {
                if (!blogData.tags || blogData.tags.length === 0) {
                    console.log('[loadData] No tags found');
                    return [];
                }
                
                const firstItem = blogData.tags[0];
                console.log('[loadData] First tag item:', firstItem);
                
                // Format 1: Nested structure { id, blogId, tagId, tag: {...} }
                if (typeof firstItem === 'object' && 'tag' in firstItem && (firstItem as any).tag?.id) {
                    const ids = blogData.tags.map((bt: any) => bt.tag ? bt.tag.id : bt.id);
                    console.log('[loadData] Extracted from nested structure:', ids);
                    return ids;
                }
                
                // Format 2: Direct structure { id, name, ... }
                if (typeof firstItem === 'object' && 'id' in firstItem && (firstItem as any).id) {
                    const ids = blogData.tags.map((t: any) => t.id);
                    console.log('[loadData] Extracted from flat structure:', ids);
                    return ids;
                }
                
                console.warn('[loadData] Unknown tag structure:', firstItem);
                return [];
            };
            
            const categoryIds = extractCategoryIds();
            const tagIds = extractTagIds();
            
            console.log('[loadData] ===== EXTRACTED IDs =====');
            console.log('[loadData] Category IDs:', categoryIds);
            console.log('[loadData] Tag IDs:', tagIds);
            
            const newFormData = {
                title: blogData.title,
                slug: blogData.slug,
                excerpt: blogData.excerpt || '',
                content: blogData.content || '',
                status: blogData.status,
                featured: blogData.featured,
                seoTitle: blogData.seoTitle || '',
                seoDescription: blogData.seoDescription || '',
                tagIds: tagIds,
                categoryIds: categoryIds,
                images: blogData.images || [],
            };
            
            console.log('[loadData] ===== SETTING FORM DATA =====');
            console.log('[loadData] Form data to set:', {
                categoryIds: newFormData.categoryIds,
                tagIds: newFormData.tagIds,
                title: newFormData.title
            });
            
            setFormData(newFormData);
            
            // ✅ Verify the state was set
            setTimeout(() => {
                console.log('[loadData] ===== VERIFICATION =====');
                console.log('[loadData] Form data state should now have:');
                console.log('[loadData] - categoryIds:', categoryIds);
                console.log('[loadData] - tagIds:', tagIds);
            }, 100);
        }
    } catch (error) {
        console.error('[loadData] ===== ERROR =====');
        console.error('[loadData] Error details:', error);
        addToast({ type: 'error', title: 'Error', message: 'Failed to load data' });
    } finally {
        setLoading(false);
    }
};

    const handleChange = (field: keyof FormData, value: any) => {
        setFormData(prev => {
            const updated = { ...prev, [field]: value };

            // NEW: Auto-generate optimized slug from title if slug is empty
            if (field === 'title' && !prev.slug) {
                updated.slug = generateSEOSlug(value);
            }

            return updated;
        });

        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const handleImageUpload = async (file: File): Promise<string> => {
        try {
            // NEW: Optimize image before upload
            const optimized = await optimizeImage(file, {
                maxWidth: 1920,
                maxHeight: 1080,
                quality: 0.85,
                format: 'jpeg'
            });

            console.log(`[Image Upload] Optimized: ${optimized.compressionRatio.toFixed(1)}% savings (${(optimized.originalSize / 1024 / 1024).toFixed(2)}MB → ${(optimized.optimizedSize / 1024 / 1024).toFixed(2)}MB)`);

            // Upload optimized file
            imageFilesRef.current.push(optimized.file);
            const result = await blogApi.uploadImage(optimized.file);
            return result.url;
        } catch (error) {
            console.error('[Image Upload] Failed:', error);
            throw error;
        }
    };

    const handleAddCategory = async (name: string): Promise<Category> => {
        const newCat = await blogApi.createCategory({ name, slug: generateSEOSlug(name) });
        setCategories(prev => [...prev, newCat]);
        return newCat;
    };

    const handleAddTag = async (name: string): Promise<Tag> => {
        const newTag = await blogApi.createTag({ name, slug: generateSEOSlug(name) });
        setTags(prev => [...prev, newTag]);
        return newTag;
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};
        if (!formData.title.trim()) newErrors.title = 'Title is required';
        if (!formData.content.trim()) newErrors.content = 'Content is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

 const handleSave = async (publishNow: boolean = false) => {
        if (!validateForm()) return;

        setSaving(true);
        try {
            const authorId = session?.user?.id ? Number(session.user.id) : 0;
            
            // Properly set status for publishing
            const newStatus = publishNow ? 'PUBLISHED' as const : formData.status;
            
            const dataToSave = {
                title: formData.title,
                slug: formData.slug || generateSEOSlug(formData.title),
                excerpt: formData.excerpt,
                content: formData.content,
                authorId,
                status: newStatus,
                categoryIds: formData.categoryIds,
                tagIds: formData.tagIds,
                seoTitle: formData.seoTitle || formData.title,
                seoDescription: formData.seoDescription || formData.excerpt,
                featured: formData.featured,
                readTime: calculateReadTime(formData.content), // Using optimized function from seoUtils
                images: formData.images,
            };

            console.log('[handleSave] Saving blog with data:', {
                ...dataToSave,
                imageFilesCount: imageFilesRef.current.length,
                publishNow,
                isEditMode
            });

            let result;
            if (isEditMode) {
                result = await blogApi.updateBlog(blogId!, dataToSave as UpdateBlogData, imageFilesRef.current);
                addToast({ type: 'success', title: 'Success', message: '✨ Blog updated successfully!' });
            } else {
                result = await blogApi.createBlog(dataToSave as CreateBlogData, imageFilesRef.current);
                addToast({ type: 'success', title: 'Success', message: '🎉 Blog created successfully!' });
            }

            // Clear image files after successful save
            imageFilesRef.current = [];

            // ✅ Revalidate blog pages to update the cache
            console.log('[handleSave] Revalidating blog cache for slug:', result.slug);
            try {
                const revalidationResult = await revalidateBlogPages(result.slug);
                if (revalidationResult.success) {
                    console.log('[handleSave] Cache revalidated successfully');
                } else {
                    console.warn('[handleSave] Cache revalidation warning:', revalidationResult.message);
                }
            } catch (revalError) {
                console.error('[handleSave] Cache revalidation error:', revalError);
                // Don't fail the save if revalidation fails
            }

            // Navigate after a short delay
            setTimeout(() => {
                if (isEditMode) {
                    // Reload the current edit page with fresh data
                    window.location.reload();
                } else {
                    // Navigate to the edit page for the new blog
                    router.push(`/admin/blog/${result.id}/edit`);
                }
            }, 1500);
        } catch (error: any) {
            console.error('[handleSave] Error:', error);
            addToast({ type: 'error', title: 'Error', message: error.message || 'Failed to save blog' });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        try {
            await blogApi.deleteBlog(blogId!);
            addToast({ type: 'success', title: 'Success', message: 'Blog deleted successfully' });
            router.push('/admin/blog');
        } catch (error) {
            addToast({ type: 'error', title: 'Error', message: 'Failed to delete blog' });
        }
    };

    const handleCopySlug = () => {
        navigator.clipboard.writeText(`/blog/${formData.slug}`);
        addToast({ type: 'success', title: 'Copied!', message: 'Blog URL copied to clipboard' });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
                <div className="text-center">
                    <div className="relative mb-4">
                        <LoadingSpinner size="lg" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="h-20 w-20 bg-blue-500/20 rounded-full animate-ping"></div>
                        </div>
                    </div>
                    <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                        {isEditMode ? 'Loading your masterpiece...' : 'Preparing your canvas...'}
                    </p>
                </div>
            </div>
        );
    }

    const wordCount = formData.content.replace(/<[^>]*>/g, '').trim().split(/\s+/).filter(w => w).length;
    const readTime = calculateReadTime(formData.content);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            {/* Premium Header */}
            <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-b-2 border-gray-200 dark:border-gray-700 sticky top-0 z-50 shadow-lg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => router.push('/admin/blog')}
                                className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all hover:scale-110 group"
                            >
                                <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                    {isEditMode ? '✏️ Edit Blog Post' : '✨ Create New Blog'}
                                </h1>
                                <div className="flex items-center gap-3 mt-1">
                                    <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                                        {wordCount} words • {readTime} min read
                                    </span>
                                    <div className={`px-3 py-1 rounded-full text-xs font-bold ${formData.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' :
                                            formData.status === 'DRAFT' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-gray-100 text-gray-700'
                                        }`}>
                                        {formData.status}
                                    </div>
                                    {formData.featured && (
                                        <div className="px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full text-xs font-bold flex items-center gap-1">
                                            <Star className="h-3 w-3 fill-current" />
                                            FEATURED
                                        </div>
                                    )}
                                    <AutoSaveIndicator status={autoSaveStatus} />
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <ActionButton
                                onClick={() => setShowPreview(!showPreview)}
                                variant="secondary"
                                icon={<Eye className="h-4 w-4" />}
                                className="shadow-sm hover:shadow-md"
                            >
                                {showPreview ? 'Edit' : 'Preview'}
                            </ActionButton>
                            {isEditMode && (
                                <ActionButton
                                    onClick={() => setShowDeleteModal(true)}
                                    variant="danger"
                                    icon={<Trash2 className="h-4 w-4" />}
                                    className="shadow-sm hover:shadow-md"
                                >
                                    Delete
                                </ActionButton>
                            )}
                            <ActionButton
                                onClick={() => handleSave(false)}
                                variant="secondary"
                                icon={<Save className="h-4 w-4" />}
                                loading={saving && formData.status === 'DRAFT'}
                                className="shadow-sm hover:shadow-md"
                            >
                                Save Draft
                            </ActionButton>
                            <ActionButton
                                onClick={() => handleSave(true)}
                                variant="primary"
                                icon={<Globe className="h-4 w-4" />}
                                loading={saving && formData.status === 'PUBLISHED'}
                                className="shadow-lg hover:shadow-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                            >
                                {formData.status === 'PUBLISHED' ? 'Update' : 'Publish'}
                            </ActionButton>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {showPreview ? (
                    /* Preview Mode */
                    <Card className="shadow-2xl border-2 border-gray-200 dark:border-gray-700 animate-in fade-in duration-500">
                        <div className="p-12">
                            <article className="prose prose-xl dark:prose-invert max-w-none">
                                {formData.images.find(img => img.isMain) && (
                                    <div className="relative rounded-2xl overflow-hidden shadow-2xl mb-12 -mx-12 -mt-12">
                                        <img
                                            src={formData.images.find(img => img.isMain)?.url}
                                            alt="Featured"
                                            className="w-full h-[500px] object-cover"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                        <div className="absolute bottom-0 left-0 right-0 p-12">
                                            <h1 className="text-5xl font-bold text-white mb-4 drop-shadow-lg">{formData.title}</h1>
                                            <div className="flex items-center gap-6 text-white/90">
                                                <span className="flex items-center gap-2">
                                                    <Clock className="h-5 w-5" />
                                                    {readTime} min read
                                                </span>
                                                <span>•</span>
                                                <span>{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {!formData.images.find(img => img.isMain) && (
                                    <h1 className="text-5xl font-bold mb-8">{formData.title}</h1>
                                )}
                                {formData.excerpt && (
                                    <p className="text-2xl text-gray-600 dark:text-gray-400 font-medium leading-relaxed mb-12 border-l-4 border-blue-500 pl-6">
                                        {formData.excerpt}
                                    </p>
                                )}
                                <div dangerouslySetInnerHTML={{ __html: formData.content }} />

                                {(formData.categoryIds.length > 0 || formData.tagIds.length > 0) && (
                                    <div className="mt-16 pt-8 border-t-2 border-gray-200 dark:border-gray-700 not-prose">
                                        {formData.categoryIds.length > 0 && (
                                            <div className="mb-6">
                                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                                    <Folder className="h-5 w-5 text-blue-500" />
                                                    Categories
                                                </h3>
                                                <div className="flex flex-wrap gap-3">
                                                    {formData.categoryIds.map(id => {
                                                        const cat = categories.find(c => c.id === id);
                                                        return cat ? (
                                                            <span key={id} className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-xl font-semibold">
                                                                {cat.name}
                                                            </span>
                                                        ) : null;
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                        {formData.tagIds.length > 0 && (
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                                    <TagIcon className="h-5 w-5 text-green-500" />
                                                    Tags
                                                </h3>
                                                <div className="flex flex-wrap gap-2">
                                                    {formData.tagIds.map(id => {
                                                        const tag = tags.find(t => t.id === id);
                                                        return tag ? (
                                                            <span key={id} className="px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-lg text-sm font-medium">
                                                                #{tag.name}
                                                            </span>
                                                        ) : null;
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </article>
                        </div>
                    </Card>
                ) : (
                    /* Edit Mode */
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Content Column */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Title & Slug Card */}
                            <Card className="shadow-lg border-2 border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow">
                                <div className="p-6 space-y-5">
                                    <div>
                                        <Input
                                            label="📝 Blog Title"
                                            value={formData.title}
                                            onChange={(e) => handleChange('title', e.target.value)}
                                            error={errors.title}
                                            required
                                            className="text-xl font-bold"
                                            placeholder="Give your blog an amazing title..."
                                        />
                                    </div>
                                    <div>
                                        {/* NEW: Smart Slug Input with auto-generation and validation */}
                                        <SmartSlugInput
                                            title={formData.title}
                                            value={formData.slug}
                                            onChange={(slug) => handleChange('slug', slug)}
                                            checkAvailability={async (slug) => {
                                                try {
                                                    const result = await blogApi.checkSlugAvailability(slug);
                                                    return result;
                                                } catch (error) {
                                                    console.error('Failed to check slug availability:', error);
                                                    return true; // Assume available if check fails
                                                }
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <TextArea
                                            label="📄 Excerpt"
                                            value={formData.excerpt}
                                            onChange={(e) => handleChange('excerpt', e.target.value)}
                                            rows={3}
                                            placeholder="Write a compelling excerpt that hooks your readers..."
                                            hint={`${formData.excerpt.length}/300 characters`}
                                            maxLength={300}
                                        />
                                    </div>
                                </div>
                            </Card>

                            {/* Content Editor Card */}
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
                                        <p className="mt-3 text-sm text-red-600 dark:text-red-400 flex items-center gap-2 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                                            <AlertCircle className="h-4 w-4" />
                                            {errors.content}
                                        </p>
                                    )}
                                </div>
                            </Card>

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
                        </div>

                        {/* Sidebar Column */}
                        <div className="space-y-6">
                            {/* Publishing Options */}
                            <Card className="shadow-lg border-2 border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
                                <div className="p-6 space-y-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Settings className="h-5 w-5 text-blue-500" />
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Publishing</h3>
                                    </div>
                                    <Select
                                        label="Status"
                                        value={formData.status}
                                        onChange={(e) => handleChange('status', e.target.value)}
                                        className="font-semibold"
                                    >
                                        <option value="DRAFT">📝 Draft</option>
                                        <option value="PUBLISHED">🌍 Published</option>
                                        <option value="ARCHIVED">📦 Archived</option>
                                    </Select>
                                    <label className="flex items-center gap-3 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/10 dark:to-orange-900/10 rounded-xl border-2 border-yellow-200 dark:border-yellow-800 cursor-pointer hover:scale-105 transition-transform">
                                        <input
                                            type="checkbox"
                                            checked={formData.featured}
                                            onChange={(e) => handleChange('featured', e.target.checked)}
                                            className="h-5 w-5 rounded"
                                        />
                                        <div className="flex items-center gap-2 font-semibold text-yellow-900 dark:text-yellow-100">
                                            <Star className={`h-5 w-5 ${formData.featured ? 'fill-current text-yellow-500' : ''}`} />
                                            Featured Post
                                        </div>
                                    </label>
                                    <div className="grid grid-cols-2 gap-3 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 rounded-xl border-2 border-blue-200 dark:border-blue-800">
                                        <div className="text-center">
                                            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{wordCount}</p>
                                            <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Words</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{readTime}</p>
                                            <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Min Read</p>
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            {/* NEW: Optimized Image Gallery with auto-compression */}
                            <Card className="shadow-lg border-2 border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow">
                                <div className="p-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <ImageIcon className="h-5 w-5 text-purple-500" />
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Image Gallery</h3>
                                        <span className="text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full">
                                            Auto-optimized on upload
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

                            {/* Categories & Tags */}
                            <Card className="shadow-lg border-2 border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow">
                                <div className="p-6">
                                    <PremiumCategoryTagManager
                                        selectedCategories={formData.categoryIds}
                                        selectedTags={formData.tagIds}
                                        availableCategories={categories}
                                        availableTags={tags}
                                        onCategoriesChange={(ids) => handleChange('categoryIds', ids)}
                                        onTagsChange={(ids) => handleChange('tagIds', ids)}
                                        onAddCategory={handleAddCategory}
                                        onAddTag={handleAddTag}
                                    />
                                </div>
                            </Card>

                            {/* SEO Optimizer */}

                            <SEOOptimizer
                                seoTitle={formData.seoTitle}
                                seoDescription={formData.seoDescription}
                                onSeoTitleChange={(value) => handleChange('seoTitle', value)}
                                onSeoDescriptionChange={(value) => handleChange('seoDescription', value)}
                            />

                        </div>
                    </div>
                )}
            </main>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && isEditMode && (
                <Modal
                    isOpen={showDeleteModal}
                    title="⚠️ Delete Blog Post"
                    onClose={() => setShowDeleteModal(false)}
                    size="md"
                >
                    <div className="space-y-6">
                        <Alert
                            type="warning"
                            message="This action cannot be undone. All content, images, and metadata will be permanently deleted."
                        />
                        <div className="p-6 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-xl border-2 border-red-200 dark:border-red-800">
                            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">{formData.title}</h3>
                            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                                <span>{wordCount} words</span>
                                <span>•</span>
                                <span>{formData.images.length} images</span>
                                <span>•</span>
                                <span>{formData.categoryIds.length} categories</span>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <ActionButton
                                variant="secondary"
                                onClick={() => setShowDeleteModal(false)}
                                className="flex-1"
                            >
                                Cancel
                            </ActionButton>
                            <ActionButton
                                variant="danger"
                                onClick={handleDelete}
                                icon={<Trash2 className="h-4 w-4" />}
                                className="flex-1"
                            >
                                Delete Permanently
                            </ActionButton>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}


