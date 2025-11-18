"use client";

import React, { useState, useRef, useEffect } from 'react';
import {
  Bold, Italic, List, Hash, Quote, Type, AlignLeft, AlignCenter, AlignRight,
  Image as ImageIcon, Link2, Maximize2, Minimize2, X, Upload, Loader2,
  AlertCircle, CheckCircle, Sparkles, Eye, Code
} from 'lucide-react';
import { optimizeImage } from '@/lib/utils/imageOptimization';
import { suggestAltText } from '@/lib/utils/imageOptimization';

interface ImageInsertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (imageData: { url: string; alt: string; caption: string }) => void;
  onUpload: (file: File) => Promise<string>;
}

const ImageInsertDialog: React.FC<ImageInsertDialogProps> = ({
  isOpen,
  onClose,
  onInsert,
  onUpload
}) => {
  const [url, setUrl] = useState('');
  const [alt, setAlt] = useState('');
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [optimizationStats, setOptimizationStats] = useState<{
    original: number;
    optimized: number;
    savings: number;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setOptimizing(true);
    setUploadProgress('Optimizing image...');
    setOptimizationStats(null);

    try {
      // Optimize image first
      const optimized = await optimizeImage(file, {
        maxWidth: 1920,
        maxHeight: 1080,
        quality: 0.85,
        format: 'jpeg'
      });

      setOptimizationStats({
        original: optimized.originalSize,
        optimized: optimized.optimizedSize,
        savings: optimized.compressionRatio
      });

      setOptimizing(false);
      setUploading(true);
      setUploadProgress('Uploading optimized image...');

      // Upload optimized file
      const uploadedUrl = await onUpload(optimized.file);
      setUrl(uploadedUrl);

      // Auto-generate alt text from filename
      const filename = file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ');
      setAlt(filename.charAt(0).toUpperCase() + filename.slice(1));

      setUploadProgress('Upload complete!');
      setUploading(false);
    } catch (error) {
      setUploadProgress('Upload failed. Please try again.');
      setUploading(false);
      setOptimizing(false);
    }
  };

  const handleInsert = () => {
    if (!url) {
      alert('Please provide an image URL or upload an image');
      return;
    }
    if (!alt) {
      alert('Alt text is required for SEO and accessibility');
      return;
    }

    onInsert({ url, alt, caption });

    // Reset form
    setUrl('');
    setAlt('');
    setCaption('');
    setUploadProgress('');
    setOptimizationStats(null);
    onClose();
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <ImageIcon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Insert Image</h3>
                <p className="text-sm text-blue-100">Add image with SEO-optimized alt text</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Upload Section */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Upload Image
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              disabled={uploading || optimizing}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading || optimizing}
              className="w-full relative overflow-hidden group"
            >
              <div className="flex flex-col items-center justify-center gap-3 px-6 py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:border-blue-400 dark:hover:border-blue-500 transition-all group-hover:bg-blue-50 dark:group-hover:bg-blue-900/10 disabled:opacity-50">
                {uploading || optimizing ? (
                  <>
                    <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
                    <div className="text-center">
                      <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                        {uploadProgress}
                      </div>
                      {optimizationStats && (
                        <div className="text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-full inline-block">
                          Compressed {formatBytes(optimizationStats.original)} → {formatBytes(optimizationStats.optimized)}
                          <span className="ml-1 font-bold">
                            ({optimizationStats.savings.toFixed(1)}% savings!)
                          </span>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="p-4 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full">
                      <Upload className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="text-center">
                      <span className="text-base font-semibold text-gray-900 dark:text-white block">
                        Click to upload or drag and drop
                      </span>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        PNG, JPG, WebP up to 10MB
                      </p>
                      <div className="flex items-center justify-center gap-2 mt-2">
                        <Sparkles className="h-4 w-4 text-purple-500" />
                        <span className="text-xs font-medium text-purple-600 dark:text-purple-400">
                          Images will be automatically optimized (80%+ compression)
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-medium">
                or enter URL
              </span>
            </div>
          </div>

          {/* URL Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Image URL
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          {/* Alt Text (Required) */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Alt Text <span className="text-red-500">*</span>
              {!alt && (
                <span className="ml-2 text-xs text-red-500 bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded">
                  Required for SEO
                </span>
              )}
              {alt && (
                <span className="ml-2 text-xs text-green-500 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded flex items-center gap-1 inline-flex">
                  <CheckCircle className="h-3 w-3" />
                  Valid
                </span>
              )}
            </label>
            <input
              type="text"
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
              className={`w-full px-4 py-3 border-2 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 transition-all ${
                alt
                  ? 'border-green-200 dark:border-green-800 focus:ring-green-500 focus:border-green-500'
                  : 'border-gray-200 dark:border-gray-700 focus:ring-blue-500 focus:border-blue-500'
              }`}
              placeholder="Describe what's in the image (e.g., 'Mountain view from Pokhara homestay')"
              required
            />
            <p className="mt-2 text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              Describe the image for visually impaired users and search engines
            </p>
          </div>

          {/* Caption (Optional) */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Caption <span className="text-gray-400 text-xs">(Optional)</span>
            </label>
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              placeholder="Optional caption to display below the image"
            />
          </div>

          {/* Preview */}
          {url && (
            <div className="border-2 border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-900/50">
              <div className="px-4 py-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
                <Eye className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Preview
                </span>
              </div>
              <div className="p-4">
                <img
                  src={url}
                  alt={alt || 'Preview'}
                  className="max-w-full h-auto rounded-lg shadow-lg"
                  style={{ maxHeight: '300px', margin: '0 auto' }}
                />
                {caption && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 text-center mt-3 italic">
                    {caption}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleInsert}
            disabled={!url || !alt}
            className="px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center gap-2"
          >
            <CheckCircle className="h-4 w-4" />
            Insert Image
          </button>
        </div>
      </div>
    </div>
  );
};

interface ImprovedRichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  onImageUpload: (file: File) => Promise<string>;
}

export const ImprovedRichTextEditor: React.FC<ImprovedRichTextEditorProps> = ({
  content,
  onChange,
  onImageUpload
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (editorRef.current && content && !editorRef.current.innerHTML) {
      editorRef.current.innerHTML = content;
    }
    updateCounts();
  }, [content]);

  const updateCounts = () => {
    if (editorRef.current) {
      const text = editorRef.current.innerText;
      const words = text.trim().split(/\s+/).filter(w => w.length > 0);
      setWordCount(words.length);
      setCharCount(text.length);
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
      updateCounts();
    }
  };

  const handleImageInsert = (imageData: { url: string; alt: string; caption: string }) => {
    const imgHtml = imageData.caption
      ? `<figure style="margin: 24px 0; text-align: center;"><img src="${imageData.url}" alt="${imageData.alt}" style="max-width: 100%; height: auto; border-radius: 16px; box-shadow: 0 10px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);" /><figcaption style="text-align: center; color: #6b7280; font-size: 14px; margin-top: 12px; font-style: italic;">${imageData.caption}</figcaption></figure>`
      : `<img src="${imageData.url}" alt="${imageData.alt}" style="max-width: 100%; height: auto; border-radius: 16px; box-shadow: 0 10px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1); margin: 24px 0; display: block;" />`;

    execCommand('insertHTML', imgHtml);
  };

  const insertLink = () => {
    if (linkUrl) {
      execCommand('createLink', linkUrl);
      setLinkUrl('');
      setShowLinkDialog(false);
    }
  };

  const toolbarButtons = [
    { icon: Bold, command: 'bold', title: 'Bold (Ctrl+B)', group: 'text', color: 'blue' },
    { icon: Italic, command: 'italic', title: 'Italic (Ctrl+I)', group: 'text', color: 'blue' },
    { icon: Type, command: 'underline', title: 'Underline (Ctrl+U)', group: 'text', color: 'blue' },
    { icon: List, command: 'insertUnorderedList', title: 'Bullet List', group: 'list', color: 'green' },
    { icon: Hash, command: 'insertOrderedList', title: 'Numbered List', group: 'list', color: 'green' },
    { icon: AlignLeft, command: 'justifyLeft', title: 'Align Left', group: 'align', color: 'purple' },
    { icon: AlignCenter, command: 'justifyCenter', title: 'Align Center', group: 'align', color: 'purple' },
    { icon: AlignRight, command: 'justifyRight', title: 'Align Right', group: 'align', color: 'purple' },
    { icon: Quote, command: 'formatBlock', value: 'blockquote', title: 'Quote', group: 'format', color: 'orange' },
  ];

  const headingButtons = [
    { label: 'H1', command: 'formatBlock', value: 'h1', size: 'text-2xl' },
    { label: 'H2', command: 'formatBlock', value: 'h2', size: 'text-xl' },
    { label: 'H3', command: 'formatBlock', value: 'h3', size: 'text-lg' },
    { label: 'P', command: 'formatBlock', value: 'p', size: 'text-base' },
  ];

  const getWordCountColor = () => {
    if (wordCount < 300) return 'text-red-600 dark:text-red-400';
    if (wordCount < 800) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-green-600 dark:text-green-400';
  };

  return (
    <>
      <div className={`border-2 ${isFocused ? 'border-blue-500 ring-4 ring-blue-100 dark:ring-blue-900/30' : 'border-gray-200 dark:border-gray-700'} rounded-2xl overflow-hidden bg-white dark:bg-gray-800 transition-all duration-300 shadow-lg ${isFullscreen ? 'fixed inset-4 z-50' : ''}`}>
        {/* Toolbar */}
        <div className="bg-gradient-to-r from-gray-50 via-white to-gray-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 border-b-2 border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between p-4 flex-wrap gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Text Formatting */}
              <div className="flex items-center gap-1 bg-white dark:bg-gray-800 rounded-xl p-1.5 shadow-md border border-gray-200 dark:border-gray-700">
                {toolbarButtons.filter(b => b.group === 'text').map((btn, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => execCommand(btn.command, btn.value)}
                    className="p-2.5 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all hover:scale-110 group"
                    title={btn.title}
                  >
                    <btn.icon className="h-4 w-4 text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                  </button>
                ))}
              </div>

              {/* Headings */}
              <div className="flex items-center gap-1 bg-white dark:bg-gray-800 rounded-xl p-1.5 shadow-md border border-gray-200 dark:border-gray-700">
                {headingButtons.map((btn, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => execCommand(btn.command, btn.value)}
                    className={`px-3 py-2 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-lg font-bold transition-all hover:scale-105 ${btn.size} text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400`}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>

              {/* Lists */}
              <div className="flex items-center gap-1 bg-white dark:bg-gray-800 rounded-xl p-1.5 shadow-md border border-gray-200 dark:border-gray-700">
                {toolbarButtons.filter(b => b.group === 'list').map((btn, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => execCommand(btn.command, btn.value)}
                    className="p-2.5 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-all hover:scale-110 group"
                    title={btn.title}
                  >
                    <btn.icon className="h-4 w-4 text-gray-600 dark:text-gray-400 group-hover:text-green-600 dark:group-hover:text-green-400" />
                  </button>
                ))}
              </div>

              {/* Media */}
              <div className="flex items-center gap-1 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 rounded-xl p-1.5 shadow-md border-2 border-blue-200 dark:border-blue-800">
                <button
                  type="button"
                  onClick={() => setShowImageDialog(true)}
                  className="px-3 py-2 bg-white dark:bg-gray-800 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 dark:hover:from-green-900/30 dark:hover:to-emerald-900/30 rounded-lg transition-all hover:scale-105 flex items-center gap-2 group border border-transparent hover:border-green-200 dark:hover:border-green-800"
                  title="Insert Image with Alt Text & Caption"
                >
                  <ImageIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <span className="text-xs font-semibold text-green-700 dark:text-green-300">Add Image</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowLinkDialog(true)}
                  className="p-2.5 bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all hover:scale-110 group"
                  title="Insert Link"
                >
                  <Link2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </button>
              </div>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 rounded-xl shadow-sm border border-blue-200 dark:border-blue-800">
                <div className="text-xs">
                  <div className={`font-bold ${getWordCountColor()}`}>
                    {wordCount} words
                  </div>
                  <div className="text-gray-500 dark:text-gray-400">
                    {charCount} chars
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-2.5 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all shadow-md border border-gray-200 dark:border-gray-700"
                title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
              >
                {isFullscreen ? (
                  <Minimize2 className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                ) : (
                  <Maximize2 className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Editor Content */}
        <div
          ref={editorRef}
          contentEditable
          onInput={handleContentChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="p-8 focus:outline-none prose prose-lg dark:prose-invert max-w-none min-h-[500px] bg-white dark:bg-gray-900"
          style={{
            maxHeight: isFullscreen ? 'calc(100vh - 200px)' : '700px',
            overflowY: 'auto',
            lineHeight: '1.8'
          }}
          placeholder="Start writing your amazing content here..."
        />
      </div>

      {/* Link Dialog */}
      {showLinkDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Insert Link</h3>
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl mb-4 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              placeholder="https://example.com"
              onKeyPress={(e) => e.key === 'Enter' && insertLink()}
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowLinkDialog(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={insertLink}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
              >
                Insert
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Dialog */}
      <ImageInsertDialog
        isOpen={showImageDialog}
        onClose={() => setShowImageDialog(false)}
        onInsert={handleImageInsert}
        onUpload={onImageUpload}
      />
    </>
  );
};

export default ImprovedRichTextEditor;
