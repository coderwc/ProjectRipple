import React, { useState } from 'react';
import { ArrowLeft, Camera } from 'lucide-react';
import axios from 'axios';
import { auth } from '../../../firebase/config';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../../../firebase/config";

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
  
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      alert('Image size must be less than 5MB');
      return;
    }

    // Store the file and show preview
    setSelectedFile(file);
    const previewUrl = URL.createObjectURL(file);
    handleInputChange('image', previewUrl);

    console.log("📁 File selected:", file.name, "Size:", (file.size / 1024 / 1024).toFixed(2) + "MB");
  };

  const uploadImageToFirebase = async (file) => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      // Create unique filename
      const timestamp = Date.now();
      const fileExtension = file.name.split('.').pop();
      const fileName = `${timestamp}_${Math.random().toString(36).substr(2, 9)}.${fileExtension}`;
      
      // Create storage reference
      const storageRef = ref(storage, `listings/${currentUser.uid}/${fileName}`);
      
      console.log("📤 Uploading to Firebase Storage...");
      console.log("📍 Path:", `listings/${currentUser.uid}/${fileName}`);
      
      // Upload file with metadata
      const metadata = {
        contentType: file.type,
        customMetadata: {
          uploadedBy: currentUser.uid,
          uploadedAt: new Date().toISOString(),
          originalName: file.name
        }
      };
      
      // Upload the file
      const uploadResult = await uploadBytes(storageRef, file, metadata);
      console.log("✅ Upload successful:", uploadResult);
      
      // Get download URL
      const downloadURL = await getDownloadURL(storageRef);
      console.log("🔗 Download URL:", downloadURL);
      
      return downloadURL;
      
    } catch (error) {
      console.error("❌ Firebase upload error:", error);
      
      if (error.code === 'storage/unauthorized') {
        throw new Error('Permission denied. Please check Firebase Storage rules.');
      } else if (error.code === 'storage/canceled') {
        throw new Error('Upload canceled.');
      } else if (error.code === 'storage/unknown') {
        throw new Error('Unknown storage error occurred.');
      } else {
        throw new Error(`Upload failed: ${error.message}`);
      }
    }
  };

  const handlePublish = async () => {
    if (!formData.name || !formData.category || !formData.price) {
      alert('Please fill in Item Name, Category, and Price.');
      return;
    }

    setUploading(true);

    try {
      console.log("🧪 User object:", user);

      const currentUser = auth.currentUser;
      const token = await currentUser.getIdToken(); 
      console.log("🔑 Token:", token);

      let imageUrl = '';

      // Upload image to Firebase Storage if file is selected
      if (selectedFile) {
        try {
          console.log("📤 Starting image upload...");
          imageUrl = await uploadImageToFirebase(selectedFile);
          console.log("✅ Image uploaded successfully:", imageUrl);
        } catch (imageError) {
          console.error("❌ Image upload failed:", imageError);
          alert(`Image upload failed: ${imageError.message}`);
          setUploading(false);
          return; // Stop the process if image upload fails
        }
      }

      // Prepare listing data
      const listingData = {
        name: formData.name,
        category: formData.category,
        expiryDate: formData.expiryDate || null,
        condition: formData.condition,
        description: formData.description || '',
        quantity: parseInt(formData.quantity) || 1,
        price: parseFloat(formData.price) || 0,
        image: imageUrl, // Firebase Storage URL
        vendorId: user.id || user.uid,
        vendorName: user.name || user.displayName || '',
        status: 'active',
        createdAt: new Date().toISOString(),
      };

      console.log("📦 Listing data being sent:", listingData);

      // Send to your backend API
      const response = await axios.post(
        'http://localhost:5001/api/vendor/listings',
        listingData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      console.log("✅ Listing posted successfully:", response.data);
      alert('Listing published successfully!');
      onBack();

    } catch (error) {
      console.error('❌ Error publishing listing:', error);

      if (error.response) {
        console.error("📦 Server responded:", error.response.data);
        alert(`Failed to publish listing: ${error.response.data.message || 'Server error'}`);
      } else if (error.request) {
        console.error("📡 No response received from server:", error.request);
        alert('No response from server. Please check your connection.');
      } else {
        console.error("⚠️ Setup error:", error.message);
        alert(`Error: ${error.message}`);
      }
    } finally {
      setUploading(false);
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
              <label className={`block w-full h-full bg-blue-50 rounded-lg border-2 border-dashed border-blue-300 cursor-pointer hover:border-blue-400 transition-colors overflow-hidden relative ${uploading ? 'pointer-events-none' : ''}`}>
                {formData.image ? (
                  <img src={formData.image} alt="preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Camera className="w-6 h-6 text-blue-400" />
                  </div>
                )}
                {uploading && (
                  <div className="absolute inset-0 bg-blue-100 bg-opacity-75 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  </div>
                )}
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageUpload} 
                  className="hidden"
                  disabled={uploading}
                />
              </label>
              {selectedFile && (
                <p className="text-xs text-blue-600 mt-1 text-center">
                  {selectedFile.name}
                </p>
              )}
            </div>

            <div className="flex-1 space-y-3">
              <input
                className="w-full p-3 bg-white border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Item Name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                disabled={uploading}
              />
              <select
                className="w-full p-3 bg-white border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                disabled={uploading}
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
              disabled={uploading}
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
                  disabled={uploading}
                  className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
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
              disabled={uploading}
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
              disabled={uploading}
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
              disabled={uploading}
            />
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-sm bg-white border-t border-blue-200 px-4 py-4">
        <button
          onClick={handlePublish}
          disabled={uploading}
          className="w-full bg-blue-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? 'UPLOADING...' : 'PUBLISH LISTING'}
        </button>
      </div>
    </div>
  );
};

export default AddListing;