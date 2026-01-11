"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  Bold, Italic, List, Quote, Type, AlignLeft, AlignCenter, AlignRight,
  Image as ImageIcon, Link2, Maximize2, Minimize2, X, Upload, Loader2,
  AlertCircle, CheckCircle, Underline as UnderlineIcon, Eye, Edit3,
  Columns, Save, Undo, Redo, Search, Replace,
  Heading1, Heading2, Heading3, ListOrdered, Minus, ChevronDown, MoreHorizontal
} from 'lucide-react';
import { optimizeImage } from '@/lib/utils/imageOptimization';

// ============================================================================
// TYPES
// ============================================================================

type ViewMode = 'edit' | 'preview' | 'split';

interface HistoryState {
  content: string;
  timestamp: number;
}

interface ImageDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (data: { url: string; alt: string; caption?: string }) => void;
  imageUrl?: string;
  onUpload?: (file: File) => Promise<string>;
}

interface EnhancedBlogEditorProps {
  content: string;
  onChange: (content: string) => void;
  onImageUpload?: (file: File) => Promise<string>;
  onAutoSave?: () => Promise<void>;
  placeholder?: string;
  autoSaveInterval?: number;
}

// ============================================================================
// IMAGE DIALOG
// ============================================================================

const ImageDialog: React.FC<ImageDialogProps> = ({
  isOpen,
  onClose,
  onInsert,
  imageUrl: initialUrl,
  onUpload
}) => {
  const [url, setUrl] = useState(initialUrl || '');
  const [alt, setAlt] = useState('');
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialUrl) setUrl(initialUrl);
  }, [initialUrl]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onUpload) return;

    setOptimizing(true);
    setError('');

    try {
      const optimized = await optimizeImage(file, {
        maxWidth: 1920,
        maxHeight: 1080,
        quality: 0.85,
        format: 'jpeg'
      });

      setUploading(true);
      setOptimizing(false);

      const uploadedUrl = await onUpload(optimized.file);
      setUrl(uploadedUrl);

      const filename = file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ');
      setAlt(filename.charAt(0).toUpperCase() + filename.slice(1));
    } catch (err) {
      setError('Failed to upload image. Please try again.');
      console.error('Image upload error:', err);
    } finally {
      setUploading(false);
      setOptimizing(false);
    }
  };

  const handleInsert = () => {
    if (!url) {
      setError('Please provide an image URL or upload an image');
      return;
    }
    if (!alt) {
      setError('Alt text is required for SEO and accessibility');
      return;
    }

    onInsert({ url, alt, caption });
    setUrl('');
    setAlt('');
    setCaption('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-[#1A403D] to-[#2d5a56] text-white p-5 rounded-t-2xl flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold">Insert Image</h3>
            <p className="text-sm text-white/70 mt-0.5">Add image with alt text for SEO</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {onUpload && (
            <div>
              <label className="block cursor-pointer">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={uploading || optimizing}
                  className="hidden"
                />
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-[#1A403D] hover:bg-gray-50 transition-all">
                  {uploading || optimizing ? (
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="h-8 w-8 animate-spin text-[#1A403D]" />
                      <p className="text-sm text-gray-600">
                        {optimizing ? 'Optimizing...' : 'Uploading...'}
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="h-8 w-8 text-gray-400" />
                      <p className="text-sm font-medium text-gray-700">Click to upload</p>
                      <p className="text-xs text-gray-500">Auto-optimized for web</p>
                    </div>
                  )}
                </div>
              </label>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Image URL</label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#1A403D]/20 focus:border-[#1A403D]"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Alt Text <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#1A403D]/20 focus:border-[#1A403D]"
              placeholder="Describe the image for accessibility"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Caption <span className="text-xs text-gray-400">(optional)</span>
            </label>
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#1A403D]/20 focus:border-[#1A403D]"
              placeholder="Optional caption below image"
            />
          </div>

          {url && (
            <div className="border rounded-lg overflow-hidden bg-gray-50">
              <img src={url} alt={alt || 'Preview'} className="w-full h-40 object-contain" />
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 p-4 border-t bg-gray-50 rounded-b-2xl">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-lg transition-colors">
            Cancel
          </button>
          <button
            onClick={handleInsert}
            disabled={!url || !alt}
            className="px-4 py-2 text-sm font-medium text-white bg-[#1A403D] hover:bg-[#152f2d] rounded-lg disabled:opacity-50 transition-colors"
          >
            Insert Image
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// FIND/REPLACE BAR
// ============================================================================

const FindReplaceBar: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  content: string;
  onReplace: (newContent: string) => void;
}> = ({ isOpen, onClose, content, onReplace }) => {
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [matchCount, setMatchCount] = useState(0);

  useEffect(() => {
    if (findText) {
      const regex = new RegExp(findText, 'gi');
      const matches = content.match(regex);
      setMatchCount(matches ? matches.length : 0);
    } else {
      setMatchCount(0);
    }
  }, [findText, content]);

  const handleReplace = () => {
    if (!findText) return;
    const newContent = content.replace(findText, replaceText);
    onReplace(newContent);
  };

  const handleReplaceAll = () => {
    if (!findText) return;
    const regex = new RegExp(findText, 'g');
    const newContent = content.replace(regex, replaceText);
    onReplace(newContent);
  };

  if (!isOpen) return null;

  return (
    <div className="bg-white border-b border-gray-200 p-3">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-1 min-w-[180px]">
          <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <input
            type="text"
            value={findText}
            onChange={(e) => setFindText(e.target.value)}
            placeholder="Find..."
            className="flex-1 px-2 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#1A403D]"
            autoFocus
          />
          {matchCount > 0 && (
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded whitespace-nowrap">
              {matchCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 flex-1 min-w-[180px]">
          <Replace className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <input
            type="text"
            value={replaceText}
            onChange={(e) => setReplaceText(e.target.value)}
            placeholder="Replace..."
            className="flex-1 px-2 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#1A403D]"
          />
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleReplace}
            disabled={!findText}
            className="px-3 py-1.5 text-xs font-medium bg-gray-100 hover:bg-gray-200 rounded disabled:opacity-50 transition-colors"
          >
            Replace
          </button>
          <button
            onClick={handleReplaceAll}
            disabled={!findText}
            className="px-3 py-1.5 text-xs font-medium bg-[#1A403D] text-white hover:bg-[#152f2d] rounded disabled:opacity-50 transition-colors"
          >
            All
          </button>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// TOOLBAR BUTTON
// ============================================================================

const ToolbarButton: React.FC<{
  icon: React.ReactNode;
  onClick: () => void;
  title: string;
  active?: boolean;
  disabled?: boolean;
}> = ({ icon, onClick, title, active, disabled }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={`p-2 rounded-md transition-all ${
      active
        ? 'bg-[#1A403D] text-white'
        : disabled
          ? 'text-gray-300 cursor-not-allowed'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
    }`}
  >
    {icon}
  </button>
);

// ============================================================================
// TOOLBAR DIVIDER
// ============================================================================

const ToolbarDivider = () => (
  <div className="w-px h-6 bg-gray-200 mx-1" />
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const EnhancedBlogEditor: React.FC<EnhancedBlogEditorProps> = ({
  content,
  onChange,
  onImageUpload,
  onAutoSave,
  placeholder = 'Start writing your content...',
  autoSaveInterval = 30000
}) => {
  const editorRef = useRef<HTMLDivElement>(null);

  // UI State
  const [viewMode, setViewMode] = useState<ViewMode>('edit');
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [showFindReplace, setShowFindReplace] = useState(false);
  const [showHeadingMenu, setShowHeadingMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  // Auto-save state
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // History for undo/redo
  const [history, setHistory] = useState<HistoryState[]>([{ content, timestamp: Date.now() }]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Word count
  const wordCount = useMemo(() => {
    const text = content.replace(/<[^>]*>/g, '');
    return text.trim().split(/\s+/).filter(w => w.length > 0).length;
  }, [content]);

  const readTime = Math.ceil(wordCount / 200);

  // Initialize editor content
  useEffect(() => {
    if (editorRef.current && content && !editorRef.current.innerHTML) {
      editorRef.current.innerHTML = content;
    }
  }, [content]);

  // Sync content when switching to edit mode
  useEffect(() => {
    if ((viewMode === 'edit' || viewMode === 'split') && editorRef.current) {
      setTimeout(() => {
        if (editorRef.current && content) {
          editorRef.current.innerHTML = content;
        }
      }, 0);
    }
  }, [viewMode]);

  // Lock body scroll when fullscreen is active
  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isFullscreen]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowHeadingMenu(false);
      setShowMoreMenu(false);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Auto-save effect
  useEffect(() => {
    if (!onAutoSave || !hasChanges) return;

    const timer = setInterval(async () => {
      if (hasChanges && !isSaving) {
        setIsSaving(true);
        try {
          await onAutoSave();
          setLastSaved(new Date());
          setHasChanges(false);
        } catch (error) {
          console.error('Auto-save failed:', error);
        } finally {
          setIsSaving(false);
        }
      }
    }, autoSaveInterval);

    return () => clearInterval(timer);
  }, [hasChanges, isSaving, onAutoSave, autoSaveInterval]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
        e.preventDefault();
        setShowFindReplace(true);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault();
        execCommand('bold');
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'i') {
        e.preventDefault();
        execCommand('italic');
      }
      if (e.key === 'Escape') {
        setShowFindReplace(false);
        setShowHeadingMenu(false);
        setShowMoreMenu(false);
        if (isFullscreen) setIsFullscreen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [historyIndex, isFullscreen]);

  // Add to history
  const addToHistory = useCallback((newContent: string) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ content: newContent, timestamp: Date.now() });
    if (newHistory.length > 50) newHistory.shift();
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  // Undo/Redo
  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      if (editorRef.current) {
        editorRef.current.innerHTML = prevState.content;
      }
      onChange(prevState.content);
      setHistoryIndex(historyIndex - 1);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      if (editorRef.current) {
        editorRef.current.innerHTML = nextState.content;
      }
      onChange(nextState.content);
      setHistoryIndex(historyIndex + 1);
    }
  };

  const execCommand = (command: string, value: string = '') => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleContentChange();
  };

  const handleContentChange = () => {
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML;
      onChange(newContent);
      setHasChanges(true);

      const timer = setTimeout(() => {
        addToHistory(newContent);
      }, 500);
      return () => clearTimeout(timer);
    }
  };

  const handleImageInsert = (data: { url: string; alt: string; caption?: string }) => {
    const imgHtml = data.caption
      ? `<figure class="my-6"><img src="${data.url}" alt="${data.alt}" class="w-full rounded-lg" /><figcaption class="text-center text-gray-500 text-sm mt-2 italic">${data.caption}</figcaption></figure>`
      : `<img src="${data.url}" alt="${data.alt}" class="w-full rounded-lg my-6" />`;

    execCommand('insertHTML', imgHtml);
  };

  const insertLink = () => {
    if (linkUrl) {
      execCommand('createLink', linkUrl);
      setLinkUrl('');
      setShowLinkDialog(false);
    }
  };

  // Markdown to HTML for preview
  const markdownToHtml = useCallback((md: string): string => {
    if (!md) return '<p class="text-gray-400 italic">No content yet...</p>';
    if (md.includes('<')) return md;

    let html = md
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="w-full rounded-lg my-4" />')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-[#1A403D] underline">$1</a>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/~~(.+?)~~/g, '<del>$1</del>')
      .replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1 rounded text-sm">$1</code>');

    const lines = html.split('\n');
    const processedLines: string[] = [];

    lines.forEach((line) => {
      if (line.startsWith('#### ')) {
        processedLines.push(`<h4 class="text-lg font-semibold mt-6 mb-2">${line.slice(5)}</h4>`);
      } else if (line.startsWith('### ')) {
        processedLines.push(`<h3 class="text-xl font-semibold mt-8 mb-3">${line.slice(4)}</h3>`);
      } else if (line.startsWith('## ')) {
        processedLines.push(`<h2 class="text-2xl font-bold mt-8 mb-4">${line.slice(3)}</h2>`);
      } else if (line.startsWith('# ')) {
        processedLines.push(`<h1 class="text-3xl font-bold mt-8 mb-5">${line.slice(2)}</h1>`);
      } else if (line.startsWith('> ')) {
        processedLines.push(`<blockquote class="border-l-4 border-[#D1AA5A] bg-gray-50 py-3 px-5 my-4 italic text-gray-600 rounded-r">${line.slice(2)}</blockquote>`);
      } else if (line.startsWith('- ') || line.startsWith('* ')) {
        processedLines.push(`<li class="ml-6 mb-1">${line.slice(2)}</li>`);
      } else if (line.match(/^\d+\.\s/)) {
        processedLines.push(`<li class="ml-6 mb-1 list-decimal">${line.replace(/^\d+\.\s/, '')}</li>`);
      } else if (line.startsWith('---')) {
        processedLines.push('<hr class="my-8 border-gray-200" />');
      } else if (line.trim()) {
        processedLines.push(`<p class="mb-4 leading-relaxed">${line}</p>`);
      }
    });

    return processedLines.join('') || '<p class="text-gray-400 italic">No content yet...</p>';
  }, []);

  const editorHeight = isFullscreen ? 'calc(100vh - 140px)' : '600px';

  return (
    <>
      {/* Fullscreen backdrop */}
      {isFullscreen && (
        <div className="fixed inset-0 bg-black/60 z-40" onClick={() => setIsFullscreen(false)} />
      )}

      <div className={`bg-white rounded-xl overflow-hidden border border-gray-200 flex flex-col ${
        isFullscreen ? 'fixed inset-4 z-50 shadow-2xl' : 'shadow-sm'
      }`}>

        {/* Compact Toolbar */}
        <div className="border-b border-gray-200 bg-gray-50/80">
          <div className="flex items-center justify-between px-3 py-2">
            {/* Left: View Mode Toggle */}
            <div className="flex items-center gap-1 bg-white rounded-lg p-0.5 border border-gray-200 shadow-sm">
              {[
                { mode: 'edit' as ViewMode, icon: Edit3, label: 'Edit' },
                { mode: 'split' as ViewMode, icon: Columns, label: 'Split' },
                { mode: 'preview' as ViewMode, icon: Eye, label: 'Preview' },
              ].map(({ mode, icon: Icon, label }) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 ${
                    viewMode === mode
                      ? 'bg-[#1A403D] text-white shadow-sm'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </div>

            {/* Center: Stats & Save Status */}
            <div className="hidden md:flex items-center gap-3 text-xs text-gray-500">
              <span className="font-medium">{wordCount.toLocaleString()} words</span>
              <span className="text-gray-300">•</span>
              <span>{readTime} min read</span>
              {isSaving ? (
                <span className="flex items-center gap-1 text-blue-600">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Saving...
                </span>
              ) : hasChanges ? (
                <span className="text-yellow-600">• Unsaved</span>
              ) : lastSaved ? (
                <span className="flex items-center gap-1 text-green-600">
                  <CheckCircle className="w-3 h-3" />
                  Saved
                </span>
              ) : null}
            </div>

            {/* Right: Fullscreen */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
              title={isFullscreen ? 'Exit fullscreen (Esc)' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>

          {/* Formatting Toolbar - Only show in edit or split mode */}
          {viewMode !== 'preview' && (
            <div className="flex items-center gap-0.5 px-3 py-1.5 border-t border-gray-100 overflow-x-auto">
              {/* Undo/Redo */}
              <ToolbarButton
                icon={<Undo className="w-4 h-4" />}
                onClick={handleUndo}
                title="Undo (Ctrl+Z)"
                disabled={historyIndex <= 0}
              />
              <ToolbarButton
                icon={<Redo className="w-4 h-4" />}
                onClick={handleRedo}
                title="Redo (Ctrl+Shift+Z)"
                disabled={historyIndex >= history.length - 1}
              />

              <ToolbarDivider />

              {/* Headings Dropdown */}
              <div className="relative" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => setShowHeadingMenu(!showHeadingMenu)}
                  className="flex items-center gap-1 px-2 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <Type className="w-4 h-4" />
                  <ChevronDown className="w-3 h-3" />
                </button>
                {showHeadingMenu && (
                  <div className="absolute top-full left-0 mt-1 w-36 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1">
                    {[
                      { tag: 'h1', label: 'Heading 1', icon: Heading1, size: 'text-xl font-bold' },
                      { tag: 'h2', label: 'Heading 2', icon: Heading2, size: 'text-lg font-bold' },
                      { tag: 'h3', label: 'Heading 3', icon: Heading3, size: 'text-base font-semibold' },
                      { tag: 'p', label: 'Paragraph', icon: Type, size: 'text-sm' },
                    ].map(({ tag, label, icon: Icon, size }) => (
                      <button
                        key={tag}
                        onClick={() => { execCommand('formatBlock', tag); setShowHeadingMenu(false); }}
                        className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                      >
                        <Icon className="w-4 h-4 text-gray-400" />
                        <span className={size}>{label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <ToolbarDivider />

              {/* Text Formatting */}
              <ToolbarButton
                icon={<Bold className="w-4 h-4" />}
                onClick={() => execCommand('bold')}
                title="Bold (Ctrl+B)"
              />
              <ToolbarButton
                icon={<Italic className="w-4 h-4" />}
                onClick={() => execCommand('italic')}
                title="Italic (Ctrl+I)"
              />
              <ToolbarButton
                icon={<UnderlineIcon className="w-4 h-4" />}
                onClick={() => execCommand('underline')}
                title="Underline"
              />

              <ToolbarDivider />

              {/* Lists */}
              <ToolbarButton
                icon={<List className="w-4 h-4" />}
                onClick={() => execCommand('insertUnorderedList')}
                title="Bullet List"
              />
              <ToolbarButton
                icon={<ListOrdered className="w-4 h-4" />}
                onClick={() => execCommand('insertOrderedList')}
                title="Numbered List"
              />
              <ToolbarButton
                icon={<Quote className="w-4 h-4" />}
                onClick={() => execCommand('formatBlock', 'blockquote')}
                title="Quote"
              />

              <ToolbarDivider />

              {/* Alignment */}
              <ToolbarButton
                icon={<AlignLeft className="w-4 h-4" />}
                onClick={() => execCommand('justifyLeft')}
                title="Align Left"
              />
              <ToolbarButton
                icon={<AlignCenter className="w-4 h-4" />}
                onClick={() => execCommand('justifyCenter')}
                title="Center"
              />
              <ToolbarButton
                icon={<AlignRight className="w-4 h-4" />}
                onClick={() => execCommand('justifyRight')}
                title="Align Right"
              />

              <ToolbarDivider />

              {/* Insert */}
              <ToolbarButton
                icon={<Link2 className="w-4 h-4" />}
                onClick={() => setShowLinkDialog(true)}
                title="Insert Link"
              />
              <ToolbarButton
                icon={<ImageIcon className="w-4 h-4" />}
                onClick={() => setShowImageDialog(true)}
                title="Insert Image"
              />

              {/* More Options */}
              <div className="relative ml-auto" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => setShowMoreMenu(!showMoreMenu)}
                  className="p-2 text-gray-500 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
                {showMoreMenu && (
                  <div className="absolute top-full right-0 mt-1 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1">
                    <button
                      onClick={() => { setShowFindReplace(!showFindReplace); setShowMoreMenu(false); }}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Search className="w-4 h-4 text-gray-400" />
                      Find & Replace
                    </button>
                    <button
                      onClick={() => { execCommand('insertHorizontalRule'); setShowMoreMenu(false); }}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Minus className="w-4 h-4 text-gray-400" />
                      Horizontal Line
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Find/Replace Bar */}
          <FindReplaceBar
            isOpen={showFindReplace}
            onClose={() => setShowFindReplace(false)}
            content={content}
            onReplace={(newContent) => {
              if (editorRef.current) {
                editorRef.current.innerHTML = newContent;
              }
              onChange(newContent);
              addToHistory(newContent);
            }}
          />
        </div>

        {/* Main Content Area */}
        <div className="flex flex-1 overflow-hidden" style={{ height: editorHeight }}>
          {/* Editor Panel */}
          {(viewMode === 'edit' || viewMode === 'split') && (
            <div className={`flex-1 overflow-auto ${viewMode === 'split' ? 'border-r border-gray-200' : ''}`}>
              <div
                ref={editorRef}
                contentEditable
                onInput={handleContentChange}
                spellCheck={true}
                className="p-6 md:p-8 focus:outline-none prose prose-lg max-w-none min-h-full"
                style={{ lineHeight: 1.8 }}
                data-placeholder={placeholder}
              />
            </div>
          )}

          {/* Preview Panel */}
          {(viewMode === 'preview' || viewMode === 'split') && (
            <div className={`flex-1 overflow-auto bg-gray-50/50 ${viewMode === 'split' ? '' : ''}`}>
              <div className="max-w-3xl mx-auto p-6 md:p-8">
                <div
                  className="prose prose-lg max-w-none"
                  dangerouslySetInnerHTML={{ __html: markdownToHtml(content) }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Mobile Stats Bar */}
        <div className="md:hidden flex items-center justify-between px-3 py-2 border-t border-gray-200 bg-gray-50 text-xs text-gray-500">
          <span>{wordCount} words • {readTime} min</span>
          {isSaving ? (
            <span className="text-blue-600">Saving...</span>
          ) : hasChanges ? (
            <span className="text-yellow-600">Unsaved</span>
          ) : lastSaved ? (
            <span className="text-green-600">Saved</span>
          ) : null}
        </div>

        {/* Link Dialog */}
        {showLinkDialog && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white rounded-xl p-5 max-w-md w-full shadow-2xl">
              <h3 className="text-lg font-bold mb-4">Insert Link</h3>
              <input
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-[#1A403D]/20 focus:border-[#1A403D]"
                placeholder="https://example.com"
                onKeyPress={(e) => e.key === 'Enter' && insertLink()}
                autoFocus
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setShowLinkDialog(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={insertLink}
                  className="px-4 py-2 bg-[#1A403D] text-white rounded-lg hover:bg-[#152f2d] transition-colors"
                >
                  Insert
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Image Dialog */}
        <ImageDialog
          isOpen={showImageDialog}
          onClose={() => setShowImageDialog(false)}
          onInsert={handleImageInsert}
          onUpload={onImageUpload}
        />

        <style jsx>{`
          [contenteditable][data-placeholder]:empty:before {
            content: attr(data-placeholder);
            color: #9ca3af;
            pointer-events: none;
          }
          [contenteditable] img {
            max-width: 100%;
            height: auto;
            border-radius: 8px;
          }
          [contenteditable] blockquote {
            border-left: 4px solid #D1AA5A;
            padding-left: 1rem;
            margin: 1rem 0;
            font-style: italic;
            color: #6b7280;
          }
        `}</style>
      </div>
    </>
  );
};

export default EnhancedBlogEditor;
