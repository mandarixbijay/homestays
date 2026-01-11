"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  Bold, Italic, List, Hash, Quote, Type, AlignLeft, AlignCenter, AlignRight,
  Image as ImageIcon, Link2, Maximize2, Minimize2, X, Upload, Loader2,
  AlertCircle, CheckCircle, Underline as UnderlineIcon, Eye, Edit3,
  SplitSquareHorizontal, Save, Clock, Undo, Redo, Search, Replace,
  Heading1, Heading2, Heading3, Heading4, ListOrdered, Minus, ChevronDown,
  FileText, PanelLeftClose, PanelLeftOpen
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
  autoSaveInterval?: number; // milliseconds, default 30000 (30 seconds)
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
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-[#1A403D] to-[#224240] text-white p-6 rounded-t-2xl flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold">Add Image</h3>
            <p className="text-sm text-white/80 mt-1">Upload image with alt text</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {onUpload && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Upload Image</label>
              <label className="block cursor-pointer">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={uploading || optimizing}
                  className="hidden"
                />
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-[#1A403D] transition-colors">
                  {uploading || optimizing ? (
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="h-12 w-12 animate-spin text-[#1A403D]" />
                      <p className="text-sm font-medium text-gray-600">
                        {optimizing ? 'Optimizing...' : 'Uploading...'}
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-4 bg-blue-100 rounded-full">
                        <Upload className="h-8 w-8 text-[#1A403D]" />
                      </div>
                      <div>
                        <p className="text-base font-semibold text-gray-900">Click to upload</p>
                        <p className="text-sm text-gray-500 mt-1">Auto-optimized</p>
                      </div>
                    </div>
                  )}
                </div>
              </label>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Image URL</label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A403D]/20 focus:border-[#1A403D]"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Alt Text <span className="text-red-500">*</span>
              {alt && (
                <span className="ml-2 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                  <CheckCircle className="h-3 w-3 inline mr-1" />Valid
                </span>
              )}
            </label>
            <input
              type="text"
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A403D]/20 focus:border-[#1A403D]"
              placeholder="Describe the image"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Caption <span className="text-xs text-gray-500">(Optional)</span>
            </label>
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A403D]/20 focus:border-[#1A403D]"
              placeholder="Optional caption"
            />
          </div>

          {url && (
            <div className="border rounded-lg overflow-hidden">
              <div className="px-4 py-2 bg-gray-50 border-b">
                <span className="text-sm font-medium">Preview</span>
              </div>
              <div className="p-4 bg-gray-50">
                <img src={url} alt={alt || 'Preview'} className="max-w-full h-auto rounded-lg shadow-lg mx-auto" style={{ maxHeight: '300px' }} />
                {caption && <p className="text-sm text-gray-600 text-center mt-3 italic">{caption}</p>}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50 rounded-b-2xl">
          <button onClick={onClose} className="px-6 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-200 rounded-lg">
            Cancel
          </button>
          <button
            onClick={handleInsert}
            disabled={!url || !alt}
            className="px-6 py-2.5 text-sm font-semibold text-white bg-[#1A403D] hover:bg-[#152f2d] rounded-lg disabled:opacity-50 shadow-lg flex items-center gap-2"
          >
            <CheckCircle className="h-4 w-4" />Insert
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
    <div className="bg-gray-50 border-b border-gray-200 p-3 animate-in slide-in-from-top duration-200">
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={findText}
            onChange={(e) => setFindText(e.target.value)}
            placeholder="Find..."
            className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A403D]/20"
          />
          {matchCount > 0 && (
            <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
              {matchCount} found
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <Replace className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={replaceText}
            onChange={(e) => setReplaceText(e.target.value)}
            placeholder="Replace with..."
            className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A403D]/20"
          />
          <button
            onClick={handleReplace}
            disabled={!findText}
            className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm disabled:opacity-50"
          >
            Replace
          </button>
          <button
            onClick={handleReplaceAll}
            disabled={!findText}
            className="px-3 py-1.5 bg-[#1A403D] text-white hover:bg-[#152f2d] rounded-lg text-sm disabled:opacity-50"
          >
            Replace All
          </button>
        </div>
        <button onClick={onClose} className="p-1.5 hover:bg-gray-200 rounded-lg">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// DOCUMENT OUTLINE PANEL
// ============================================================================

const DocumentOutline: React.FC<{
  content: string;
  onNavigate: (line: number) => void;
}> = ({ content, onNavigate }) => {
  const outline = useMemo(() => {
    const lines = content.split('\n');
    const headings: { level: number; text: string; line: number }[] = [];

    lines.forEach((line, idx) => {
      if (line.startsWith('#### ')) {
        headings.push({ level: 4, text: line.replace('#### ', ''), line: idx });
      } else if (line.startsWith('### ')) {
        headings.push({ level: 3, text: line.replace('### ', ''), line: idx });
      } else if (line.startsWith('## ')) {
        headings.push({ level: 2, text: line.replace('## ', ''), line: idx });
      } else if (line.startsWith('# ')) {
        headings.push({ level: 1, text: line.replace('# ', ''), line: idx });
      }
    });

    return headings;
  }, [content]);

  const stats = useMemo(() => {
    const text = content.replace(/<[^>]*>/g, '');
    const words = text.split(/\s+/).filter(w => w.length > 0).length;
    const chars = text.length;
    const paragraphs = content.split(/\n\n+/).filter(Boolean).length;
    const readingTime = Math.ceil(words / 200);

    return { words, chars, paragraphs, readingTime, headings: outline.length };
  }, [content, outline]);

  return (
    <div className="p-4 space-y-4">
      <h3 className="font-semibold text-gray-900 flex items-center gap-2">
        <FileText className="w-4 h-4" />
        Document Outline
      </h3>

      {outline.length === 0 ? (
        <p className="text-sm text-gray-500 italic">
          No headings found. Add headings to create an outline.
        </p>
      ) : (
        <nav className="space-y-1 max-h-64 overflow-y-auto">
          {outline.map((heading, idx) => (
            <button
              key={idx}
              onClick={() => onNavigate(heading.line)}
              className={`w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-gray-100 transition-colors truncate ${
                heading.level === 1 ? 'font-bold text-gray-900' :
                heading.level === 2 ? 'font-semibold text-gray-800 pl-4' :
                heading.level === 3 ? 'text-gray-700 pl-6' :
                'text-gray-500 pl-8'
              }`}
            >
              {heading.text || '(empty heading)'}
            </button>
          ))}
        </nav>
      )}

      <div className="pt-4 border-t border-gray-200">
        <h4 className="font-medium text-sm text-gray-700 mb-3">Document Stats</h4>
        <div className="grid grid-cols-2 gap-2">
          <div className="p-3 bg-gray-50 rounded-lg text-center">
            <p className="text-xl font-bold text-[#1A403D]">{stats.words.toLocaleString()}</p>
            <p className="text-xs text-gray-500">Words</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg text-center">
            <p className="text-xl font-bold text-[#1A403D]">{stats.readingTime}</p>
            <p className="text-xs text-gray-500">Min Read</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg text-center">
            <p className="text-xl font-bold text-[#1A403D]">{stats.paragraphs}</p>
            <p className="text-xs text-gray-500">Paragraphs</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg text-center">
            <p className="text-xl font-bold text-[#1A403D]">{stats.headings}</p>
            <p className="text-xs text-gray-500">Headings</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const EnhancedBlogEditor: React.FC<EnhancedBlogEditorProps> = ({
  content,
  onChange,
  onImageUpload,
  onAutoSave,
  placeholder = 'Start writing... Paste from Google Docs works perfectly!',
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
  const [showOutlinePanel, setShowOutlinePanel] = useState(false);

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
      // Small delay to ensure DOM is ready
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

      // Debounce history
      const timer = setTimeout(() => {
        addToHistory(newContent);
      }, 500);
      return () => clearTimeout(timer);
    }
  };

  const handleImageInsert = (data: { url: string; alt: string; caption?: string }) => {
    const imgHtml = data.caption
      ? `<figure style="margin: 24px 0;"><img src="${data.url}" alt="${data.alt}" style="max-width: 100%; height: auto; border-radius: 12px;" /><figcaption style="text-align: center; color: #6b7280; font-size: 14px; margin-top: 8px; font-style: italic;">${data.caption}</figcaption></figure>`
      : `<img src="${data.url}" alt="${data.alt}" style="max-width: 100%; height: auto; border-radius: 12px; margin: 24px 0;" />`;

    execCommand('insertHTML', imgHtml);
  };

  const insertLink = () => {
    if (linkUrl) {
      execCommand('createLink', linkUrl);
      setLinkUrl('');
      setShowLinkDialog(false);
    }
  };

  const handleOutlineNavigate = (lineNumber: number) => {
    // This is a simplified navigation - in a real implementation you'd
    // need to map line numbers to DOM positions
    editorRef.current?.focus();
  };

  // Markdown to HTML for preview
  const markdownToHtml = useCallback((md: string): string => {
    if (!md) return '<p class="text-gray-400 italic">No content yet...</p>';

    // If content already has HTML tags, return as-is
    if (md.includes('<')) return md;

    let html = md
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full h-auto rounded-lg my-4" />')
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
        processedLines.push(`<h2 class="text-2xl font-bold mt-10 mb-4 pb-2 border-b border-gray-200">${line.slice(3)}</h2>`);
      } else if (line.startsWith('# ')) {
        processedLines.push(`<h1 class="text-3xl font-bold mt-10 mb-5">${line.slice(2)}</h1>`);
      } else if (line.startsWith('> ')) {
        processedLines.push(`<blockquote class="border-l-4 border-[#D1AA5A] bg-gray-50 py-4 px-6 my-4 italic text-gray-700 rounded-r-lg">${line.slice(2)}</blockquote>`);
      } else if (line.startsWith('- ') || line.startsWith('* ')) {
        processedLines.push(`<li class="ml-6 mb-2">${line.slice(2)}</li>`);
      } else if (line.match(/^\d+\.\s/)) {
        processedLines.push(`<li class="ml-6 mb-2 list-decimal">${line.replace(/^\d+\.\s/, '')}</li>`);
      } else if (line.startsWith('---')) {
        processedLines.push('<hr class="my-8 border-gray-200" />');
      } else if (line.trim()) {
        processedLines.push(`<p class="mb-4 leading-relaxed text-gray-700">${line}</p>`);
      }
    });

    return processedLines.join('') || '<p class="text-gray-400 italic">No content yet...</p>';
  }, []);

  return (
    <>
      {/* Fullscreen backdrop */}
      {isFullscreen && (
        <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setIsFullscreen(false)} />
      )}
      <div className={`bg-white rounded-2xl overflow-hidden shadow-lg border-2 border-gray-200 flex flex-col ${isFullscreen ? 'fixed inset-4 z-50' : ''}`}>
      {/* Primary Toolbar */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100">
          {/* Left: View Mode Toggle */}
          <div className="flex items-center gap-1 p-1 bg-white rounded-lg shadow-sm border">
            <button
              onClick={() => setViewMode('edit')}
              className={`px-3 py-1.5 text-sm rounded-md transition-all flex items-center gap-1.5 ${
                viewMode === 'edit' ? 'bg-[#1A403D] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Edit3 className="w-4 h-4" />
              Edit
            </button>
            <button
              onClick={() => setViewMode('split')}
              className={`px-3 py-1.5 text-sm rounded-md transition-all flex items-center gap-1.5 ${
                viewMode === 'split' ? 'bg-[#1A403D] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <SplitSquareHorizontal className="w-4 h-4" />
              Split
            </button>
            <button
              onClick={() => setViewMode('preview')}
              className={`px-3 py-1.5 text-sm rounded-md transition-all flex items-center gap-1.5 ${
                viewMode === 'preview' ? 'bg-[#1A403D] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Eye className="w-4 h-4" />
              Preview
            </button>
          </div>

          {/* Center: Stats */}
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="font-medium">{wordCount.toLocaleString()} words</span>
            <span>•</span>
            <span>{readTime} min read</span>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            {/* Auto-save Status */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm">
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                  <span className="text-blue-600">Saving...</span>
                </>
              ) : hasChanges ? (
                <>
                  <span className="w-2 h-2 bg-yellow-500 rounded-full" />
                  <span className="text-yellow-600">Unsaved</span>
                </>
              ) : lastSaved ? (
                <>
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-green-600">Saved</span>
                </>
              ) : null}
            </div>

            <button
              onClick={() => setShowOutlinePanel(!showOutlinePanel)}
              className={`p-2 rounded-lg transition-colors ${showOutlinePanel ? 'bg-[#1A403D] text-white' : 'hover:bg-gray-200'}`}
              title="Toggle outline panel"
            >
              {showOutlinePanel ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeftOpen className="w-5 h-5" />}
            </button>

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              title={isFullscreen ? 'Exit fullscreen (Esc)' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Formatting Toolbar - Only show in edit or split mode */}
        {viewMode !== 'preview' && (
          <div className="flex items-center gap-1 px-4 py-2 overflow-x-auto">
            {/* Undo/Redo */}
            <div className="flex items-center gap-1 pr-2 border-r border-gray-200">
              <button
                onClick={handleUndo}
                disabled={historyIndex <= 0}
                className="p-2 hover:bg-gray-200 rounded-lg disabled:opacity-30 transition-colors"
                title="Undo (Ctrl+Z)"
              >
                <Undo className="w-4 h-4" />
              </button>
              <button
                onClick={handleRedo}
                disabled={historyIndex >= history.length - 1}
                className="p-2 hover:bg-gray-200 rounded-lg disabled:opacity-30 transition-colors"
                title="Redo (Ctrl+Shift+Z)"
              >
                <Redo className="w-4 h-4" />
              </button>
            </div>

            {/* Text Formatting */}
            <div className="flex items-center gap-1 px-2 border-r border-gray-200">
              <button onClick={() => execCommand('bold')} className="p-2 hover:bg-gray-200 rounded-lg transition-colors" title="Bold (Ctrl+B)">
                <Bold className="w-4 h-4" />
              </button>
              <button onClick={() => execCommand('italic')} className="p-2 hover:bg-gray-200 rounded-lg transition-colors" title="Italic (Ctrl+I)">
                <Italic className="w-4 h-4" />
              </button>
              <button onClick={() => execCommand('underline')} className="p-2 hover:bg-gray-200 rounded-lg transition-colors" title="Underline">
                <UnderlineIcon className="w-4 h-4" />
              </button>
            </div>

            {/* Headings Dropdown */}
            <div className="relative px-2 border-r border-gray-200">
              <button
                onClick={() => setShowHeadingMenu(!showHeadingMenu)}
                className="flex items-center gap-1 px-3 py-2 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <Type className="w-4 h-4" />
                <span className="text-sm">Heading</span>
                <ChevronDown className="w-3 h-3" />
              </button>
              {showHeadingMenu && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-50">
                  <button onClick={() => { execCommand('formatBlock', 'h1'); setShowHeadingMenu(false); }} className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2">
                    <Heading1 className="w-4 h-4" />
                    <span className="text-xl font-bold">Heading 1</span>
                  </button>
                  <button onClick={() => { execCommand('formatBlock', 'h2'); setShowHeadingMenu(false); }} className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2">
                    <Heading2 className="w-4 h-4" />
                    <span className="text-lg font-bold">Heading 2</span>
                  </button>
                  <button onClick={() => { execCommand('formatBlock', 'h3'); setShowHeadingMenu(false); }} className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2">
                    <Heading3 className="w-4 h-4" />
                    <span className="text-base font-bold">Heading 3</span>
                  </button>
                  <button onClick={() => { execCommand('formatBlock', 'h4'); setShowHeadingMenu(false); }} className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2">
                    <Heading4 className="w-4 h-4" />
                    <span className="text-sm font-bold">Heading 4</span>
                  </button>
                  <div className="border-t border-gray-100" />
                  <button onClick={() => { execCommand('formatBlock', 'p'); setShowHeadingMenu(false); }} className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2">
                    <Type className="w-4 h-4" />
                    <span>Paragraph</span>
                  </button>
                </div>
              )}
            </div>

            {/* Lists */}
            <div className="flex items-center gap-1 px-2 border-r border-gray-200">
              <button onClick={() => execCommand('insertUnorderedList')} className="p-2 hover:bg-gray-200 rounded-lg transition-colors" title="Bullet List">
                <List className="w-4 h-4" />
              </button>
              <button onClick={() => execCommand('insertOrderedList')} className="p-2 hover:bg-gray-200 rounded-lg transition-colors" title="Numbered List">
                <ListOrdered className="w-4 h-4" />
              </button>
              <button onClick={() => execCommand('formatBlock', 'blockquote')} className="p-2 hover:bg-gray-200 rounded-lg transition-colors" title="Quote">
                <Quote className="w-4 h-4" />
              </button>
            </div>

            {/* Alignment */}
            <div className="flex items-center gap-1 px-2 border-r border-gray-200">
              <button onClick={() => execCommand('justifyLeft')} className="p-2 hover:bg-gray-200 rounded-lg transition-colors" title="Align Left">
                <AlignLeft className="w-4 h-4" />
              </button>
              <button onClick={() => execCommand('justifyCenter')} className="p-2 hover:bg-gray-200 rounded-lg transition-colors" title="Center">
                <AlignCenter className="w-4 h-4" />
              </button>
              <button onClick={() => execCommand('justifyRight')} className="p-2 hover:bg-gray-200 rounded-lg transition-colors" title="Align Right">
                <AlignRight className="w-4 h-4" />
              </button>
            </div>

            {/* Insert */}
            <div className="flex items-center gap-1 px-2 border-r border-gray-200">
              <button onClick={() => setShowLinkDialog(true)} className="p-2 hover:bg-gray-200 rounded-lg transition-colors" title="Insert Link">
                <Link2 className="w-4 h-4" />
              </button>
              <button onClick={() => setShowImageDialog(true)} className="p-2 hover:bg-gray-200 rounded-lg transition-colors" title="Insert Image">
                <ImageIcon className="w-4 h-4" />
              </button>
              <button onClick={() => execCommand('insertHorizontalRule')} className="p-2 hover:bg-gray-200 rounded-lg transition-colors" title="Horizontal Line">
                <Minus className="w-4 h-4" />
              </button>
            </div>

            {/* Find/Replace */}
            <button
              onClick={() => setShowFindReplace(!showFindReplace)}
              className={`p-2 hover:bg-gray-200 rounded-lg transition-colors ${showFindReplace ? 'bg-gray-200' : ''}`}
              title="Find & Replace (Ctrl+F)"
            >
              <Search className="w-4 h-4" />
            </button>
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
      <div className="flex" style={{ height: isFullscreen ? 'calc(100vh - 180px)' : '500px' }}>
        {/* Editor Panel */}
        {(viewMode === 'edit' || viewMode === 'split') && (
          <div className={`flex-1 overflow-auto ${viewMode === 'split' ? 'border-r border-gray-200' : ''}`}>
            <div
              ref={editorRef}
              contentEditable
              onInput={handleContentChange}
              className="p-8 focus:outline-none prose prose-lg max-w-none h-full"
              style={{ lineHeight: 1.8, fontSize: '16px' }}
              data-placeholder={placeholder}
            />
          </div>
        )}

        {/* Preview Panel */}
        {(viewMode === 'preview' || viewMode === 'split') && (
          <div className={`flex-1 overflow-auto bg-white ${viewMode === 'split' ? '' : ''}`}>
            <div className="max-w-3xl mx-auto p-8">
              <div
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: markdownToHtml(content) }}
              />
            </div>
          </div>
        )}

        {/* Outline Panel */}
        {showOutlinePanel && (
          <div className="w-72 border-l border-gray-200 bg-gray-50 overflow-y-auto">
            <DocumentOutline content={content} onNavigate={handleOutlineNavigate} />
          </div>
        )}
      </div>

      {/* Link Dialog */}
      {showLinkDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold mb-4">Insert Link</h3>
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              className="w-full px-4 py-3 border-2 rounded-xl mb-4 focus:border-[#1A403D] focus:ring-2 focus:ring-[#1A403D]/20"
              placeholder="https://example.com"
              onKeyPress={(e) => e.key === 'Enter' && insertLink()}
              autoFocus
            />
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowLinkDialog(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl">
                Cancel
              </button>
              <button onClick={insertLink} className="px-4 py-2 bg-[#1A403D] text-white rounded-xl hover:bg-[#152f2d]">
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
      `}</style>
      </div>
    </>
  );
};

export default EnhancedBlogEditor;
