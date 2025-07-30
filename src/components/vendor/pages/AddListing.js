import React, { useState } from 'react';
import { ArrowLeft, Camera } from 'lucide-react';
import axios from 'axios';
import { auth } from '../../../firebase/config';

const AddListing = ({ user, onBack }) => {
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

  const handlePublish = async () => {

  if (!formData.name || !formData.category || !formData.price) {
    alert('Please fill in Item Name, Category, and Price.');
    return;
  }

  try {
    console.log("🧪 User object:", user); // Log user

    const currentUser = auth.currentUser;
    const token = await currentUser.getIdToken(); 
    console.log("🔑 Token:", token); // Log token

    const listingData = {
      ...formData,
      vendorId: user.id || user.uid,
      vendorName: user.name || user.displayName || '',
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    console.log("📦 Listing data being sent:", listingData);

    const response = await axios.post(
      'http://localhost:5001/api/vendor/listings',
      listingData,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    console.log("✅ Listing posted successfully:", response.data);
    console.log("🔍 Saved to Firestore path: vendors/" + (user.id || user.uid) + "/listings/" + response.data.id);
    alert('Listing published successfully!');
    onBack();

  } catch (error) {
    console.error('❌ Error publishing listing:', error);

    if (error.response) {
      console.error("📦 Server responded:", error.response.data);
    } else if (error.request) {
      console.error("📡 No response received from server:", error.request);
    } else {
      console.error("⚠️ Setup error:", error.message);
    }

    alert('Failed to publish listing.');
  }
};

  return (
    <div className="max-w-sm mx-auto bg-gradient-to-b from-blue-200 via-blue-100 to-white min-h-screen">
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
          <h1 className="text-xl font-bold text-blue-800">Add Listing</h1>
        </div>
      </div>

      <div className="px-4 py-6 pb-24">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            List your surplus goods to reduce loss while doing great help to charities around you.
          </p>
        </div>

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
          <h3 className="text-lg font-bold text-blue-800">Product Details</h3>
          <div>
            <label className="block text-sm font-medium text-blue-700 mb-2">Expiry Date (optional)</label>
            <input
              type="date"
              className="w-full p-3 bg-white border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.expiryDate}
              onChange={(e) => handleInputChange('expiryDate', e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-blue-700 mb-3">Item Condition</label>
            <div className="grid grid-cols-3 gap-2">
              {['New', 'Used', 'Imperfect'].map((condition) => (
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
          onClick={handlePublish}
          className="w-full bg-blue-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-blue-700 transition-colors"
        >
          PUBLISH LISTING
        </button>
      </div>
    </div>
  );
};

export default AddListing;