import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaChevronRight,
  FaChevronDown,
  FaTag,
  FaBoxOpen,
  FaEye
} from 'react-icons/fa';
import { Category } from '../../types/category';
import { useAuth } from '../../contexts/AuthContext';

const CategoryList: React.FC = () => {
  const { logActivity } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);

        // Import API utility
        const { API } = await import('../../utils/api');

        // Fetch categories from the API
        let categoriesData: any[] = [];
        try {
          const response = await API.products.getCategories();
          categoriesData = Array.isArray(response) ? response :
                          response && typeof response === 'object' && 'data' in response ?
                          (response as any).data : [];
        } catch (error) {
          console.error('Error fetching categories from API:', error);
          categoriesData = [];
        }

        // Transform the data to match our Category type
        const transformedCategories: Category[] = categoriesData.map((cat: any) => ({
          id: cat.id,
          name: cat.name,
          description: cat.description || '',
          parentId: cat.parentId,
          createdAt: cat.createdAt || new Date().toISOString(),
          updatedAt: cat.updatedAt || new Date().toISOString(),
          createdBy: cat.createdBy || 'unknown',
          updatedBy: cat.updatedBy || 'unknown',
          isActive: cat.isActive !== undefined ? cat.isActive : true,
          productCount: cat.productCount || 0
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

        // Expand top-level categories by default
        const rootCategories = transformedCategories.length > 0
          ? transformedCategories.filter(cat => cat.parentId === null).map(cat => cat.id)
          : ['cat-1', 'cat-2', 'cat-3'];

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
      // Import API utility
      const { API } = await import('../../utils/api');

      // Delete the category
      await API.products.deleteCategory(categoryToDelete.id);

      // Update local state
      setCategories(prev => prev.filter(cat => cat.id !== categoryToDelete.id));

      // Log activity
      logActivity(
        'delete_category',
        `Deleted category: ${categoryToDelete.name}`,
        'category',
        categoryToDelete.id
      );

      alert(`Category "${categoryToDelete.name}" has been deleted successfully.`);
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Failed to delete category. Please try again later.');
    } finally {
      setDeleteModalOpen(false);
      setCategoryToDelete(null);
    }
  };

  // Filter categories based on search term
  const filteredCategories = searchTerm
    ? categories.filter(cat =>
        cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (cat.description && cat.description.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : categories;

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
                    <FaTag className={`mr-2 ${category.isActive ? 'text-primary-500' : 'text-gray-400'}`} />
                    <div>
                      <span className={`font-medium ${category.isActive ? 'text-gray-900' : 'text-gray-500'}`}>
                        {category.name}
                      </span>
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
        <div className="mt-4 md:mt-0">
          <Link
            to="/categories/new"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <FaPlus className="-ml-1 mr-2 h-4 w-4" />
            Add Category
          </Link>
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
                <div className="mt-6">
                  <Link
                    to="/categories/new"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    <FaPlus className="-ml-1 mr-2 h-4 w-4" />
                    Add Category
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
                        <FaTag className={`mr-2 ${category.isActive ? 'text-primary-500' : 'text-gray-400'}`} />
                        <div>
                          <span className={`font-medium ${category.isActive ? 'text-gray-900' : 'text-gray-500'}`}>
                            {category.name}
                          </span>
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
