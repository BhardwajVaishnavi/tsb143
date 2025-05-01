import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaChevronRight,
  FaChevronDown,
  FaTag,
  FaBoxOpen,
  FaEye,
  FaTimes
} from 'react-icons/fa';
import { Category } from '../../types/category';

const CategoryList: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  // Parse query parameters
  const queryParams = new URLSearchParams(location.search);
  const filterParentId = queryParams.get('parent');
  const filterId = queryParams.get('id');

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);

        // Import axios for API calls
        const axios = await import('axios');

        // Fetch categories from API
        let categoriesData: any[] = [];
        try {
          console.log('Fetching categories from API...');
          const response = await axios.default.get('/api/categories');
          console.log('API Response:', response);
          categoriesData = response.data || [];
          console.log('Categories from API:', categoriesData);
          console.log('Number of categories:', categoriesData.length);
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
          productCount: 0 // Will be populated below
        }));

        // Get product counts for each category
        const getProductCounts = async () => {
          for (const category of transformedCategories) {
            try {
              const response = await axios.default.get(`/api/categories/${category.id}/products/count`);
              category.productCount = response.data.count;
            } catch (error) {
              console.error(`Error getting product count for category ${category.id}:`, error);
              category.productCount = 0;
            }
          }
        };

        // Execute product count fetching
        getProductCounts();

        // Set the categories from the API response
        setCategories(transformedCategories);

        // Expand top-level categories by default
        const rootCategories = transformedCategories
          .filter(cat => cat.parentId === null)
          .map(cat => cat.id);

        setExpandedCategories(rootCategories);
      } catch (error) {
        console.error('Error in fetchCategories:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Toggle category expansion
  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  // Get child categories
  const getChildCategories = (parentId: string) => {
    return categories.filter(category => category.parentId === parentId);
  };

  // Check if a category has children
  const hasChildren = (categoryId: string) => {
    return categories.some(category => category.parentId === categoryId);
  };

  // Get root categories (no parent) - used in renderCategoryTree
  const getRootCategories = () => {
    return categories.filter(category => category.parentId === null);
  };

  // Handle category deletion
  const handleDeleteCategory = (category: Category) => {
    setCategoryToDelete(category);
    setDeleteModalOpen(true);
  };

  // Confirm category deletion
  const confirmDeleteCategory = async () => {
    if (!categoryToDelete) return;

    // Check if category has children
    const hasChildCategories = categories.some(cat => cat.parentId === categoryToDelete.id);

    if (hasChildCategories) {
      alert('Cannot delete a category with subcategories. Please delete or reassign the subcategories first.');
      setDeleteModalOpen(false);
      return;
    }

    try {
      // Import axios for API calls
      const axios = await import('axios');

      // Delete the category using API
      const response = await axios.default.delete(`/api/categories/${categoryToDelete.id}`);

      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to delete category');
      }

      // Update local state
      setCategories(prev => prev.filter(cat => cat.id !== categoryToDelete.id));

      // Log activity via API
      try {
        await axios.default.post('/api/audit/logs', {
          userId: 'admin', // Use actual user ID if available
          action: 'DELETE_CATEGORY',
          description: `Deleted category: ${categoryToDelete.name}`,
          entityType: 'category',
          entityId: categoryToDelete.id
        });
      } catch (logError) {
        console.error('Error creating audit log:', logError);
        // Continue even if audit log creation fails
      }

      alert(`Category "${categoryToDelete.name}" has been deleted successfully.`);
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Failed to delete category. Please try again later.');
    } finally {
      setDeleteModalOpen(false);
      setCategoryToDelete(null);
    }
  };

  // Clear filters function
  const clearFilters = () => {
    navigate('/categories');
  };

  // Filter categories based on search term and query parameters
  const filteredCategories = categories.filter(cat => {
    // First apply search term filter if present
    const matchesSearch = !searchTerm ||
      cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cat.description && cat.description.toLowerCase().includes(searchTerm.toLowerCase()));

    // Then apply parent filter if present
    const matchesParentFilter = !filterParentId || cat.parentId === filterParentId;

    // Then apply specific ID filter if present
    const matchesIdFilter = !filterId || cat.id === filterId;

    return matchesSearch && (matchesParentFilter || matchesIdFilter);
  });

  // Recursive function to render category tree
  const renderCategoryTree = (parentId: string | null = null, level = 0) => {
    // Use getRootCategories for top level, otherwise filter by parentId
    const categoryList = parentId === null ?
      getRootCategories().filter(cat => filteredCategories.includes(cat)) :
      filteredCategories.filter(cat => cat.parentId === parentId);

    if (categoryList.length === 0) {
      return null;
    }

    return (
      <ul className={`${level > 0 ? 'pl-6 border-l border-gray-200' : ''}`}>
        {categoryList.map(category => {
          const isExpanded = expandedCategories.includes(category.id);
          const children = getChildCategories(category.id);
          const hasChildCategories = children.length > 0;

          return (
            <li key={category.id} className={`py-2 ${level > 0 ? 'mt-2' : 'border-b border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {hasChildCategories ? (
                    <button
                      onClick={() => toggleCategory(category.id)}
                      className="mr-2 text-gray-500 hover:text-primary-600 focus:outline-none"
                    >
                      {isExpanded ? <FaChevronDown size={14} /> : <FaChevronRight size={14} />}
                    </button>
                  ) : (
                    <span className="mr-2 w-3.5"></span>
                  )}

                  <div className="flex items-center">
                    {category.parentId === null ? (
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary-100 text-primary-700 mr-2">
                        <FaTag className="h-3 w-3" />
                      </span>
                    ) : (
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-gray-500 mr-2">
                        <FaTag className="h-3 w-3" />
                      </span>
                    )}
                    <div>
                      <div className="flex items-center">
                        <span className={`font-medium ${category.isActive ? 'text-gray-900' : 'text-gray-500'}`}>
                          {category.name}
                        </span>
                        {category.parentId === null && (
                          <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-primary-100 text-primary-700">
                            Parent
                          </span>
                        )}
                      </div>
                      {category.description && (
                        <p className="text-xs text-gray-500">{category.description}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500 mr-2">
                    {category.productCount} products
                  </span>

                  <span className={`px-2 py-1 text-xs rounded-full ${
                    category.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {category.isActive ? 'Active' : 'Inactive'}
                  </span>

                  <Link
                    to={`/categories/${category.id}`}
                    className="p-1 text-gray-500 hover:text-primary-600"
                    title="View Category"
                  >
                    <FaEye size={16} />
                  </Link>

                  <Link
                    to={`/categories/${category.id}/edit`}
                    className="p-1 text-blue-500 hover:text-blue-700"
                    title="Edit Category"
                  >
                    <FaEdit size={16} />
                  </Link>

                  <button
                    onClick={() => handleDeleteCategory(category)}
                    className="p-1 text-red-500 hover:text-red-700"
                    title="Delete Category"
                    disabled={hasChildCategories}
                  >
                    <FaTrash size={16} className={hasChildCategories ? 'opacity-50 cursor-not-allowed' : ''} />
                  </button>
                </div>
              </div>

              {isExpanded && hasChildCategories && (
                <div className="mt-2">
                  {renderCategoryTree(category.id, level + 1)}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    );
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
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage product categories and subcategories
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-3">
          <Link
            to="/categories/new?type=parent"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <FaPlus className="-ml-1 mr-2 h-4 w-4" />
            Add Parent Category
          </Link>
          <div className="relative group">
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <FaPlus className="-ml-1 mr-2 h-4 w-4" />
              Add Subcategory
              <FaChevronDown className="ml-2 h-4 w-4" />
            </button>
            <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 hidden group-hover:block z-10">
              <div className="py-1" role="menu" aria-orientation="vertical">
                {categories
                  .filter(cat => cat.parentId === null) // Only show top-level categories
                  .map(category => (
                    <Link
                      key={category.id}
                      to={`/categories/new?parent=${category.id}`}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      role="menuitem"
                    >
                      Under "{category.name}"
                    </Link>
                  ))
                }
                {categories.filter(cat => cat.parentId === null).length === 0 && (
                  <div className="block px-4 py-2 text-sm text-gray-500">
                    No parent categories available
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <input
              type="text"
              placeholder="Search categories..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
          </div>

          {/* Filter indicators */}
          {(filterParentId || filterId) && (
            <div className="mt-3 flex items-center">
              <span className="text-sm text-gray-500 mr-2">Filters:</span>
              {filterParentId && (
                <div className="flex items-center bg-primary-50 text-primary-700 rounded-full px-3 py-1 text-sm mr-2">
                  <span>Parent: {categories.find(c => c.id === filterParentId)?.name || 'Unknown'}</span>
                  <button
                    onClick={clearFilters}
                    className="ml-2 text-primary-500 hover:text-primary-700"
                  >
                    <FaTimes size={14} />
                  </button>
                </div>
              )}
              {filterId && (
                <div className="flex items-center bg-primary-50 text-primary-700 rounded-full px-3 py-1 text-sm">
                  <span>Category: {categories.find(c => c.id === filterId)?.name || 'Unknown'}</span>
                  <button
                    onClick={clearFilters}
                    className="ml-2 text-primary-500 hover:text-primary-700"
                  >
                    <FaTimes size={14} />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-4">
          {filteredCategories.length === 0 ? (
            <div className="text-center py-8">
              <FaBoxOpen className="mx-auto h-12 w-12 text-gray-300" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No categories found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? 'Try adjusting your search term.' : 'Get started by adding a new category.'}
              </p>
              {!searchTerm && (
                <div className="mt-6 flex justify-center space-x-3">
                  <Link
                    to="/categories/new?type=parent"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    <FaPlus className="-ml-1 mr-2 h-4 w-4" />
                    Add Parent Category
                  </Link>
                </div>
              )}
            </div>
          ) : searchTerm ? (
            // When searching, show flat list of results
            <div>
              <p className="text-sm text-gray-500 mb-4">
                Found {filteredCategories.length} categories matching "{searchTerm}"
              </p>
              <ul className="divide-y divide-gray-200">
                {filteredCategories.map(category => (
                  <li key={category.id} className="py-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {category.parentId === null ? (
                          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary-100 text-primary-700 mr-2">
                            <FaTag className="h-3 w-3" />
                          </span>
                        ) : (
                          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-gray-500 mr-2">
                            <FaTag className="h-3 w-3" />
                          </span>
                        )}
                        <div>
                          <div className="flex items-center">
                            <span className={`font-medium ${category.isActive ? 'text-gray-900' : 'text-gray-500'}`}>
                              {category.name}
                            </span>
                            {category.parentId === null ? (
                              <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-primary-100 text-primary-700">
                                Parent
                              </span>
                            ) : (
                              <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-500">
                                Subcategory
                              </span>
                            )}
                          </div>
                          {category.description && (
                            <p className="text-xs text-gray-500">{category.description}</p>
                          )}
                          {category.parentId && (
                            <p className="text-xs text-gray-500">
                              Parent: {categories.find(c => c.id === category.parentId)?.name}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500 mr-2">
                          {category.productCount} products
                        </span>

                        <Link
                          to={`/categories/${category.id}`}
                          className="p-1 text-gray-500 hover:text-primary-600"
                          title="View Category"
                        >
                          <FaEye size={16} />
                        </Link>

                        <Link
                          to={`/categories/${category.id}/edit`}
                          className="p-1 text-blue-500 hover:text-blue-700"
                          title="Edit Category"
                        >
                          <FaEdit size={16} />
                        </Link>

                        <button
                          onClick={() => handleDeleteCategory(category)}
                          className="p-1 text-red-500 hover:text-red-700"
                          title="Delete Category"
                          disabled={hasChildren(category.id)}
                        >
                          <FaTrash size={16} className={hasChildren(category.id) ? 'opacity-50 cursor-not-allowed' : ''} />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            // When not searching, show hierarchical tree
            renderCategoryTree()
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && categoryToDelete && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Deletion</h3>
            <p className="text-sm text-gray-500 mb-4">
              Are you sure you want to delete the category <span className="font-medium">{categoryToDelete.name}</span>?
              This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteCategory}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryList;
