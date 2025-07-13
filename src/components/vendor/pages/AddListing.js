import React, { useState, useEffect } from 'react';
import { ArrowLeft, Camera } from 'lucide-react'; // Removed unused 'Plus'

const AddListing = ({ listings, setListings, user, editingId, isEditing, onBack }) => {
  const [formData, setFormData] = useState({
    image: null,
    name: '',
    category: '',
    expiryDate: '',
    condition: 'New',
    description: '',
    quantity: 1,
    price: 0
  });

  // Load existing data if editing
  useEffect(() => {
    if (isEditing && editingId !== null && listings[editingId]) {
      setFormData(listings[editingId]);
    }
  }, [isEditing, editingId, listings]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleInputChange('image', URL.createObjectURL(file));
    }
  };

  const handlePublish = () => {
    if (!formData.name || !formData.category || !formData.price) {
      alert('Please fill in Item Name, Category, and Price.');
      return;
    }

    const productData = {
      ...formData,
      id: isEditing ? editingId : Date.now(),
      vendorId: user.id,
      vendorName: user.name,
      createdAt: isEditing ? listings[editingId]?.createdAt : new Date().toISOString()
    };

    if (isEditing && editingId !== null) {
      // Update existing listing
      const updatedListings = [...listings];
      updatedListings[editingId] = productData;
      setListings(updatedListings);
    } else {
      // Add new listing
      setListings([...listings, productData]);
    }

    onBack();
  };

  return (
    <div className="max-w-sm mx-auto bg-gray-50 min-h-screen">
      {/* Status Bar */}
      <div className="flex justify-between items-center px-4 py-2 bg-white text-sm font-medium">
        <span>9:30</span>
        <div className="flex gap-1">
          <div className="w-4 h-2 bg-black rounded-sm"></div>
          <div className="w-4 h-2 bg-black rounded-sm"></div>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white px-4 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <button onClick={onBack}>
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">
            {isEditing ? 'Edit Listing' : 'Add Listing'}
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6 pb-24">
        {/* Info Text */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            List your surplus goods to reduce loss while doing great help to charities around you.
          </p>
        </div>

        {/* Product Listing Section */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Product Listing</h3>
          
          {/* Image Upload and Basic Info */}
          <div className="flex gap-4 mb-6">
            {/* Image Upload */}
            <div className="w-24 h-24 flex-shrink-0">
              <label className="block w-full h-full bg-gray-200 rounded-lg border-2 border-dashed border-gray-300 cursor-pointer hover:border-gray-400 transition-colors overflow-hidden">
                {formData.image ? (
                  <img 
                    src={formData.image} 
                    alt="preview" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Camera className="w-6 h-6 text-gray-400" />
                  </div>
                )}
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageUpload} 
                  className="hidden" 
                />
              </label>
            </div>

            {/* Basic Info */}
            <div className="flex-1 space-y-3">
              <input 
                className="w-full p-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Item Name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
              />
              
              <select 
                className="w-full p-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
              >
                <option value="">Category of Item</option>
                <option value="Food">Food</option>
                <option value="Household">Household</option>
                <option value="Medical">Medical Supplies</option>
                <option value="Clothing">Clothing</option>
                <option value="Electronics">Electronics</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-gray-900">Product Details</h3>

          {/* Expiry Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Expiry Date <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              type="date"
              className="w-full p-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.expiryDate}
              onChange={(e) => handleInputChange('expiryDate', e.target.value)}
            />
          </div>

          {/* Item Condition */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Item Condition</label>
            <div className="grid grid-cols-3 gap-2">
              {['New', 'Used', 'Defect'].map((condition) => (
                <button
                  key={condition}
                  type="button"
                  onClick={() => handleInputChange('condition', condition)}
                  className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                    formData.condition === condition
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {condition}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Add a description <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              rows="4"
              className="w-full p-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Provide more details about your product…"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
            />
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
            <input
              type="number"
              className="w-full p-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.quantity}
              onChange={(e) => handleInputChange('quantity', Math.max(1, parseInt(e.target.value) || 1))}
              min="1"
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Price per product (SGD)</label>
            <input
              type="number"
              className="w-full p-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.price}
              onChange={(e) => handleInputChange('price', Math.max(0, parseFloat(e.target.value) || 0))}
              min="0"
              step="0.01"
              placeholder="0.00"
            />
          </div>
        </div>
      </div>

      {/* Fixed Publish Button */}
      <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-sm bg-white border-t border-gray-200 px-4 py-4">
        <button 
          onClick={handlePublish}
          className="w-full bg-blue-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-blue-700 transition-colors"
        >
          {isEditing ? 'UPDATE LISTING' : 'PUBLISH LISTING'}
        </button>
      </div>
    </div>
  );
};

export default AddListing;