import { useState, useEffect, useRef } from 'react';
import api from '../utils/axios';
import Toast from '../components/Toast';
import Loader from '../components/UI/Loader';

const Sell = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    condition: '',
    images: [], // Array to store image files
    askingPrice: '',
    requestQuote: false,
    seller: {
      name: '',
      email: '',
      phone: ''
    }
  });

  const [imagePreviewUrls, setImagePreviewUrls] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ type: '', message: '' });
  const fileInputRef = useRef(null);

  // Categories for product listing
  const categories = [
    'Laptops & Computers',
    'Mobile Phones & Tablets',
    'TVs & Monitors',
    'Audio Equipment',
    'Cameras & Photography',
    'Gaming Consoles',
    'Home Appliances',
    'Other Electronics'
  ];

  // Condition options for product
  const conditions = [
    'New',
    'Excellent',
    'Good',
    'Fair'
  ];

  // Handle input change for form fields
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.startsWith('seller.')) {
      // Handle nested seller fields
      const sellerField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        seller: {
          ...prev.seller,
          [sellerField]: value
        }
      }));
    } else if (name === 'requestQuote') {
      // Handle checkbox for request quote
      setFormData(prev => ({
        ...prev,
        requestQuote: checked,
        askingPrice: checked ? '' : prev.askingPrice // Clear price if request quote is checked
      }));
    } else {
      // Handle regular fields
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  // Handle file selection for images
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    // Validate files (only images, reasonable size)
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/');
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB max
      
      if (!isValidType) {
        setSubmitStatus({
          type: 'error',
          message: `${file.name} is not an image file.`
        });
        setShowToast(true);
      } else if (!isValidSize) {
        setSubmitStatus({
          type: 'error',
          message: `${file.name} exceeds the 10MB size limit.`
        });
        setShowToast(true);
      }
      
      return isValidType && isValidSize;
    });
    
    if (validFiles.length === 0) return;
    
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...validFiles]
    }));
    
    // Generate preview URLs for the images
    const newPreviewUrls = validFiles.map(file => URL.createObjectURL(file));
    setImagePreviewUrls(prev => [...prev, ...newPreviewUrls]);
  };
  
  // Remove an image from the selection
  const removeImage = (index) => {
    // Remove the image from formData
    const newImages = [...formData.images];
    newImages.splice(index, 1);
    setFormData(prev => ({
      ...prev,
      images: newImages
    }));
    
    // Remove the preview URL
    const newPreviewUrls = [...imagePreviewUrls];
    URL.revokeObjectURL(newPreviewUrls[index]); // Clean up to avoid memory leaks
    newPreviewUrls.splice(index, 1);
    setImagePreviewUrls(newPreviewUrls);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate that at least one image is selected
    if (formData.images.length === 0) {
      setSubmitStatus({
        type: 'error',
        message: 'Please select at least one image of your product.'
      });
      setShowToast(true);
      return;
    }
    
    setIsSubmitting(true);
    setSubmitStatus({ type: '', message: '' });

    try {
      const formDataToSend = new FormData();
      
      // Append all form fields
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('condition', formData.condition);
      formDataToSend.append('requestQuote', formData.requestQuote);
      
      if (!formData.requestQuote && formData.askingPrice) {
        formDataToSend.append('askingPrice', formData.askingPrice);
      }
      
      // Append seller information
      formDataToSend.append('seller.name', formData.seller.name);
      formDataToSend.append('seller.email', formData.seller.email);
      formDataToSend.append('seller.phone', formData.seller.phone);
      
      // Append all image files 
      formData.images.forEach((image, index) => {
        formDataToSend.append('images', image);
      });
      
      console.log('Submitting form data with images...');
      
      // Make sure we're using the correct Content-Type for multipart/form-data
      const response = await api.post('/sell', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log('Form submitted successfully:', response.data);
      setSubmitStatus({
        type: 'success',
        message: 'Your product has been submitted for review!'
      });
      setShowToast(true);
      
      // Reset the form
      setFormData({
        title: '',
        description: '',
        category: '',
        condition: '',
        images: [],
        askingPrice: '',
        requestQuote: false,
        seller: {
          name: '',
          email: '',
          phone: ''
        }
      });
      
      // Clear image previews
      imagePreviewUrls.forEach(url => URL.revokeObjectURL(url));
      setImagePreviewUrls([]);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error submitting product:', error);
      let errorMessage = 'Failed to submit product. Please try again.';
      
      if (error.response) {
        console.error('Response error data:', error.response.data);
        errorMessage = error.response.data.message || errorMessage;
      }
      
      setSubmitStatus({
        type: 'error',
        message: errorMessage
      });
      setShowToast(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    // Clean up any preview URLs when component unmounts
    return () => {
      imagePreviewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Sell Your Used Electronics</h1>
      
      {/* Sell form */}
      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Product title */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              placeholder="e.g. Washing Machine, Refrigerator, etc."
            />
          </div>
          
          {/* Product category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select a category</option>
              {categories.map((category, index) => (
                <option key={index} value={category}>{category}</option>
              ))}
            </select>
          </div>
          
          {/* Product condition */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
            <select
              name="condition"
              value={formData.condition}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select condition</option>
              {conditions.map((condition, index) => (
                <option key={index} value={condition}>{condition}</option>
              ))}
            </select>
          </div>
          
          {/* Product description */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="4"
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              placeholder="Describe your product, including specifications, age, any defects, etc."
            ></textarea>
          </div>
          
          {/* Image upload section */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Images</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div className="flex text-sm text-gray-600">
                  <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                    <span>Upload images</span>
                    <input 
                      id="file-upload" 
                      name="file-upload" 
                      type="file" 
                      className="sr-only" 
                      onChange={handleImageChange}
                      accept="image/*"
                      multiple
                      ref={fileInputRef}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG, WEBP up to 10MB each</p>
              </div>
            </div>
            
            {/* Image Preview Grid */}
            {imagePreviewUrls.length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                {imagePreviewUrls.map((url, index) => (
                  <div key={index} className="relative rounded-md overflow-hidden h-32">
                    <img
                      src={url}
                      alt={`Preview ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-red-500 bg-opacity-75 text-white rounded-full p-1"
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
          
          {/* Price section */}
          <div className="md:col-span-2">
            <div className="mb-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="requestQuote"
                  checked={formData.requestQuote}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Request a quote (we'll evaluate your item)</span>
              </label>
            </div>
            
            {!formData.requestQuote && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Your asking price (₹)</label>
                <input
                  type="number"
                  name="askingPrice"
                  value={formData.askingPrice}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required={!formData.requestQuote}
                  placeholder="0.00"
                />
              </div>
            )}
          </div>
          
          {/* Seller information */}
          <div className="md:col-span-2 mt-4">
            <h3 className="text-lg font-medium text-gray-800 mb-2">Contact Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
                <input
                  type="text"
                  name="seller.name"
                  value={formData.seller.name}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="seller.email"
                  value={formData.seller.email}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  name="seller.phone"
                  value={formData.seller.phone}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  placeholder="e.g. 9876543210"
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Submit button */}
        <div className="mt-8 text-center">
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 transition duration-300 disabled:bg-gray-400"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="flex justify-center items-center">
                <Loader size={30} className="mr-2" />
                <span>Submitting...</span>
              </div>
            ) : (
              'Submit Your Product'
            )}
          </button>
        </div>
      </form>
      
      {/* Toast notification */}
      {showToast && (
        <Toast
          type={submitStatus.type}
          message={submitStatus.message}
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
};

export default Sell;