"use client";

import React, { useState, useRef, useEffect } from 'react';
import {
 Bold, Italic, List, Hash, Quote, Type, AlignLeft, AlignCenter, AlignRight,
 Image as ImageIcon, Link2, Maximize2, Minimize2, X, Upload, Loader2,
 AlertCircle, CheckCircle, Underline as UnderlineIcon, Code
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
 <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl flex items-center justify-between">
 <div>
 <h3 className="text-2xl font-bold">Add Image</h3>
 <p className="text-sm text-blue-100 mt-1">Upload image with alt text</p>
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
 <input type="file" accept="image/*" onChange={handleFileUpload} disabled={uploading || optimizing} className="hidden" />
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
 className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A403D]"
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
 className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A403D]"
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
 className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A403D]"
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
 className="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg disabled:opacity-50 shadow-lg flex items-center gap-2"
 >
 <CheckCircle className="h-4 w-4" />Insert
 </button>
 </div>
 </div>
 </div>
 );
};

interface SimpleRichTextEditorProps {
 content: string;
 onChange: (content: string) => void;
 onImageUpload?: (file: File) => Promise<string>;
 placeholder?: string;
}

export const SimpleRichTextEditor: React.FC<SimpleRichTextEditorProps> = ({
 content,
 onChange,
 onImageUpload,
 placeholder = 'Start writing... Paste from Google Docs works perfectly!'
}) => {
 const editorRef = useRef<HTMLDivElement>(null);
 const [showImageDialog, setShowImageDialog] = useState(false);
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

 return (
 <>
 <div className={`border-2 border-gray-200 rounded-2xl overflow-hidden bg-white shadow-lg ${isFullscreen ? 'fixed inset-4 z-50' : ''}`}>
 {/* Toolbar */}
 <div className="bg-gray-50 border-b-2 border-gray-200 p-4">
 <div className="flex items-center justify-between flex-wrap gap-3">
 <div className="flex items-center gap-2 flex-wrap">
 {/* Text Formatting */}
 <div className="flex items-center gap-1 bg-white rounded-lg p-1.5 shadow-sm border">
 <button onClick={() => execCommand('bold')} className="p-2 hover:bg-blue-50 rounded transition" title="Bold"><Bold className="h-4 w-4" /></button>
 <button onClick={() => execCommand('italic')} className="p-2 hover:bg-blue-50 rounded transition" title="Italic"><Italic className="h-4 w-4" /></button>
 <button onClick={() => execCommand('underline')} className="p-2 hover:bg-blue-50 rounded transition" title="Underline"><UnderlineIcon className="h-4 w-4" /></button>
 <button onClick={() => execCommand('strikethrough')} className="p-2 hover:bg-blue-50 rounded transition" title="Strike">
 <Type className="h-4 w-4" style={{ textDecoration: 'line-through' }} />
 </button>
 </div>

 {/* Headings */}
 <div className="flex items-center gap-1 bg-white rounded-lg p-1.5 shadow-sm border">
 <button onClick={() => execCommand('formatBlock', 'h1')} className="px-3 py-2 hover:bg-purple-50 rounded font-bold text-2xl transition">H1</button>
 <button onClick={() => execCommand('formatBlock', 'h2')} className="px-3 py-2 hover:bg-purple-50 rounded font-bold text-xl transition">H2</button>
 <button onClick={() => execCommand('formatBlock', 'h3')} className="px-3 py-2 hover:bg-purple-50 rounded font-bold text-lg transition">H3</button>
 <button onClick={() => execCommand('formatBlock', 'p')} className="px-3 py-2 hover:bg-purple-50 rounded font-bold transition">P</button>
 </div>

 {/* Lists */}
 <div className="flex items-center gap-1 bg-white rounded-lg p-1.5 shadow-sm border">
 <button onClick={() => execCommand('insertUnorderedList')} className="p-2 hover:bg-green-50 rounded transition" title="Bullet List"><List className="h-4 w-4" /></button>
 <button onClick={() => execCommand('insertOrderedList')} className="p-2 hover:bg-green-50 rounded transition" title="Numbered List"><Hash className="h-4 w-4" /></button>
 <button onClick={() => execCommand('formatBlock', 'blockquote')} className="p-2 hover:bg-green-50 rounded transition" title="Quote"><Quote className="h-4 w-4" /></button>
 </div>

 {/* Alignment */}
 <div className="flex items-center gap-1 bg-white rounded-lg p-1.5 shadow-sm border">
 <button onClick={() => execCommand('justifyLeft')} className="p-2 hover:bg-orange-50 rounded transition" title="Align Left"><AlignLeft className="h-4 w-4" /></button>
 <button onClick={() => execCommand('justifyCenter')} className="p-2 hover:bg-orange-50 rounded transition" title="Center"><AlignCenter className="h-4 w-4" /></button>
 <button onClick={() => execCommand('justifyRight')} className="p-2 hover:bg-orange-50 rounded transition" title="Align Right"><AlignRight className="h-4 w-4" /></button>
 </div>

 {/* Media */}
 <div className="flex items-center gap-1 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-1.5 shadow-sm border-2 border-blue-200">
 <button
 onClick={() => setShowImageDialog(true)}
 className="px-3 py-2 bg-white hover:bg-green-50 rounded transition flex items-center gap-2"
 title="Insert Image"
 >
 <ImageIcon className="h-4 w-4 text-green-600" />
 <span className="text-xs font-semibold text-green-700">Image</span>
 </button>
 <button onClick={() => setShowLinkDialog(true)} className="p-2 bg-white hover:bg-blue-50 rounded transition" title="Link"><Link2 className="h-4 w-4 text-[#1A403D]" /></button>
 </div>
 </div>

 <div className="flex items-center gap-3">
 <div className="px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
 <div className="text-xs font-bold text-[#1A403D]">{wordCount} words</div>
 </div>
 <button
 onClick={() => setIsFullscreen(!isFullscreen)}
 className="p-2.5 bg-white hover:bg-gray-100 rounded-xl shadow border"
 title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
 >
 {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
 </button>
 </div>
 </div>
 </div>

 {/* Editor */}
 <div
 ref={editorRef}
 contentEditable
 onInput={handleContentChange}
 className="p-8 focus:outline-none prose prose-lg max-w-none"
 style={{
 minHeight: isFullscreen ? 'calc(100vh - 200px)' : '500px',
 lineHeight: 1.8,
 fontSize: '16px'
 }}
 data-placeholder={placeholder}
 />
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
 className="w-full px-4 py-3 border-2 rounded-xl mb-4"
 placeholder="https://example.com"
 onKeyPress={(e) => e.key === 'Enter' && insertLink()}
 />
 <div className="flex gap-3 justify-end">
 <button onClick={() => setShowLinkDialog(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl">Cancel</button>
 <button onClick={insertLink} className="px-4 py-2 bg-[#1A403D] text-white rounded-xl hover:bg-[#1A403D]">Insert</button>
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
 </>
 );
};

export default SimpleRichTextEditor;
