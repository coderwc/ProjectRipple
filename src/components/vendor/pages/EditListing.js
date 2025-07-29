import React, { useEffect, useState } from 'react';
import { ArrowLeft, Camera } from 'lucide-react';
import axios from 'axios';
import { auth } from '../../../firebase/config';

const EditListing = ({ user, listingId, onBack }) => {
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

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleInputChange('image', URL.createObjectURL(file));
    }
  };

  const fetchListingDetails = async () => {
    try {
      const currentUser = auth.currentUser;
      const token = await currentUser.getIdToken();
      const response = await axios.get(`http://localhost:5001/api/vendor/listings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const listing = response.data.find(item => item.id === listingId);
      if (listing) setFormData(listing);
    } catch (error) {
      console.error('❌ Failed to fetch listing details:', error);
    }
  };

  const handleUpdate = async () => {
    if (!formData.name || !formData.category || !formData.price) {
      alert('Please fill in Item Name, Category, and Price.');
      return;
    }

    try {
      const currentUser = auth.currentUser;
      const token = await currentUser.getIdToken();

      const updatedData = {
        name: formData.name,
        category: formData.category,
        price: formData.price || 0,
        quantity: formData.quantity || 1,
        expiryDate: formData.expiryDate || null,
        condition: formData.condition,
        description: formData.description || '',
        image: formData.image || '',
      };

      const response = await axios.put(
        `http://localhost:5001/api/vendor/listings/${listingId}`,
        updatedData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("✅ Listing updated:", response.data);
      alert('Listing updated successfully!');
      onBack();
    } catch (error) {
      console.error("❌ Error updating listing:", error);
      alert("Failed to update listing.");
    }
  };

  useEffect(() => {
    if (user && listingId) {
      fetchListingDetails();
    }
  }, [user, listingId]);

  return (
    <div className="max-w-sm mx-auto bg-gradient-to-b from-blue-200 via-blue-100 to-white min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center px-4 py-2 bg-white text-sm font-medium text-gray-700">
        <span>9:30</span>
        <div className="flex gap-1">
          <div className="w-4 h-2 bg-black rounded-sm"></div>
          <div className="w-4 h-2 bg-black rounded-sm"></div>
        </div>
      </div>

      <div className="bg-white px-4 py-4 border-b border-gray-100 shadow-md">
        <div className="flex items-center gap-3">
          <button onClick={onBack}>
            <ArrowLeft className="w-6 h-6 text-blue-700" />
          </button>
          <h1 className="text-xl font-bold text-blue-800">Edit Listing</h1>
        </div>
      </div>

      {/* Form */}
      <div className="px-4 py-6 pb-24">
        <div className="mb-6">
          <h3 className="text-lg font-bold text-blue-800 mb-4">Product Listing</h3>

          <div className="flex gap-4 mb-6">
            <div className="w-24 h-24 flex-shrink-0">
              <label className="block w-full h-full bg-blue-50 rounded-lg border-2 border-dashed border-blue-300 cursor-pointer hover:border-blue-400 transition-colors overflow-hidden">
                {formData.image ? (
                  <img src={formData.image} alt="preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Camera className="w-6 h-6 text-blue-400" />
                  </div>
                )}
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
            </div>

            <div className="flex-1 space-y-3">
              <input
                className="w-full p-3 bg-white border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Item Name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
              />
              <select
                className="w-full p-3 bg-white border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-blue-700 mb-2">Expiry Date (optional)</label>
            <input
              type="date"
              className="w-full p-3 bg-white border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.expiryDate || ''}
              onChange={(e) => handleInputChange('expiryDate', e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-blue-700 mb-3">Item Condition</label>
            <div className="grid grid-cols-3 gap-2">
              {['New', 'Used', 'B-Grade'].map((condition) => (
                <button
                  key={condition}
                  type="button"
                  onClick={() => handleInputChange('condition', condition)}
                  className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                    formData.condition === condition ? 'bg-blue-600 text-white' : 'bg-white border border-blue-200 text-blue-700 hover:bg-blue-50'
                  }`}
                >
                  {condition}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-blue-700 mb-2">Add a description (optional)</label>
            <textarea
              rows="4"
              className="w-full p-3 bg-white border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Provide more details about your product…"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-blue-700 mb-2">Quantity</label>
            <input
              type="number"
              className="w-full p-3 bg-white border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.quantity}
              onChange={(e) => {
            const val = e.target.value;
            if (val === '' || /^[0-9]+$/.test(val)) {
                handleInputChange('quantity', val);
            }
            }}
              min="1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-blue-700 mb-2">Price per product (SGD)</label>
            <input
              type="number"
              className="w-full p-3 bg-white border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.price}
            onChange={(e) => {
                const val = e.target.value;
                if (val === '' || /^[0-9]*\.?[0-9]*$/.test(val)) {
                handleInputChange('price', val);
                }
            }}
              min="0"
              step="0.01"
              placeholder="0.00"
            />
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-sm bg-white border-t border-blue-200 px-4 py-4">
        <button
          onClick={handleUpdate}
          className="w-full bg-blue-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-blue-700 transition-colors"
        >
          UPDATE LISTING
        </button>
      </div>
    </div>
  );
};

export default EditListing;