// components/admin/blog/TagsManagement.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus, Edit, Trash2, Search, Filter, ArrowLeft, Tag as TagIcon,
  Save, X, Hash, Palette, FileText
} from 'lucide-react';

import {
  Input,
  TextArea,
  ActionButton,
  Card,
  Alert,
  LoadingSpinner,
  SearchInput,
  useToast,
  EmptyState
} from '@/components/admin/AdminComponents';

import {
  useTags
} from '@/hooks/useCompleteBlogApi';

import type { Tag } from '@/lib/api/completeBlogApi';

// Color options for tags
const COLOR_OPTIONS = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
  '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
];

interface TagFormData {
  name: string;
  slug: string;
  description: string;
  color: string;
}

const TagForm: React.FC<{
  tag?: Tag;
  onSave: (data: TagFormData) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
}> = ({ tag, onSave, onCancel, loading }) => {
  const [formData, setFormData] = useState<TagFormData>({
    name: tag?.name || '',
    slug: tag?.slug || '',
    description: tag?.description || '',
    color: tag?.color || COLOR_OPTIONS[0]
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateField = (field: keyof TagFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    // Auto-generate slug from name
    if (field === 'name' && !tag) {
      const slug = value
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .trim();
      setFormData(prev => ({ ...prev, slug }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Tag name is required';
    }

    if (!formData.slug.trim()) {
      newErrors.slug = 'Slug is required';
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug = 'Slug can only contain lowercase letters, numbers, and hyphens';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      await onSave(formData);
    } catch (error) {
      // Error handling is done in parent component
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Tag Name"
        value={formData.name}
        onChange={(e) => updateField('name', e.target.value)}
        placeholder="Enter tag name..."
        error={errors.name}
        required
      />

      <Input
        label="Slug"
        value={formData.slug}
        onChange={(e) => updateField('slug', e.target.value)}
        placeholder="url-friendly-slug"
        error={errors.slug}
        required
      />

      <TextArea
        label="Description"
        value={formData.description}
        onChange={(e) => updateField('description', e.target.value)}
        placeholder="Optional description for the tag..."
        rows={3}
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Color
        </label>
        <div className="flex flex-wrap gap-2">
          {COLOR_OPTIONS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => updateField('color', color)}
              className={`w-8 h-8 rounded-full border-2 ${
                formData.color === color 
                  ? 'border-gray-900 dark:border-white' 
                  : 'border-gray-300 dark:border-gray-600'
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
        <Input
          value={formData.color}
          onChange={(e) => updateField('color', e.target.value)}
          placeholder="#3B82F6"
          className="mt-2"
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <ActionButton
          variant="secondary"
          onClick={onCancel}
        >
          <X className="h-4 w-4 mr-2" />
          Cancel
        </ActionButton>
        
        <ActionButton
          variant="primary"
          loading={loading}
          onClick={() => handleSubmit(new Event('submit') as unknown as React.FormEvent)}
        >
          <Save className="h-4 w-4 mr-2" />
          {tag ? 'Update' : 'Create'} Tag
        </ActionButton>
      </div>
    </form>
  );
};

const TagCard: React.FC<{
  tag: Tag;
  onEdit: () => void;
  onDelete: () => void;
}> = ({ tag, onEdit, onDelete }) => {
  return (
    <Card className="hover:shadow-lg transition-all duration-200">
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <div
              className="w-4 h-4 rounded-full flex-shrink-0"
              style={{ backgroundColor: tag.color }}
            />
            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                {tag.name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                /{tag.slug}
              </p>
              {tag.description && (
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                  {tag.description}
                </p>
              )}
              {tag._count && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {tag._count.blogs} blog{tag._count.blogs !== 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2 ml-4">
            <ActionButton
              size="sm"
              variant="secondary"
              onClick={onEdit}
            >
              <Edit className="h-4 w-4" />
            </ActionButton>
            
            <ActionButton
              size="sm"
              variant="secondary"
              onClick={onDelete}
              className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
            >
              <Trash2 className="h-4 w-4" />
            </ActionButton>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default function TagsManagement() {
  const router = useRouter();
  const { addToast } = useToast();

  // Hooks
  const {
    tags,
    loading,
    error,
    loadTags,
    createTag,
    updateTag,
    deleteTag,
    clearError
  } = useTags();

  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Effects
  useEffect(() => {
    loadTags();
  }, []);

  // Handlers
  const handleCreateTag = () => {
    setEditingTag(null);
    setShowForm(true);
  };

  const handleEditTag = (tag: Tag) => {
    setEditingTag(tag);
    setShowForm(true);
  };

  const handleDeleteTag = async (tag: Tag) => {
    if (!confirm(`Are you sure you want to delete the tag "${tag.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteTag(tag.id);
      addToast({
        type: 'success',
        title: 'Success',
        message: 'Tag deleted successfully'
      });
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Error',
        message: error.message || 'Failed to delete tag'
      });
    }
  };

  const handleSaveTag = async (formData: TagFormData) => {
    setFormLoading(true);
    try {
      if (editingTag) {
        await updateTag(editingTag.id, formData);
        addToast({
          type: 'success',
          title: 'Success',
          message: 'Tag updated successfully'
        });
      } else {
        await createTag(formData);
        addToast({
          type: 'success',
          title: 'Success',
          message: 'Tag created successfully'
        });
      }
      setShowForm(false);
      setEditingTag(null);
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Error',
        message: error.message || `Failed to ${editingTag ? 'update' : 'create'} tag`
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingTag(null);
  };

  // Filter tags based on search
  const filteredTags = tags.filter(tag =>
    tag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tag.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (tag.description && tag.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <ActionButton
                variant="secondary"
                onClick={() => router.push('/admin/blog')}
              >
                <ArrowLeft className="h-4 w-4" />
              </ActionButton>
              
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <TagIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Tags Management
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Organize your blog content with tags
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <ActionButton
                variant="primary"
                onClick={handleCreateTag}
              >
                <Plus className="h-4 w-4 mr-2" />
                New Tag
              </ActionButton>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Alert */}
        {error && (
          <Alert
            type="error"
            title="Error loading tags"
            message={error}
            className="mb-6"
            onClose={clearError}
          />
        )}

        {/* Create/Edit Form */}
        {showForm && (
          <Card className="mb-6">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {editingTag ? 'Edit Tag' : 'Create New Tag'}
              </h2>
              
              <TagForm
                tag={editingTag || undefined}
                onSave={handleSaveTag}
                onCancel={handleCancelForm}
                loading={formLoading}
              />
            </div>
          </Card>
        )}

        {/* Search and Filters */}
        <Card className="mb-6">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <SearchInput
                  value={searchTerm}
                  onChange={setSearchTerm}
                  placeholder="Search tags..."
                />
              </div>
              
              {searchTerm && (
                <ActionButton
                  variant="secondary"
                  onClick={() => setSearchTerm('')}
                >
                  Clear
                </ActionButton>
              )}
            </div>
          </div>
        </Card>

        {/* Tags Grid */}
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                All Tags ({filteredTags.length})
              </h2>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="lg" text="Loading tags..." />
              </div>
            ) : filteredTags.length === 0 ? (
              <EmptyState
                title={searchTerm ? "No tags found" : "No tags yet"}
                description={
                  searchTerm 
                    ? "Try adjusting your search terms"
                    : "Create your first tag to organize your blog content"
                }
                action={!searchTerm ? {
                  label: "Create Tag",
                  onClick: handleCreateTag
                } : undefined}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTags.map((tag) => (
                  <TagCard
                    key={tag.id}
                    tag={tag}
                    onEdit={() => handleEditTag(tag)}
                    onDelete={() => handleDeleteTag(tag)}
                  />
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}