import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { createProduct, updateProduct } from '../services/api';

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
        setImagePreviewUrls(product.imageUrls);
      } else if (product.imageUrl) {
        setImageUrls([product.imageUrl]);
        setImagePreviewUrls([product.imageUrl]);
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
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Product Title *
        </label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className={`w-full p-2 border rounded-md ${errors.title ? 'border-red-500' : 'border-gray-300'}`}
          placeholder="Enter product title"
        />
        {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description *
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows="4"
          className={`w-full p-2 border rounded-md ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
          placeholder="Enter product description"
        ></textarea>
        {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category *
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className={`w-full p-2 border rounded-md ${errors.category ? 'border-red-500' : 'border-gray-300'}`}
          >
            <option value="">Select a category</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Price (₹) *
          </label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            min="0"
            step="0.01"
            className={`w-full p-2 border rounded-md ${errors.price ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="0.00"
          />
          {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Stock
          </label>
          <input
            type="number"
            name="stock"
            value={formData.stock}
            onChange={handleChange}
            min="0"
            className={`w-full p-2 border rounded-md ${errors.stock ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="0"
          />
          {errors.stock && <p className="text-red-500 text-xs mt-1">{errors.stock}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Brand
          </label>
          <input
            type="text"
            name="brand"
            value={formData.brand}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
            placeholder="Enter brand name"
          />
        </div>
      </div>
      
      <div className="flex flex-wrap items-center gap-6">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="featured"
            name="featured"
            checked={formData.featured}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
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
            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
          />
          <label htmlFor="isRefurbished" className="ml-2 block text-sm text-gray-700">
            Refurbished Product
          </label>
        </div>
      </div>
      
      {formData.isRefurbished && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Condition *
          </label>
          <select
            name="condition"
            value={formData.condition}
            onChange={handleChange}
            className={`w-full p-2 border rounded-md ${errors.condition ? 'border-red-500' : 'border-gray-300'}`}
          >
            <option value="">Select condition</option>
            <option value="Like New">Like New</option>
            <option value="Good">Good</option>
            <option value="Fair">Fair</option>
            <option value="Poor">Poor</option>
          </select>
          {errors.condition && <p className="text-red-500 text-xs mt-1">{errors.condition}</p>}
        </div>
      )}
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Product Images *
        </label>
        <div className={`border ${errors.images ? 'border-red-500' : 'border-gray-300'} rounded-md p-4`}>
          {/* Image preview grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-4">
            {imagePreviewUrls.map((url, index) => (
              <div key={index} className="relative aspect-square border rounded-md overflow-hidden">
                <img 
                  src={url} 
                  alt={`Product preview ${index + 1}`} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = '/images/placeholder.png';
                    e.target.classList.add('opacity-50');
                  }}
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                  aria-label="Remove image"
                >
                  &times;
                </button>
              </div>
            ))}
            
            {/* Add image button */}
            <div 
              onClick={() => fileInputRef.current.click()}
              className="aspect-square border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span className="text-sm text-gray-500 mt-1">Add Image</span>
            </div>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageChange}
            className="hidden"
          />
          
          <p className="text-sm text-gray-500">
            Click "Add Image" to upload product images. You can upload multiple images.
          </p>
        </div>
        {errors.images && <p className="text-red-500 text-xs mt-1">{errors.images}</p>}
      </div>
      
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? 'Saving...' : isEdit ? 'Update Product' : 'Create Product'}
        </button>
      </div>
    </form>
  );
};

export default ProductForm;
