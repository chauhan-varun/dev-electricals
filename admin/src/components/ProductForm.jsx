import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { createProduct, updateProduct } from '../services/api';
import { isCloudinaryUrl, optimizeCloudinaryUrl } from '../utils/cloudinary';

const categories = [
  "Appliances",
  "Audio & Video",
  "Computers",
  "Gadgets",
  "Home Automation",
  "Lighting",
  "Mobile Devices",
  "Security",
  "Tools",
  "Other"
];

const ProductForm = ({ product = null, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    price: '',
    stock: 0,
    featured: false,
    isRefurbished: false,
    condition: '',
    brand: ''
  });
  
  const [images, setImages] = useState([]);
  const [imageUrls, setImageUrls] = useState([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef();

  // If product is provided, it's an edit operation
  const isEdit = !!product;

  useEffect(() => {
    if (product) {
      setFormData({
        title: product.title || '',
        description: product.description || '',
        category: product.category || '',
        price: product.price || '',
        stock: product.stock || 0,
        featured: product.featured || false,
        isRefurbished: product.isRefurbished || false,
        condition: product.condition || '',
        brand: product.brand || ''
      });
      
      // Handle existing images
      if (product.imageUrls && product.imageUrls.length > 0) {
        setImageUrls(product.imageUrls);
        setImagePreviewUrls(product.imageUrls.map(url => isCloudinaryUrl(url) ? optimizeCloudinaryUrl(url) : url));
      } else if (product.imageUrl) {
        setImageUrls([product.imageUrl]);
        setImagePreviewUrls([isCloudinaryUrl(product.imageUrl) ? optimizeCloudinaryUrl(product.imageUrl) : product.imageUrl]);
      }
    }
  }, [product]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (imageUrls.length === 0 && images.length === 0) newErrors.images = 'At least one image is required';
    
    if (!formData.price) {
      newErrors.price = 'Price is required';
    } else if (isNaN(formData.price) || parseFloat(formData.price) < 0) {
      newErrors.price = 'Price must be a valid number greater than or equal to 0';
    }
    
    if (isNaN(formData.stock) || parseInt(formData.stock) < 0) {
      newErrors.stock = 'Stock must be a valid number greater than or equal to 0';
    }
    
    if (formData.isRefurbished && !formData.condition) {
      newErrors.condition = 'Condition is required for refurbished products';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    // Validate file types and sizes
    const validFiles = files.filter(file => {
      const isValid = file.type.startsWith('image/');
      if (!isValid) toast.error(`${file.name} is not an image file`);
      return isValid;
    });
    
    if (validFiles.length === 0) return;
    
    // Add to images state
    setImages(prev => [...prev, ...validFiles]);
    
    // Create preview URLs
    const newPreviewUrls = validFiles.map(file => URL.createObjectURL(file));
    setImagePreviewUrls(prev => [...prev, ...newPreviewUrls]);
  };
  
  const removeImage = (index) => {
    // If it's an existing URL
    if (index < imageUrls.length) {
      setImageUrls(prev => prev.filter((_, i) => i !== index));
      setImagePreviewUrls(prev => prev.filter((_, i) => i !== index));
    } 
    // If it's a new file
    else {
      const adjustedIndex = index - imageUrls.length;
      
      setImages(prev => prev.filter((_, i) => i !== adjustedIndex));
      
      // Also remove from preview URLs (considering offset for existing URLs)
      const newPreviewUrls = [...imagePreviewUrls];
      newPreviewUrls.splice(index, 1);
      setImagePreviewUrls(newPreviewUrls);
      
      // Revoke the object URL to avoid memory leaks
      URL.revokeObjectURL(imagePreviewUrls[index]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      // Create FormData for API request
      const formDataObj = new FormData();
      formDataObj.append('title', formData.title);
      formDataObj.append('description', formData.description);
      formDataObj.append('category', formData.category);
      formDataObj.append('price', formData.price);
      formDataObj.append('stock', formData.stock);
      formDataObj.append('featured', formData.featured);
      formDataObj.append('isRefurbished', formData.isRefurbished);
      
      if (formData.condition) {
        formDataObj.append('condition', formData.condition);
      }
      
      if (formData.brand) {
        formDataObj.append('brand', formData.brand);
      }
      
      // Append existing image URLs if any
      if (imageUrls.length > 0) {
        imageUrls.forEach(url => {
          formDataObj.append('existingImageUrls', url);
        });
      }
      
      // Append new image files if any
      if (images.length > 0) {
        images.forEach(file => {
          formDataObj.append('productImages', file);
        });
      }
      
      let result;
      if (isEdit) {
        result = await updateProduct(product._id, formDataObj);
        toast.success("Product updated successfully!");
      } else {
        result = await createProduct(formDataObj);
        toast.success("Product created successfully!");
      }
      
      if (onSave) onSave(result.product);
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error(error.message || 'Error saving product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Product Title*
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border ${errors.title ? 'border-red-500' : 'border-gray-300'} shadow-sm p-2`}
          />
          {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
        </div>

        {/* Category */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">
            Category*
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border ${errors.category ? 'border-red-500' : 'border-gray-300'} shadow-sm p-2`}
          >
            <option value="">Select Category</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          {errors.category && <p className="mt-1 text-sm text-red-500">{errors.category}</p>}
        </div>

        {/* Price */}
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700">
            Price (₹)*
          </label>
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleChange}
            min="0"
            step="0.01"
            className={`mt-1 block w-full rounded-md border ${errors.price ? 'border-red-500' : 'border-gray-300'} shadow-sm p-2`}
          />
          {errors.price && <p className="mt-1 text-sm text-red-500">{errors.price}</p>}
        </div>

        {/* Stock */}
        <div>
          <label htmlFor="stock" className="block text-sm font-medium text-gray-700">
            Stock Quantity
          </label>
          <input
            type="number"
            id="stock"
            name="stock"
            value={formData.stock}
            onChange={handleChange}
            min="0"
            className={`mt-1 block w-full rounded-md border ${errors.stock ? 'border-red-500' : 'border-gray-300'} shadow-sm p-2`}
          />
          {errors.stock && <p className="mt-1 text-sm text-red-500">{errors.stock}</p>}
        </div>

        {/* Brand */}
        <div>
          <label htmlFor="brand" className="block text-sm font-medium text-gray-700">
            Brand
          </label>
          <input
            type="text"
            id="brand"
            name="brand"
            value={formData.brand}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2"
          />
        </div>

        {/* Checkboxes */}
        <div className="flex flex-col space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="featured"
              name="featured"
              checked={formData.featured}
              onChange={handleChange}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="featured" className="ml-2 block text-sm text-gray-700">
              Featured Product
            </label>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isRefurbished"
              name="isRefurbished"
              checked={formData.isRefurbished}
              onChange={handleChange}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="isRefurbished" className="ml-2 block text-sm text-gray-700">
              Refurbished Product
            </label>
          </div>
        </div>
        
        {/* Condition (visible only for refurbished products) */}
        {formData.isRefurbished && (
          <div>
            <label htmlFor="condition" className="block text-sm font-medium text-gray-700">
              Condition*
            </label>
            <select
              id="condition"
              name="condition"
              value={formData.condition}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border ${errors.condition ? 'border-red-500' : 'border-gray-300'} shadow-sm p-2`}
            >
              <option value="">Select Condition</option>
              <option value="Excellent">Excellent</option>
              <option value="Good">Good</option>
              <option value="Fair">Fair</option>
            </select>
            {errors.condition && <p className="mt-1 text-sm text-red-500">{errors.condition}</p>}
          </div>
        )}
      </div>
      
      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description*
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={4}
          className={`mt-1 block w-full rounded-md border ${errors.description ? 'border-red-500' : 'border-gray-300'} shadow-sm p-2`}
        ></textarea>
        {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
      </div>
      
      {/* Image Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Product Images*
        </label>
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
          <div className="space-y-1 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
              aria-hidden="true"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="flex text-sm text-gray-600">
              <label
                htmlFor="file-upload"
                className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
              >
                <span>Upload images</span>
                <input
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  multiple
                  accept="image/*"
                  className="sr-only"
                  onChange={handleImageChange}
                  ref={fileInputRef}
                />
              </label>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs text-gray-500">PNG, JPG, WEBP up to 10MB</p>
          </div>
        </div>
        {errors.images && <p className="mt-1 text-sm text-red-500">{errors.images}</p>}
        
        {/* Image Previews */}
        {imagePreviewUrls.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {imagePreviewUrls.map((url, index) => (
              <div key={index} className="relative overflow-hidden rounded-md h-32">
                <img
                  src={url}
                  alt={`Preview ${index + 1}`}
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 bg-gray-800 bg-opacity-75 text-white rounded-full p-1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Form Actions */}
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className={`px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {loading ? 'Saving...' : isEdit ? 'Update Product' : 'Create Product'}
        </button>
      </div>
    </form>
  );
};

export default ProductForm;
