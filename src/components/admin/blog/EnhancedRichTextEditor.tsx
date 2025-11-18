"use client";

import React, { useState, useRef, useEffect } from 'react';
import {
  Bold, Italic, List, Hash, Quote, Type, AlignLeft, AlignCenter, AlignRight,
  Image as ImageIcon, Link2, Maximize2, Minimize2, X, Upload, Loader2
} from 'lucide-react';

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
  const [uploadProgress, setUploadProgress] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadProgress('Uploading image...');

    try {
      const uploadedUrl = await onUpload(file);
      setUrl(uploadedUrl);
      // Auto-generate alt text from filename
      const filename = file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ');
      setAlt(filename.charAt(0).toUpperCase() + filename.slice(1));
      setUploadProgress('Upload complete!');
    } catch (error) {
      setUploadProgress('Upload failed. Please try again.');
    } finally {
      setUploading(false);
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
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-blue-500" />
            Insert Image
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Upload Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Upload Image
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-400 dark:hover:border-blue-500 transition-colors disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">{uploadProgress}</span>
                </>
              ) : (
                <>
                  <Upload className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Click to upload</span>
                </>
              )}
            </button>
          </div>

          <div className="text-center text-sm text-gray-500 dark:text-gray-400">or</div>

          {/* URL Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Image URL
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          {/* Alt Text (Required) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Alt Text <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
              placeholder="Describe the image for SEO and accessibility"
              required
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Required for SEO and accessibility. Describe what&apos;s in the image.
            </p>
          </div>

          {/* Caption (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Caption (Optional)
            </label>
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
              placeholder="Optional caption to display below the image"
            />
          </div>

          {/* Preview */}
          {url && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Preview
              </label>
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                <img
                  src={url}
                  alt={alt || 'Preview'}
                  className="max-w-full h-auto rounded"
                  style={{ maxHeight: '200px' }}
                />
                {caption && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 text-center mt-2">
                    {caption}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleInsert}
            disabled={!url || !alt}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Insert Image
          </button>
        </div>
      </div>
    </div>
  );
};

interface EnhancedRichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  onImageUpload: (file: File) => Promise<string>;
}

export const EnhancedRichTextEditor: React.FC<EnhancedRichTextEditorProps> = ({
  content,
  onChange,
  onImageUpload
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [wordCount, setWordCount] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [showImageDialog, setShowImageDialog] = useState(false);
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

  const handleImageInsert = (imageData: { url: string; alt: string; caption: string }) => {
    const imgHtml = imageData.caption
      ? `<figure style="margin: 20px 0;"><img src="${imageData.url}" alt="${imageData.alt}" style="max-width: 100%; height: auto; border-radius: 12px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);" /><figcaption style="text-align: center; color: #6b7280; font-size: 14px; margin-top: 8px;">${imageData.caption}</figcaption></figure>`
      : `<img src="${imageData.url}" alt="${imageData.alt}" style="max-width: 100%; height: auto; border-radius: 12px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); margin: 20px 0;" />`;

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
    <>
      <div className={`border-2 border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-white dark:bg-gray-800 transition-all duration-300 ${isFullscreen ? 'fixed inset-4 z-50' : ''}`}>
        {/* Toolbar */}
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

              {/* Lists & Alignment */}
              <div className="flex items-center gap-1 bg-white dark:bg-gray-700 rounded-lg p-1 shadow-sm">
                {toolbarButtons.filter(b => b.group === 'list' || b.group === 'align').slice(0, 4).map((btn, idx) => (
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

              {/* Media */}
              <div className="flex items-center gap-1 bg-white dark:bg-gray-700 rounded-lg p-1 shadow-sm">
                <button
                  type="button"
                  onClick={() => setShowImageDialog(true)}
                  className="p-2 hover:bg-green-50 dark:hover:bg-green-900/30 rounded transition-all hover:scale-110"
                  title="Insert Image with Alt Text"
                >
                  <ImageIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
                </button>
                <button
                  type="button"
                  onClick={() => setShowLinkDialog(true)}
                  className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-all hover:scale-110"
                  title="Insert Link"
                >
                  <Link2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </button>
              </div>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-600 dark:text-gray-400 px-3 py-1 bg-white dark:bg-gray-700 rounded-full">
                {wordCount} words
              </span>
              <button
                type="button"
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-2 hover:bg-white dark:hover:bg-gray-700 rounded transition-all"
                title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
              >
                {isFullscreen ? (
                  <Minimize2 className="h-4 w-4 text-gray-700 dark:text-gray-300" />
                ) : (
                  <Maximize2 className="h-4 w-4 text-gray-700 dark:text-gray-300" />
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
          className="p-6 focus:outline-none prose prose-lg dark:prose-invert max-w-none min-h-[400px]"
          style={{ maxHeight: isFullscreen ? 'calc(100vh - 200px)' : '600px', overflowY: 'auto' }}
        />
      </div>

      {/* Link Dialog */}
      {showLinkDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Insert Link</h3>
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded mb-4"
              placeholder="https://example.com"
            />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowLinkDialog(false)} className="px-4 py-2 text-gray-600">
                Cancel
              </button>
              <button onClick={insertLink} className="px-4 py-2 bg-blue-600 text-white rounded">
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

export default EnhancedRichTextEditor;
