import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { FaTag, FaArrowLeft } from 'react-icons/fa';
import { Category, CategoryFormData } from '../../types/category';
import { FormField, FormSection, FormActions, SearchableSelect } from '../ui/forms';
const CategoryForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isEditMode = Boolean(id);

  // Parse query parameters
  const queryParams = new URLSearchParams(location.search);
  const type = queryParams.get('type');
  const parentId = queryParams.get('parent');

  const [isLoading, setIsLoading] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    description: '',
    parentId: parentId || null,
    isActive: true
  });

  // Fetch categories for parent selection
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);

        // Import axios for API calls
        const axios = await import('axios');

        // Fetch categories from API
        let categoriesData: any[] = [];
        try {
          const response = await axios.default.get('/api/categories');
          categoriesData = response.data;
          console.log('Categories from API:', categoriesData);
        } catch (error) {
          console.error('Error fetching categories from API:', error);
          categoriesData = [];
        }

        // Transform the data to match our Category type
        const transformedCategories: Category[] = categoriesData.map((cat: any) => ({
          id: cat.id,
          name: cat.name,
          description: cat.description || '',
          parentId: cat.parent_id,
          createdAt: cat.created_at || new Date().toISOString(),
          updatedAt: cat.updated_at || new Date().toISOString(),
          createdBy: cat.created_by || 'System',
          updatedBy: cat.updated_by || 'System',
          isActive: cat.is_active !== false,
          productCount: 0 // Will be populated if needed
        }));

        // If no categories are returned, use fallback data
        if (transformedCategories.length === 0) {
          // Fallback to some basic categories
          const fallbackCategories: Category[] = [
            {
              id: 'cat-1',
              name: 'Electronics',
              description: 'Electronic devices and accessories',
              parentId: null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              createdBy: 'system',
              updatedBy: 'system',
              isActive: true,
              productCount: 0
            },
            {
              id: 'cat-2',
              name: 'Clothing',
              description: 'Apparel and fashion items',
              parentId: null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              createdBy: 'system',
              updatedBy: 'system',
              isActive: true,
              productCount: 0
            },
            {
              id: 'cat-3',
              name: 'Spices',
              description: 'Cooking spices and herbs',
              parentId: null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              createdBy: 'system',
              updatedBy: 'system',
              isActive: true,
              productCount: 0
            }
          ];

          setCategories(fallbackCategories);
        } else {
          setCategories(transformedCategories);
        }

        // If in edit mode, fetch the category data
        if (isEditMode && id) {
          try {
            // Fetch the specific category from API
            const response = await axios.default.get(`/api/categories/${id}`);
            const categoryData = response.data;

            if (categoryData) {
              setFormData({
                name: categoryData.name,
                description: categoryData.description || '',
                parentId: categoryData.parent_id || null,
                isActive: categoryData.is_active !== false
              });
            } else {
              // If category not found, redirect to categories list
              alert('Category not found');
              navigate('/categories');
            }
          } catch (error) {
            console.error('Error fetching category details:', error);
            alert('Failed to load category details. Please try again.');
            navigate('/categories');
          }
        }
      } catch (error) {
        console.error('Error in fetchCategories:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, [id, isEditMode, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Category name is required';
    }

    // Check for circular reference
    if (isEditMode && id && formData.parentId === id) {
      newErrors.parentId = 'A category cannot be its own parent';
    }

    // Check for deep circular reference
    if (isEditMode && id && formData.parentId) {
      let currentParentId = formData.parentId;
      const visitedParents = new Set<string>();

      while (currentParentId) {
        if (visitedParents.has(currentParentId)) {
          newErrors.parentId = 'Circular reference detected in category hierarchy';
          break;
        }

        visitedParents.add(currentParentId);

        if (currentParentId === id) {
          newErrors.parentId = 'Circular reference detected in category hierarchy';
          break;
        }

        const parentCategory = categories.find(cat => cat.id === currentParentId);
        currentParentId = parentCategory?.parentId || null as any;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Import axios for API calls
      const axios = await import('axios');

      if (isEditMode && id) {
        // Update existing category
        await axios.default.put(`/api/categories/${id}`, {
          name: formData.name,
          description: formData.description,
          parentId: formData.parentId,
          isActive: formData.isActive
        });

        // Log activity via API
        try {
          await axios.default.post('/api/audit/logs', {
            userId: 'admin', // Use actual user ID if available
            action: 'UPDATE_CATEGORY',
            description: `Updated category: ${formData.name}`,
            entityType: 'category',
            entityId: id
          });
        } catch (logError) {
          console.error('Error creating audit log:', logError);
          // Continue even if audit log creation fails
        }

        alert(`Category "${formData.name}" has been updated successfully.`);
      } else {
        // Create new category
        const response = await axios.default.post('/api/categories', {
          name: formData.name,
          description: formData.description,
          parentId: formData.parentId,
          isActive: formData.isActive
        });

        const newCategory = response.data;

        // Log activity via API
        try {
          await axios.default.post('/api/audit/logs', {
            userId: 'admin', // Use actual user ID if available
            action: 'CREATE_CATEGORY',
            description: `Created new category: ${formData.name}`,
            entityType: 'category',
            entityId: newCategory.id
          });
        } catch (logError) {
          console.error('Error creating audit log:', logError);
          // Continue even if audit log creation fails
        }

        alert(`Category "${formData.name}" has been created successfully.`);
      }

      navigate('/categories');
    } catch (error) {
      console.error('Error saving category:', error);
      alert('Failed to save category. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get available parent categories (exclude self in edit mode)
  const getAvailableParentCategories = () => {
    if (isEditMode && id) {
      return categories.filter(cat => cat.id !== id);
    }
    return categories;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditMode ? 'Edit Category' :
              type === 'parent' ? 'Add Parent Category' :
              parentId ? 'Add Subcategory' : 'Add New Category'}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {isEditMode
              ? 'Update category details and parent-child relationships'
              : type === 'parent'
                ? 'Create a new top-level parent category'
                : parentId
                  ? `Create a new subcategory under ${categories.find(c => c.id === parentId)?.name || 'parent'}`
                  : 'Create a new product category or subcategory'
            }
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <button
            type="button"
            onClick={() => navigate('/categories')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <FaArrowLeft className="-ml-1 mr-2 h-4 w-4" />
            Back to Categories
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <FormSection
          title="Category Information"
          description="Enter the basic details for this category"
        >
          <div className="grid grid-cols-1 gap-6">
            <FormField
              label="Category Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
              required
              placeholder="Enter category name"
            />

            <FormField
              label="Description"
              name="description"
              as="textarea"
              value={formData.description || ''}
              onChange={handleChange}
              placeholder="Enter category description (optional)"
              rows={3}
              helpText="A brief description of what this category contains"
            />

            {/* Hide parent category selection when explicitly creating a parent category */}
            {type !== 'parent' && (
              <SearchableSelect
                label="Parent Category"
                name="parentId"
                value={formData.parentId || ''}
                onChange={(value) => setFormData({...formData, parentId: value || null})}
                options={[
                  { value: '', label: 'None (Top-Level Category)', icon: <FaTag className="text-gray-400" /> },
                  ...getAvailableParentCategories().map(cat => ({
                    value: cat.id,
                    label: cat.name,
                    description: cat.description,
                    icon: <FaTag className="text-primary-500" />
                  }))
                ]}
                error={errors.parentId}
                helpText={parentId ? `Creating subcategory under ${categories.find(c => c.id === parentId)?.name || 'parent'}` : "Select a parent category to create a hierarchical structure"}
                placeholder="Select parent category (optional)"
                disabled={!!parentId} // Disable if parent ID is provided in URL
              />
            )}

            <div className="flex items-center">
              <input
                id="isActive"
                name="isActive"
                type="checkbox"
                checked={formData.isActive}
                onChange={handleCheckboxChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                Active Category
              </label>
              <p className="ml-4 text-xs text-gray-500">
                Inactive categories won't appear in product forms and customer-facing interfaces
              </p>
            </div>
          </div>
        </FormSection>

        <FormActions
          submitText={isEditMode ? 'Update Category' : 'Create Category'}
          cancelHref="/categories"
          isSubmitting={isSubmitting}
        />
      </form>
    </div>
  );
};

export default CategoryForm;
