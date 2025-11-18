"use client";

import React, { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough, Code,
  Heading1, Heading2, Heading3, List, ListOrdered, Quote,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Link2, Unlink, Image as ImageIcon, Undo, Redo,
  Palette, Highlighter, X, Upload, Loader2, CheckCircle, AlertCircle
} from 'lucide-react';
import { optimizeImage } from '@/lib/utils/imageOptimization';

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

      // Auto-generate alt text from filename
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
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold">Add Image</h3>
            <p className="text-sm text-blue-100 mt-1">Upload or paste an image with alt text</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Upload */}
          {onUpload && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Upload Image
              </label>
              <label className="block cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={uploading || optimizing}
                  className="hidden"
                />
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
                        <p className="text-base font-semibold text-gray-900 dark:text-white">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          PNG, JPG, WebP (auto-optimized)
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </label>
            </div>
          )}

          {/* URL */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Image URL
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          {/* Alt Text */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Alt Text <span className="text-red-500">*</span>
              {alt && (
                <span className="ml-2 text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full">
                  <CheckCircle className="h-3 w-3 inline mr-1" />
                  Valid
                </span>
              )}
            </label>
            <input
              type="text"
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              placeholder="Describe the image (e.g., 'Mountain view from Pokhara homestay')"
              required
            />
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Required for SEO and accessibility
            </p>
          </div>

          {/* Caption */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Caption <span className="text-xs text-gray-500">(Optional)</span>
            </label>
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              placeholder="Optional caption to display below the image"
            />
          </div>

          {/* Preview */}
          {url && (
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Preview
                </span>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-900">
                <img
                  src={url}
                  alt={alt || 'Preview'}
                  className="max-w-full h-auto rounded-lg shadow-lg mx-auto"
                  style={{ maxHeight: '300px' }}
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
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleInsert}
            disabled={!url || !alt}
            className="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center gap-2"
          >
            <CheckCircle className="h-4 w-4" />
            Insert Image
          </button>
        </div>
      </div>
    </div>
  );
};

interface TipTapEditorProps {
  content: string;
  onChange: (content: string) => void;
  onImageUpload?: (file: File) => Promise<string>;
  placeholder?: string;
}

export const TipTapEditor: React.FC<TipTapEditorProps> = ({
  content,
  onChange,
  onImageUpload,
  placeholder = 'Start writing your amazing content here...'
}) => {
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [pendingImageUrl, setPendingImageUrl] = useState<string | undefined>();
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline hover:text-blue-700',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-lg shadow-lg max-w-full h-auto my-4',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-lg dark:prose-invert max-w-none focus:outline-none min-h-[500px] px-8 py-6',
      },
      handlePaste: (view, event) => {
        // Handle pasted images
        const items = event.clipboardData?.items;
        if (items) {
          for (const item of Array.from(items)) {
            if (item.type.startsWith('image/')) {
              event.preventDefault();
              const file = item.getAsFile();
              if (file) {
                handlePastedImage(file);
              }
              return true;
            }
          }
        }
        return false;
      },
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  const handlePastedImage = async (file: File) => {
    if (!onImageUpload) return;

    try {
      const optimized = await optimizeImage(file, {
        maxWidth: 1920,
        maxHeight: 1080,
        quality: 0.85,
        format: 'jpeg',
      });

      const url = await onImageUpload(optimized.file);
      setPendingImageUrl(url);
      setShowImageDialog(true);
    } catch (error) {
      console.error('Failed to upload pasted image:', error);
      alert('Failed to upload image. Please try again.');
    }
  };

  const handleImageInsert = (data: { url: string; alt: string; caption?: string }) => {
    if (!editor) return;

    if (data.caption) {
      editor
        .chain()
        .focus()
        .insertContent(`<figure><img src="${data.url}" alt="${data.alt}" /><figcaption>${data.caption}</figcaption></figure>`)
        .run();
    } else {
      editor.chain().focus().setImage({ src: data.url, alt: data.alt }).run();
    }

    setPendingImageUrl(undefined);
  };

  if (!editor) {
    return <div className="animate-pulse bg-gray-100 dark:bg-gray-800 rounded-lg h-96" />;
  }

  const MenuButton: React.FC<{
    onClick: () => void;
    isActive?: boolean;
    disabled?: boolean;
    children: React.ReactNode;
    title: string;
  }> = ({ onClick, isActive, disabled, children, title }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-2 rounded-lg transition-all ${
        isActive
          ? 'bg-blue-600 text-white shadow-md'
          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
      } disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {children}
    </button>
  );

  const colors = [
    { name: 'Default', value: null },
    { name: 'Red', value: '#ef4444' },
    { name: 'Orange', value: '#f97316' },
    { name: 'Yellow', value: '#eab308' },
    { name: 'Green', value: '#22c55e' },
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Purple', value: '#a855f7' },
    { name: 'Pink', value: '#ec4899' },
  ];

  const highlights = [
    { name: 'None', value: null },
    { name: 'Yellow', value: '#fef08a' },
    { name: 'Green', value: '#bbf7d0' },
    { name: 'Blue', value: '#bfdbfe' },
    { name: 'Pink', value: '#fbcfe8' },
    { name: 'Orange', value: '#fed7aa' },
  ];

  return (
    <div className="border-2 border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden bg-white dark:bg-gray-900 shadow-lg">
      {/* Toolbar */}
      <div className="border-b-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-4">
        <div className="flex flex-wrap items-center gap-2">
          {/* History */}
          <div className="flex items-center gap-1 border-r border-gray-300 dark:border-gray-600 pr-2">
            <MenuButton
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
              title="Undo"
            >
              <Undo className="h-4 w-4" />
            </MenuButton>
            <MenuButton
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
              title="Redo"
            >
              <Redo className="h-4 w-4" />
            </MenuButton>
          </div>

          {/* Text Formatting */}
          <div className="flex items-center gap-1 border-r border-gray-300 dark:border-gray-600 pr-2">
            <MenuButton
              onClick={() => editor.chain().focus().toggleBold().run()}
              isActive={editor.isActive('bold')}
              title="Bold (Ctrl+B)"
            >
              <Bold className="h-4 w-4" />
            </MenuButton>
            <MenuButton
              onClick={() => editor.chain().focus().toggleItalic().run()}
              isActive={editor.isActive('italic')}
              title="Italic (Ctrl+I)"
            >
              <Italic className="h-4 w-4" />
            </MenuButton>
            <MenuButton
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              isActive={editor.isActive('underline')}
              title="Underline (Ctrl+U)"
            >
              <UnderlineIcon className="h-4 w-4" />
            </MenuButton>
            <MenuButton
              onClick={() => editor.chain().focus().toggleStrike().run()}
              isActive={editor.isActive('strike')}
              title="Strikethrough"
            >
              <Strikethrough className="h-4 w-4" />
            </MenuButton>
            <MenuButton
              onClick={() => editor.chain().focus().toggleCode().run()}
              isActive={editor.isActive('code')}
              title="Code"
            >
              <Code className="h-4 w-4" />
            </MenuButton>
          </div>

          {/* Headings */}
          <div className="flex items-center gap-1 border-r border-gray-300 dark:border-gray-600 pr-2">
            <MenuButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              isActive={editor.isActive('heading', { level: 1 })}
              title="Heading 1"
            >
              <Heading1 className="h-4 w-4" />
            </MenuButton>
            <MenuButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              isActive={editor.isActive('heading', { level: 2 })}
              title="Heading 2"
            >
              <Heading2 className="h-4 w-4" />
            </MenuButton>
            <MenuButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              isActive={editor.isActive('heading', { level: 3 })}
              title="Heading 3"
            >
              <Heading3 className="h-4 w-4" />
            </MenuButton>
          </div>

          {/* Lists */}
          <div className="flex items-center gap-1 border-r border-gray-300 dark:border-gray-600 pr-2">
            <MenuButton
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              isActive={editor.isActive('bulletList')}
              title="Bullet List"
            >
              <List className="h-4 w-4" />
            </MenuButton>
            <MenuButton
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              isActive={editor.isActive('orderedList')}
              title="Numbered List"
            >
              <ListOrdered className="h-4 w-4" />
            </MenuButton>
            <MenuButton
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              isActive={editor.isActive('blockquote')}
              title="Quote"
            >
              <Quote className="h-4 w-4" />
            </MenuButton>
          </div>

          {/* Alignment */}
          <div className="flex items-center gap-1 border-r border-gray-300 dark:border-gray-600 pr-2">
            <MenuButton
              onClick={() => editor.chain().focus().setTextAlign('left').run()}
              isActive={editor.isActive({ textAlign: 'left' })}
              title="Align Left"
            >
              <AlignLeft className="h-4 w-4" />
            </MenuButton>
            <MenuButton
              onClick={() => editor.chain().focus().setTextAlign('center').run()}
              isActive={editor.isActive({ textAlign: 'center' })}
              title="Align Center"
            >
              <AlignCenter className="h-4 w-4" />
            </MenuButton>
            <MenuButton
              onClick={() => editor.chain().focus().setTextAlign('right').run()}
              isActive={editor.isActive({ textAlign: 'right' })}
              title="Align Right"
            >
              <AlignRight className="h-4 w-4" />
            </MenuButton>
            <MenuButton
              onClick={() => editor.chain().focus().setTextAlign('justify').run()}
              isActive={editor.isActive({ textAlign: 'justify' })}
              title="Justify"
            >
              <AlignJustify className="h-4 w-4" />
            </MenuButton>
          </div>

          {/* Colors */}
          <div className="flex items-center gap-1 border-r border-gray-300 dark:border-gray-600 pr-2 relative">
            <div className="relative">
              <MenuButton
                onClick={() => setShowColorPicker(!showColorPicker)}
                title="Text Color"
              >
                <Palette className="h-4 w-4" />
              </MenuButton>
              {showColorPicker && (
                <div className="absolute top-full left-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl p-2 z-10 grid grid-cols-4 gap-2">
                  {colors.map((color) => (
                    <button
                      key={color.name}
                      type="button"
                      onClick={() => {
                        if (color.value) {
                          editor.chain().focus().setColor(color.value).run();
                        } else {
                          editor.chain().focus().unsetColor().run();
                        }
                        setShowColorPicker(false);
                      }}
                      className="w-8 h-8 rounded border-2 border-gray-300 dark:border-gray-600 hover:scale-110 transition-transform"
                      style={{ backgroundColor: color.value || '#000' }}
                      title={color.name}
                    />
                  ))}
                </div>
              )}
            </div>
            <div className="relative">
              <MenuButton
                onClick={() => setShowHighlightPicker(!showHighlightPicker)}
                title="Highlight"
              >
                <Highlighter className="h-4 w-4" />
              </MenuButton>
              {showHighlightPicker && (
                <div className="absolute top-full left-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl p-2 z-10 grid grid-cols-3 gap-2">
                  {highlights.map((highlight) => (
                    <button
                      key={highlight.name}
                      type="button"
                      onClick={() => {
                        if (highlight.value) {
                          editor.chain().focus().toggleHighlight({ color: highlight.value }).run();
                        } else {
                          editor.chain().focus().unsetHighlight().run();
                        }
                        setShowHighlightPicker(false);
                      }}
                      className="w-8 h-8 rounded border-2 border-gray-300 dark:border-gray-600 hover:scale-110 transition-transform"
                      style={{ backgroundColor: highlight.value || 'transparent' }}
                      title={highlight.name}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Link & Image */}
          <div className="flex items-center gap-1">
            <MenuButton
              onClick={() => {
                const url = window.prompt('Enter URL');
                if (url) {
                  editor.chain().focus().setLink({ href: url }).run();
                }
              }}
              isActive={editor.isActive('link')}
              title="Add Link"
            >
              <Link2 className="h-4 w-4" />
            </MenuButton>
            {editor.isActive('link') && (
              <MenuButton
                onClick={() => editor.chain().focus().unsetLink().run()}
                title="Remove Link"
              >
                <Unlink className="h-4 w-4" />
              </MenuButton>
            )}
            <MenuButton
              onClick={() => setShowImageDialog(true)}
              title="Insert Image (or paste from clipboard)"
            >
              <ImageIcon className="h-4 w-4" />
            </MenuButton>
          </div>
        </div>
      </div>

      {/* Editor Content */}
      <div className="bg-white dark:bg-gray-900">
        <EditorContent editor={editor} />
      </div>

      {/* Image Dialog */}
      <ImageDialog
        isOpen={showImageDialog}
        onClose={() => {
          setShowImageDialog(false);
          setPendingImageUrl(undefined);
        }}
        onInsert={handleImageInsert}
        imageUrl={pendingImageUrl}
        onUpload={onImageUpload}
      />
    </div>
  );
};

export default TipTapEditor;
