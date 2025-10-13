// src/components/admin/blog/EnhancedBlogComponents.tsx
'use client';

import React, { useState, useEffect, useRef, ChangeEvent } from 'react';
import {
  Bold, Italic, Type, List, Hash, Quote, Image, Clock, X,
  Star, Trash2, Upload, Search, Tag, Folder, Check, Sparkles
} from 'lucide-react';

import { 
  BlogImage, 
  Category, 
  Tag as BlogTag 
} from '@/lib/api/completeBlogApi';

import {
  validateImageFile,
  resizeImage,
  editorStyles
} from '@/utils/blogEditorUtils';

// ============================================================================
// ENHANCED RICH TEXT EDITOR
// ============================================================================
export const EnhancedRichTextEditor: React.FC<{
  content: string;
  onChange: (content: string) => void;
  onImageUpload: (file: File) => Promise<string>;
  placeholder?: string;
  height?: string;
}> = ({ content, onChange, onImageUpload, placeholder = "Write your blog content...", height = "500px" }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [showToolbar, setShowToolbar] = useState(true);

  useEffect(() => {
    const styleId = 'rich-editor-styles';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = editorStyles;
      document.head.appendChild(style);
    }
  }, []);

  useEffect(() => {
    if (editorRef.current && !editorRef.current.innerHTML) {
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

  const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    setIsUploading(true);
    try {
      let fileToUpload = file;
      if (file.size > 2 * 1024 * 1024) {
        const resizedBlob = await resizeImage(file, 1200, 800, 0.8);
        fileToUpload = new File([resizedBlob], file.name, { type: file.type });
      }

      const imageUrl = await onImageUpload(fileToUpload);
      const imgHtml = `<img src="${imageUrl}" alt="Blog image" style="max-width: 100%; height: auto; margin: 10px 0; border-radius: 8px;" />`;
      execCommand('insertHTML', imgHtml);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const formatButtons = [
    { command: 'bold', icon: Bold, title: 'Bold (Ctrl+B)' },
    { command: 'italic', icon: Italic, title: 'Italic (Ctrl+I)' },
    { command: 'underline', icon: Type, title: 'Underline (Ctrl+U)' },
    { command: 'insertUnorderedList', icon: List, title: 'Bullet List' },
    { command: 'insertOrderedList', icon: Hash, title: 'Numbered List' },
    { command: 'formatBlock', icon: Quote, title: 'Quote', value: 'blockquote' },
    { command: 'formatBlock', icon: Type, title: 'H1', value: 'h1' },
    { command: 'formatBlock', icon: Type, title: 'H2', value: 'h2' },
    { command: 'formatBlock', icon: Type, title: 'H3', value: 'h3' },
  ];

  return (
    <div className="rich-text-editor border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-white dark:bg-gray-800">
      {showToolbar && (
        <div className="flex flex-wrap items-center gap-1 p-2 bg-gray-50 dark:bg-gray-700 border-b border-gray-300 dark:border-gray-600">
          {formatButtons.map((button, index) => (
            <button
              key={index}
              type="button"
              onClick={() => execCommand(button.command, button.value)}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
              title={button.title}
            >
              <button.icon className="h-4 w-4 text-gray-700 dark:text-gray-300" />
            </button>
          ))}
          
          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors disabled:opacity-50"
            title="Insert Image"
          >
            {isUploading ? (
              <Clock className="h-4 w-4 animate-spin text-gray-700 dark:text-gray-300" />
            ) : (
              <Image className="h-4 w-4 text-gray-700 dark:text-gray-300" />
            )}
          </button>

          <div className="ml-auto flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <span>{wordCount} words</span>
            <span>•</span>
            <span>{Math.ceil(wordCount / 200)} min read</span>
          </div>
        </div>
      )}
      
      <div
        ref={editorRef}
        contentEditable
        onInput={handleContentChange}
        className="editor-content p-4 min-h-[400px] max-h-[600px] overflow-y-auto focus:outline-none"
        style={{ height }}
        data-placeholder={placeholder}
      />
    </div>
  );
};

// ============================================================================
// ENHANCED IMAGE UPLOADER WITH DRAG & DROP
// ============================================================================
export const EnhancedImageUploader: React.FC<{
  images: BlogImage[];
  onChange: (images: BlogImage[]) => void;
  onUpload: (file: File) => Promise<string>;
  maxImages?: number;
}> = ({ images, onChange, onUpload, maxImages = 5 }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    await handleFiles(files);
  };

  const handleFileInput = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    await handleFiles(files);
  };

  const handleFiles = async (files: File[]) => {
    if (images.length + files.length > maxImages) {
      alert(`Maximum ${maxImages} images allowed`);
      return;
    }

    setUploading(true);
    try {
      const uploadPromises = files.map(async (file) => {
        const validation = validateImageFile(file);
        if (!validation.valid) throw new Error(validation.error);

        let fileToUpload = file;
        if (file.size > 2 * 1024 * 1024) {
          const resizedBlob = await resizeImage(file, 1200, 800, 0.8);
          fileToUpload = new File([resizedBlob], file.name, { type: file.type });
        }

        const url = await onUpload(fileToUpload);
        return { url, alt: '', caption: '', isMain: images.length === 0 };
      });

      const newImages = await Promise.all(uploadPromises);
      onChange([...images, ...newImages]);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload images');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  const setAsMain = (index: number) => {
    onChange(images.map((img, i) => ({ ...img, isMain: i === index })));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Blog Images ({images.length}/{maxImages})
        </label>
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          {images.map((img, index) => (
            <div key={index} className="relative group">
              <img 
                src={img.url} 
                alt={img.alt || 'Blog image'} 
                className="w-full h-32 object-cover rounded-lg border-2 border-gray-200 dark:border-gray-600"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all rounded-lg flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setAsMain(index)}
                  className={`p-2 rounded-full ${img.isMain ? 'bg-yellow-500' : 'bg-white opacity-0 group-hover:opacity-100'} transition-opacity`}
                  title="Set as featured"
                >
                  <Star className={`h-4 w-4 ${img.isMain ? 'text-white fill-white' : 'text-gray-700'}`} />
                </button>
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remove"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              {img.isMain && (
                <span className="absolute top-2 left-2 px-2 py-1 bg-yellow-500 text-white text-xs rounded">
                  Featured
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {images.length < maxImages && (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-all ${
            isDragging 
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
          }`}
        >
          {uploading ? (
            <div className="flex flex-col items-center">
              <Clock className="h-10 w-10 text-blue-500 animate-spin mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-400">Uploading...</p>
            </div>
          ) : (
            <>
              <Image className="mx-auto h-10 w-10 text-gray-400 dark:text-gray-500 mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Drag and drop images, or
              </p>
              <label className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition-colors">
                <Upload className="inline h-4 w-4 mr-2" />
                Choose Files
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileInput}
                  className="hidden"
                />
              </label>
            </>
          )}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// ENHANCED CATEGORY & TAG MANAGER WITH ADD NEW FUNCTIONALITY
// ============================================================================
export const EnhancedCategoryTagManager: React.FC<{
  selectedCategories: number[];
  selectedTags: number[];
  availableCategories: Category[];
  availableTags: BlogTag[];
  onCategoriesChange: (ids: number[]) => void;
  onTagsChange: (ids: number[]) => void;
  onAddCategory?: (name: string) => Promise<Category>;
  onAddTag?: (name: string) => Promise<BlogTag>;
}> = ({ 
  selectedCategories, 
  selectedTags, 
  availableCategories, 
  availableTags,
  onCategoriesChange,
  onTagsChange,
  onAddCategory,
  onAddTag
}) => {
  const [categorySearch, setCategorySearch] = useState('');
  const [tagSearch, setTagSearch] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newTagName, setNewTagName] = useState('');
  const [addingCategory, setAddingCategory] = useState(false);
  const [addingTag, setAddingTag] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showAddTag, setShowAddTag] = useState(false);

  const filteredCategories = availableCategories.filter(cat =>
    cat.name.toLowerCase().includes(categorySearch.toLowerCase())
  );

  const filteredTags = availableTags.filter(tag =>
    tag.name.toLowerCase().includes(tagSearch.toLowerCase())
  );

  const toggleCategory = (id: number) => {
    if (selectedCategories.includes(id)) {
      onCategoriesChange(selectedCategories.filter(cid => cid !== id));
    } else {
      onCategoriesChange([...selectedCategories, id]);
    }
  };

  const toggleTag = (id: number) => {
    if (selectedTags.includes(id)) {
      onTagsChange(selectedTags.filter(tid => tid !== id));
    } else {
      onTagsChange([...selectedTags, id]);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim() || !onAddCategory) return;
    
    setAddingCategory(true);
    try {
      const newCategory = await onAddCategory(newCategoryName.trim());
      onCategoriesChange([...selectedCategories, newCategory.id]);
      setNewCategoryName('');
      setShowAddCategory(false);
    } catch (error) {
      console.error('Failed to add category:', error);
      alert('Failed to add category');
    } finally {
      setAddingCategory(false);
    }
  };

  const handleAddTag = async () => {
    if (!newTagName.trim() || !onAddTag) return;
    
    setAddingTag(true);
    try {
      const newTag = await onAddTag(newTagName.trim());
      onTagsChange([...selectedTags, newTag.id]);
      setNewTagName('');
      setShowAddTag(false);
    } catch (error) {
      console.error('Failed to add tag:', error);
      alert('Failed to add tag');
    } finally {
      setAddingTag(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Categories
        </label>
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search categories..."
            value={categorySearch}
            onChange={(e) => setCategorySearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
        <div className="max-h-48 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg">
          {filteredCategories.map(cat => (
            <label
              key={cat.id}
              className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-600 last:border-b-0"
            >
              <input
                type="checkbox"
                checked={selectedCategories.includes(cat.id)}
                onChange={() => toggleCategory(cat.id)}
                className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <Folder className="h-4 w-4 text-gray-400 mx-2" />
              <span className="text-sm text-gray-700 dark:text-gray-300">{cat.name}</span>
              {(cat as any).blogCount !== undefined && (
                <span className="ml-auto text-xs text-gray-500">({(cat as any).blogCount})</span>
              )}
            </label>
          ))}
        </div>
        {selectedCategories.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {selectedCategories.map(id => {
              const cat = availableCategories.find(c => c.id === id);
              return cat ? (
                <span key={id} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full text-sm">
                  {cat.name}
                  <button onClick={() => toggleCategory(id)} className="hover:text-blue-600">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ) : null;
            })}
          </div>
        )}
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Tags
        </label>
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search tags..."
            value={tagSearch}
            onChange={(e) => setTagSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
        <div className="max-h-48 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg">
          {filteredTags.map(tag => (
            <label
              key={tag.id}
              className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-600 last:border-b-0"
            >
              <input
                type="checkbox"
                checked={selectedTags.includes(tag.id)}
                onChange={() => toggleTag(tag.id)}
                className="h-4 w-4 text-green-600 rounded focus:ring-green-500"
              />
              <Tag className="h-4 w-4 text-gray-400 mx-2" />
              <span className="text-sm text-gray-700 dark:text-gray-300">{tag.name}</span>
              {(tag as any).blogCount !== undefined && (
                <span className="ml-auto text-xs text-gray-500">({(tag as any).blogCount})</span>
              )}
            </label>
          ))}
        </div>
        {selectedTags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {selectedTags.map(id => {
              const tag = availableTags.find(t => t.id === id);
              return tag ? (
                <span key={id} className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-full text-sm">
                  <Tag className="h-3 w-3" />
                  {tag.name}
                  <button onClick={() => toggleTag(id)} className="hover:text-green-600">
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
};

// ============================================================================
// SEO OPTIMIZER
// ============================================================================
export const SEOOptimizer: React.FC<{
  seoTitle: string;
  seoDescription: string;
  onSeoTitleChange: (value: string) => void;
  onSeoDescriptionChange: (value: string) => void;
}> = ({ seoTitle, seoDescription, onSeoTitleChange, onSeoDescriptionChange }) => {
  const titleLength = seoTitle.length;
  const descLength = seoDescription.length;

  const getTitleStatus = () => {
    if (titleLength === 0) return { color: 'text-gray-500', message: 'Add SEO title' };
    if (titleLength < 30) return { color: 'text-yellow-600', message: 'Too short' };
    if (titleLength > 60) return { color: 'text-red-600', message: 'Too long' };
    return { color: 'text-green-600', message: 'Optimal' };
  };

  const getDescStatus = () => {
    if (descLength === 0) return { color: 'text-gray-500', message: 'Add meta description' };
    if (descLength < 70) return { color: 'text-yellow-600', message: 'Too short' };
    if (descLength > 160) return { color: 'text-red-600', message: 'Too long' };
    return { color: 'text-green-600', message: 'Optimal' };
  };

  const titleStatus = getTitleStatus();
  const descStatus = getDescStatus();

  return (
    <div className="space-y-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
      <div className="flex items-center gap-2 text-purple-800 dark:text-purple-200 font-medium">
        <Sparkles className="h-5 w-5" />
        <span>SEO Optimization</span>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          SEO Title
        </label>
        <input
          type="text"
          value={seoTitle}
          onChange={(e) => onSeoTitleChange(e.target.value)}
          placeholder="Enter SEO-optimized title (30-60 chars)"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
          maxLength={70}
        />
        <div className="flex justify-between mt-1 text-xs">
          <span className={titleStatus.color}>
            {titleLength}/60 characters
          </span>
          <span className={titleStatus.color}>{titleStatus.message}</span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Meta Description
        </label>
        <textarea
          value={seoDescription}
          onChange={(e) => onSeoDescriptionChange(e.target.value)}
          placeholder="Enter compelling meta description (70-160 chars)"
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white resize-none"
          maxLength={170}
        />
        <div className="flex justify-between mt-1 text-xs">
          <span className={descStatus.color}>
            {descLength}/160 characters
          </span>
          <span className={descStatus.color}>{descStatus.message}</span>
        </div>
      </div>

      <div className="p-3 bg-white dark:bg-gray-800 rounded border border-purple-200 dark:border-purple-700">
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
          <strong>SEO Tips:</strong>
        </p>
        <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
          <li>• Include primary keywords naturally</li>
          <li>• Make titles compelling and clickable</li>
          <li>• Write unique descriptions for each post</li>
        </ul>
      </div>
    </div>
  );
};

// ============================================================================
// AUTO-SAVE INDICATOR
// ============================================================================
export const AutoSaveIndicator: React.FC<{
  lastSaved?: Date;
  saving?: boolean;
}> = ({ lastSaved, saving }) => {
  const formatTimeAgo = (date: Date): string => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  if (saving) {
    return (
      <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
        <Clock className="h-4 w-4 animate-spin" />
        <span>Saving...</span>
      </div>
    );
  }

  if (lastSaved) {
    return (
      <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
        <Check className="h-4 w-4" />
        <span>Saved {formatTimeAgo(lastSaved)}</span>
      </div>
    );
  }

  return null;
};