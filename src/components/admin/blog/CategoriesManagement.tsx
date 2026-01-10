// components/admin/blog/CategoriesManagement.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus, Edit, Trash2, Search, ArrowLeft, Folder, FolderOpen,
  Save, X, ChevronRight, ChevronDown, Palette
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
  useCategories
} from '@/hooks/useCompleteBlogApi';

import type { Category } from '@/lib/api/completeBlogApi';

// Color options for categories
const COLOR_OPTIONS = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
  '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
];

interface CategoryFormData {
  name: string;
  slug: string;
  description: string;
  color: string;
  parentId?: number;
}

const CategoryForm: React.FC<{
  category?: Category;
  categories: Category[];
  onSave: (data: CategoryFormData) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
}> = ({ category, categories, onSave, onCancel, loading }) => {
  const [formData, setFormData] = useState<CategoryFormData>({
    name: category?.name || '',
    slug: category?.slug || '',
    description: category?.description || '',
    color: category?.color || COLOR_OPTIONS[0],
    parentId: category?.parentId || undefined
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateField = (field: keyof CategoryFormData, value: string | number | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    // Auto-generate slug from name
    if (field === 'name' && !category) {
      const slug = (value as string)
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
      newErrors.name = 'Category name is required';
    }

    if (!formData.slug.trim()) {
      newErrors.slug = 'Slug is required';
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug = 'Slug can only contain lowercase letters, numbers, and hyphens';
    }

    // Check for circular parent reference
    if (formData.parentId && category) {
      const isCircular = (parentId: number, currentId: number): boolean => {
        if (parentId === currentId) return true;
        const parent = categories.find(c => c.id === parentId);
        return parent?.parentId ? isCircular(parent.parentId, currentId) : false;
      };
      
      if (isCircular(formData.parentId, category.id)) {
        newErrors.parentId = 'Cannot set this category as parent (circular reference)';
      }
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

  // Filter out current category and its children from parent options
  const availableParents = categories.filter(cat => {
    if (!category) return true; // For new categories, all are available
    if (cat.id === category.id) return false; // Can't be parent of itself
    
    // Check if cat is a child of current category
    const isChild = (checkCat: Category): boolean => {
      if (checkCat.parentId === category.id) return true;
      const parent = categories.find(c => c.id === checkCat.parentId);
      return parent ? isChild(parent) : false;
    };
    
    return !isChild(cat);
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Category Name"
        value={formData.name}
        onChange={(e) => updateField('name', e.target.value)}
        placeholder="Enter category name..."
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
        placeholder="Optional description for the category..."
        rows={3}
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Parent Category
        </label>
        <select
          value={formData.parentId || ''}
          onChange={(e) => updateField('parentId', e.target.value ? parseInt(e.target.value) : undefined)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-[#1A403D]/20 focus:border-transparent"
        >
          <option value="">No parent (top level)</option>
          {availableParents.map(cat => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        {errors.parentId && (
          <p className="text-sm text-red-600 mt-1">{errors.parentId}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  ? 'border-gray-900' 
                  : 'border-gray-300'
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
          onClick={() => {}} // Provide a no-op or appropriate handler, since form submission is handled by <form onSubmit>
        >
          <Save className="h-4 w-4 mr-2" />
          {category ? 'Update' : 'Create'} Category
        </ActionButton>
      </div>
    </form>
  );
};

const CategoryTreeNode: React.FC<{
  category: Category;
  level: number;
  expandedCategories: Set<number>;
  onToggleExpand: (id: number) => void;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}> = ({ category, level, expandedCategories, onToggleExpand, onEdit, onDelete }) => {
  const hasChildren = category.children && category.children.length > 0;
  const isExpanded = expandedCategories.has(category.id);

  return (
    <div className="w-full">
      <div 
        className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg group"
        style={{ marginLeft: `${level * 24}px` }}
      >
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          {hasChildren ? (
            <button
              onClick={() => onToggleExpand(category.id)}
              className="p-1 hover:bg-gray-200 rounded"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-gray-500" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-500" />
              )}
            </button>
          ) : (
            <div className="w-6 h-6 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-gray-300" />
            </div>
          )}
          
          <div
            className="w-4 h-4 rounded-full flex-shrink-0"
            style={{ backgroundColor: category.color }}
          />
          
          <div className="min-w-0 flex-1">
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-medium text-gray-900 truncate">
                {category.name}
              </h3>
              {hasChildren && (
                <span className="text-xs text-gray-500">
                  ({category.children?.length})
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500">
              /{category.slug}
            </p>
            {category.description && (
              <p className="text-xs text-gray-600 mt-1 line-clamp-1">
                {category.description}
              </p>
            )}
            {category._count && (
              <p className="text-xs text-gray-500 mt-1">
                {category._count.blogs} blog{category._count.blogs !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <ActionButton
            size="sm"
            variant="secondary"
            onClick={() => onEdit(category)}
          >
            <Edit className="h-4 w-4" />
          </ActionButton>
          
          <ActionButton
            size="sm"
            variant="secondary"
            onClick={() => onDelete(category)}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </ActionButton>
        </div>
      </div>

      {hasChildren && isExpanded && (
        <div>
          {category.children?.map((child) => (
            <CategoryTreeNode
              key={child.id}
              category={child}
              level={level + 1}
              expandedCategories={expandedCategories}
              onToggleExpand={onToggleExpand}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default function CategoriesManagement() {
  const router = useRouter();
  const { addToast } = useToast();

  // Hooks
  const {
    categories,
    categoryHierarchy,
    loading,
    error,
    loadCategories,
    loadCategoryHierarchy,
    createCategory,
    updateCategory,
    deleteCategory,
    clearError
  } = useCategories();

  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());
  const [viewMode, setViewMode] = useState<'tree' | 'list'>('tree');

  // Effects
  useEffect(() => {
    loadCategories();
    loadCategoryHierarchy();
  }, []);

  // Handlers
  const handleCreateCategory = () => {
    setEditingCategory(null);
    setShowForm(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setShowForm(true);
  };

  const handleDeleteCategory = async (category: Category) => {
    const hasChildren = category.children && category.children.length > 0;
    const hasBlogCount = category._count && category._count.blogs > 0;
    
    let confirmMessage = `Are you sure you want to delete the category "${category.name}"?`;
    
    if (hasChildren) {
      confirmMessage += ` This will also delete ${category.children?.length} subcategories.`;
    }
    
    if (hasBlogCount) {
      confirmMessage += ` This category is used by ${category._count?.blogs} blog(s).`;
    }
    
    confirmMessage += ' This action cannot be undone.';

    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      await deleteCategory(category.id);
      addToast({
        type: 'success',
        title: 'Success',
        message: 'Category deleted successfully'
      });
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Error',
        message: error.message || 'Failed to delete category'
      });
    }
  };

  const handleSaveCategory = async (formData: CategoryFormData) => {
    setFormLoading(true);
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, formData);
        addToast({
          type: 'success',
          title: 'Success',
          message: 'Category updated successfully'
        });
      } else {
        await createCategory(formData);
        addToast({
          type: 'success',
          title: 'Success',
          message: 'Category created successfully'
        });
      }
      setShowForm(false);
      setEditingCategory(null);
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Error',
        message: error.message || `Failed to ${editingCategory ? 'update' : 'create'} category`
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingCategory(null);
  };

  const handleToggleExpand = (categoryId: number) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const expandAll = () => {
    const allIds = new Set<number>();
    const collectIds = (cats: Category[]) => {
      cats.forEach(cat => {
        allIds.add(cat.id);
        if (cat.children) {
          collectIds(cat.children);
        }
      });
    };
    collectIds(categoryHierarchy);
    setExpandedCategories(allIds);
  };

  const collapseAll = () => {
    setExpandedCategories(new Set());
  };

  // Filter categories based on search
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <ActionButton
                variant="secondary"
                onClick={() => router.push('/admin/blog')}
              >
                <ArrowLeft className="h-4 w-4" />
              </ActionButton>
              
              <div className="p-2 bg-green-100 rounded-lg">
                <Folder className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Categories Management
                </h1>
                <p className="text-sm text-gray-500">
                  Organize your blog content with hierarchical categories
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <ActionButton
                variant="primary"
                onClick={handleCreateCategory}
              >
                <Plus className="h-4 w-4 mr-2" />
                New Category
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
            title="Error loading categories"
            message={error}
            className="mb-6"
            onClose={clearError}
          />
        )}

        {/* Create/Edit Form */}
        {showForm && (
          <Card className="mb-6">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {editingCategory ? 'Edit Category' : 'Create New Category'}
              </h2>
              
              <CategoryForm
                category={editingCategory || undefined}
                categories={categories}
                onSave={handleSaveCategory}
                onCancel={handleCancelForm}
                loading={formLoading}
              />
            </div>
          </Card>
        )}

        {/* Search and View Controls */}
        <Card className="mb-6">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex-1 max-w-md">
                <SearchInput
                  value={searchTerm}
                  onChange={setSearchTerm}
                  placeholder="Search categories..."
                />
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setViewMode('tree')}
                    className={`px-3 py-1 rounded text-sm ${
                      viewMode === 'tree'
                        ? 'bg-blue-100 text-blue-800'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    Tree View
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-3 py-1 rounded text-sm ${
                      viewMode === 'list'
                        ? 'bg-blue-100 text-blue-800'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    List View
                  </button>
                </div>
                
                {viewMode === 'tree' && !searchTerm && (
                  <div className="flex items-center space-x-2">
                    <ActionButton
                      size="sm"
                      variant="secondary"
                      onClick={expandAll}
                    >
                      Expand All
                    </ActionButton>
                    <ActionButton
                      size="sm"
                      variant="secondary"
                      onClick={collapseAll}
                    >
                      Collapse All
                    </ActionButton>
                  </div>
                )}
                
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
          </div>
        </Card>

        {/* Categories Display */}
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                {searchTerm ? `Search Results (${filteredCategories.length})` : 'All Categories'}
              </h2>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="lg" text="Loading categories..." />
              </div>
            ) : searchTerm ? (
              // Search results (flat list)
              filteredCategories.length === 0 ? (
                <EmptyState
                  title="No categories found"
                  description="Try adjusting your search terms"
                />
              ) : (
                <div className="space-y-2">
                  {filteredCategories.map((category) => (
                    <div key={category.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg group">
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">
                            {category.name}
                          </h3>
                          <p className="text-xs text-gray-500">
                            /{category.slug}
                            {category.parent && ` (under ${category.parent.name})`}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ActionButton
                          size="sm"
                          variant="secondary"
                          onClick={() => handleEditCategory(category)}
                        >
                          <Edit className="h-4 w-4" />
                        </ActionButton>
                        <ActionButton
                          size="sm"
                          variant="secondary"
                          onClick={() => handleDeleteCategory(category)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </ActionButton>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : viewMode === 'tree' ? (
              // Tree view
              categoryHierarchy.length === 0 ? (
                <EmptyState
                  title="No categories yet"
                  description="Create your first category to organize your blog content"
                  action={{
                    label: "Create Category",
                    onClick: handleCreateCategory
                  }}
                />
              ) : (
                <div className="space-y-1">
                  {categoryHierarchy.map((category) => (
                    <CategoryTreeNode
                      key={category.id}
                      category={category}
                      level={0}
                      expandedCategories={expandedCategories}
                      onToggleExpand={handleToggleExpand}
                      onEdit={handleEditCategory}
                      onDelete={handleDeleteCategory}
                    />
                  ))}
                </div>
              )
            ) : (
              // List view
              categories.length === 0 ? (
                <EmptyState
                  title="No categories yet"
                  description="Create your first category to organize your blog content"
                  action={{
                    label: "Create Category",
                    onClick: handleCreateCategory
                  }}
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categories.map((category) => (
                    <Card key={category.id} className="hover:shadow-lg transition-all duration-200">
                      <div className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3 flex-1 min-w-0">
                            <div
                              className="w-4 h-4 rounded-full flex-shrink-0"
                              style={{ backgroundColor: category.color }}
                            />
                            <div className="min-w-0 flex-1">
                              <h3 className="text-lg font-semibold text-gray-900 truncate">
                                {category.name}
                              </h3>
                              <p className="text-sm text-gray-500">
                                /{category.slug}
                              </p>
                              {category.parent && (
                                <p className="text-xs text-gray-500">
                                  Under: {category.parent.name}
                                </p>
                              )}
                              {category.description && (
                                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                  {category.description}
                                </p>
                              )}
                              {category._count && (
                                <p className="text-xs text-gray-500 mt-1">
                                  {category._count.blogs} blog{category._count.blogs !== 1 ? 's' : ''}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 ml-4">
                            <ActionButton
                              size="sm"
                              variant="secondary"
                              onClick={() => handleEditCategory(category)}
                            >
                              <Edit className="h-4 w-4" />
                            </ActionButton>
                            
                            <ActionButton
                              size="sm"
                              variant="secondary"
                              onClick={() => handleDeleteCategory(category)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </ActionButton>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}