"use client";

import React, { useState, useRef, useEffect } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import { optimizeImage } from '@/lib/utils/imageOptimization';
import {
  X, Upload, Loader2, CheckCircle, AlertCircle
} from 'lucide-react';

interface ImageDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (data: { url: string; alt: string; caption?: string }) => void;
  imageUrl?: string;
  onUpload?: (file: File) => Promise<string>;
}

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

  useEffect(() => {
    if (initialUrl) {
      setUrl(initialUrl);
    }
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold">Add Image</h3>
            <p className="text-sm text-blue-100 mt-1">Upload or paste an image with alt text</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {onUpload && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Upload Image
              </label>
              <label className="block cursor-pointer">
                <input type="file" accept="image/*" onChange={handleFileUpload} disabled={uploading || optimizing} className="hidden" />
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-8 text-center hover:border-blue-400 dark:hover:border-blue-500 transition-colors">
                  {uploading || optimizing ? (
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {optimizing ? 'Optimizing image...' : 'Uploading...'}
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                        <Upload className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-base font-semibold text-gray-900 dark:text-white">Click to upload</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">PNG, JPG, WebP (auto-optimized)</p>
                      </div>
                    </div>
                  )}
                </div>
              </label>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Image URL</label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Alt Text <span className="text-red-500">*</span>
              {alt && (
                <span className="ml-2 text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full">
                  <CheckCircle className="h-3 w-3 inline mr-1" />Valid
                </span>
              )}
            </label>
            <input
              type="text"
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Describe the image"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Caption <span className="text-xs text-gray-500">(Optional)</span>
            </label>
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Optional caption"
            />
          </div>

          {url && (
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Preview</span>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-900">
                <img src={url} alt={alt || 'Preview'} className="max-w-full h-auto rounded-lg shadow-lg mx-auto" style={{ maxHeight: '300px' }} />
                {caption && <p className="text-sm text-gray-600 dark:text-gray-400 text-center mt-3 italic">{caption}</p>}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-b-2xl">
          <button type="button" onClick={onClose} className="px-6 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg">
            Cancel
          </button>
          <button
            type="button"
            onClick={handleInsert}
            disabled={!url || !alt}
            className="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center gap-2"
          >
            <CheckCircle className="h-4 w-4" />Insert Image
          </button>
        </div>
      </div>
    </div>
  );
};

interface QuillEditorProps {
  content: string;
  onChange: (content: string) => void;
  onImageUpload?: (file: File) => Promise<string>;
  placeholder?: string;
}

export const QuillEditor: React.FC<QuillEditorProps> = ({
  content,
  onChange,
  onImageUpload,
  placeholder = 'Start writing your amazing content here... Paste from Google Docs works perfectly!'
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<Quill | null>(null);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !editorRef.current || quillRef.current) return;

    // Initialize Quill
    const quill = new Quill(editorRef.current, {
      theme: 'snow',
      placeholder,
      modules: {
        toolbar: {
          container: [
            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
            [{ 'size': ['small', false, 'large', 'huge'] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'indent': '-1'}, { 'indent': '+1' }],
            [{ 'align': [] }],
            ['blockquote', 'code-block'],
            ['link', 'image'],
            ['clean']
          ],
          handlers: {
            image: () => {
              setShowImageDialog(true);
            }
          }
        },
        clipboard: {
          // Don't clean paste - preserve Google Docs formatting
          matchVisual: false
        }
      }
    });

    // Set initial content
    if (content) {
      quill.clipboard.dangerouslyPasteHTML(content);
    }

    // Handle text changes
    quill.on('text-change', () => {
      onChange(quill.root.innerHTML);
    });

    quillRef.current = quill;

    return () => {
      quillRef.current = null;
    };
  }, [mounted]);

  // Update content when prop changes (but don't trigger if user is editing)
  useEffect(() => {
    if (quillRef.current && content !== quillRef.current.root.innerHTML) {
      const quill = quillRef.current;
      const selection = quill.getSelection();
      quill.clipboard.dangerouslyPasteHTML(content);
      if (selection) {
        quill.setSelection(selection);
      }
    }
  }, [content]);

  const handleImageInsert = (data: { url: string; alt: string; caption?: string }) => {
    if (!quillRef.current) return;

    const quill = quillRef.current;
    const range = quill.getSelection(true);

    if (data.caption) {
      // Insert as figure with caption
      const figureHtml = `<figure class="my-6"><img src="${data.url}" alt="${data.alt}" class="rounded-lg shadow-lg max-w-full h-auto" /><figcaption class="text-center text-gray-600 text-sm mt-2 italic">${data.caption}</figcaption></figure>`;
      quill.clipboard.dangerouslyPasteHTML(range.index, figureHtml);
    } else {
      // Insert as simple image
      quill.insertEmbed(range.index, 'image', data.url);
    }

    quill.setSelection(range.index + 1, 0);
  };

  if (!mounted) {
    return <div className="animate-pulse bg-gray-100 dark:bg-gray-800 rounded-lg h-96" />;
  }

  return (
    <>
      <div className="quill-wrapper border-2 border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden bg-white dark:bg-gray-900 shadow-lg">
        <div ref={editorRef} />
      </div>

      <ImageDialog
        isOpen={showImageDialog}
        onClose={() => setShowImageDialog(false)}
        onInsert={handleImageInsert}
        onUpload={onImageUpload}
      />

      <style jsx global>{`
        .quill-wrapper .ql-container {
          min-height: 500px;
          font-size: 16px;
        }

        .quill-wrapper .ql-editor {
          min-height: 500px;
          padding: 2rem;
        }

        .quill-wrapper .ql-toolbar {
          border: none !important;
          border-bottom: 2px solid #e5e7eb !important;
          background: linear-gradient(to right, #f9fafb, #ffffff);
          padding: 1rem;
        }

        .dark .quill-wrapper .ql-toolbar {
          background: linear-gradient(to right, #1f2937, #111827);
          border-bottom-color: #374151 !important;
        }

        .quill-wrapper .ql-toolbar button {
          margin: 0 2px;
        }

        .quill-wrapper .ql-toolbar button:hover {
          background: #eff6ff;
          border-radius: 0.5rem;
        }

        .dark .quill-wrapper .ql-toolbar button:hover {
          background: #1e3a8a;
        }

        .quill-wrapper .ql-toolbar button.ql-active {
          background: #3b82f6 !important;
          color: white !important;
          border-radius: 0.5rem;
        }

        .quill-wrapper .ql-editor img {
          border-radius: 1rem;
          box-shadow: 0 10px 25px -5px rgb(0 0 0 / 0.1);
          margin: 1.5rem 0;
        }

        .dark .quill-wrapper .ql-editor {
          background: #111827;
          color: #f3f4f6;
        }

        .dark .quill-wrapper .ql-editor.ql-blank::before {
          color: #6b7280;
        }

        .dark .quill-wrapper .ql-stroke {
          stroke: #9ca3af !important;
        }

        .dark .quill-wrapper .ql-fill {
          fill: #9ca3af !important;
        }

        .dark .quill-wrapper .ql-picker-label {
          color: #9ca3af !important;
        }
      `}</style>
    </>
  );
};

export default QuillEditor;
