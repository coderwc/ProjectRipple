import React, { useState, useEffect } from 'react';
import { Edit3, Check, X, Plus, Home, User, Camera } from 'lucide-react';
import { updateUserProfile } from '../../../firebase/auth';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../../../firebase/config";

const ProfilePage = ({ currentPage, setCurrentPage, onLogout, user, onUserUpdate }) => {
  const [editingField, setEditingField] = useState(null);
  const [, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imageUploading, setImageUploading] = useState(false);
  
  // Initialize profile data from user prop - no more mock data
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    location: user?.location || '',
    socials: user?.socials || '',
    queries: user?.queries || '',
    tagline: user?.tagline || '',
    aboutUs: user?.aboutUs || '',
    focusAreas: user?.focusAreas || [],
    imageUrl: user?.imageUrl || ''
  });

  const [tempData, setTempData] = useState({...profileData});

  // Update profile data when user prop changes
  useEffect(() => {
    if (user) {
      const updatedProfile = {
        name: user.name || '',
        phone: user.phone || '',
        location: user.location || '',
        socials: user.socials || '',
        queries: user.queries || '',
        tagline: user.tagline || '',
        aboutUs: user.aboutUs || '',
        focusAreas: user.focusAreas || [],
        imageUrl: user.imageUrl || ''
      };
      setProfileData(updatedProfile);
      setTempData(updatedProfile);
    }
  }, [user]);

  const handleEdit = (field) => {
    setEditingField(field);
    setTempData({...profileData});
  };

  const handleSave = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      setError('');
      
      // Prepare data to save to Firebase - now includes all fields
      const updateData = {
        name: tempData.name,
        phone: tempData.phone,
        location: tempData.location,
        socials: tempData.socials,
        queries: tempData.queries,
        tagline: tempData.tagline,
        aboutUs: tempData.aboutUs,
        focusAreas: tempData.focusAreas
      };
      
      // Update user profile in Firebase
      const updatedUser = await updateUserProfile(user.id, updateData);
      
      // Update local state
      setProfileData({...tempData});
      setEditingField(null);
      
      // Notify parent component about user update
      console.log('🔄 ProfilePage: Notifying parent of user update:', updatedUser);
      if (onUserUpdate) {
        onUserUpdate(updatedUser);
      }
      
    } catch (error) {
      console.error('Profile save error:', error);
      setError('Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setTempData({...profileData});
    setEditingField(null);
  };

  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to log out?");
    if (confirmLogout) {
      onLogout();
    }
  };


  const handleImageUpload = async (e) => {
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

    setImageUploading(true);

    try {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      // Create unique filename for profile image
      const timestamp = Date.now();
      const fileExtension = file.name.split('.').pop();
      const fileName = `profile_${timestamp}.${fileExtension}`;
      
      // Create storage reference for profile images
      const storageRef = ref(storage, `profileImages/${user.id}/${fileName}`);
      
      console.log("📤 Uploading profile image to Firebase Storage...");
      console.log("📍 Path:", `profileImages/${user.id}/${fileName}`);

      // Upload file with metadata
      const metadata = {
        contentType: file.type,
        customMetadata: {
          uploadedBy: user.id,
          uploadedAt: new Date().toISOString(),
          originalName: file.name,
          type: 'profile-image'
        }
      };

      // Upload the file
      const uploadResult = await uploadBytes(storageRef, file, metadata);
      console.log("✅ Profile image upload successful:", uploadResult);

      // Get download URL
      const downloadURL = await getDownloadURL(storageRef);
      console.log("🔗 Profile image URL:", downloadURL);

      // Update profile with new image URL
      const updateData = { imageUrl: downloadURL };
      const updatedUser = await updateUserProfile(user.id, updateData);

      // Update local state
      setProfileData((prev) => ({ ...prev, imageUrl: downloadURL }));
      setTempData((prev) => ({ ...prev, imageUrl: downloadURL }));

      // Notify parent component about user update
      console.log('🔄 ProfilePage: Notifying parent of user update:', updatedUser);
      if (onUserUpdate) {
        onUserUpdate(updatedUser);
      }

      console.log("✅ Profile image updated successfully");

    } catch (error) {
      console.error("❌ Error uploading profile image:", error);
      
      let errorMessage = "Failed to upload profile image. ";
      
      if (error.code === 'storage/unauthorized') {
        errorMessage += "You don't have permission to upload. Please check your authentication.";
      } else if (error.code === 'storage/canceled') {
        errorMessage += "Upload was cancelled.";
      } else if (error.code === 'storage/unknown') {
        errorMessage += "An unknown error occurred. Please try again.";
      } else {
        errorMessage += "Please try again.";
      }
      
      setError(errorMessage);
    } finally {
      setImageUploading(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto min-h-screen bg-gradient-to-b from-blue-200 via-blue-100 to-white relative">
      {/* Status Bar */}
      <div className="flex justify-between items-center px-4 py-2 bg-white text-sm font-medium text-gray-700">
        <span>9:30</span>
        <div className="flex gap-1">
          <div className="w-4 h-2 bg-black rounded-sm"></div>
          <div className="w-4 h-2 bg-black rounded-sm"></div>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white px-4 py-6 border-b border-gray-100 shadow-md">
        <h1 className="text-2xl font-bold text-blue-800">Profile</h1>
        <p className="text-sm text-gray-500 mt-1">Manage account</p>
      </div>

      {/* Profile Image */}
      <div className="flex justify-center mb-4 relative">
        <label htmlFor="profileImageUpload" className="cursor-pointer group">
          <div className="relative">
            <div className={`w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center border-4 border-white -mt-12 overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105 ${imageUploading ? 'pointer-events-none' : ''}`}>
              {profileData.imageUrl ? (
                <img src={profileData.imageUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User className="w-12 h-12 text-blue-700" />
              )}
              {imageUploading && (
                <div className="absolute inset-0 bg-blue-100 bg-opacity-75 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                </div>
              )}
            </div>
            
            {/* Camera Icon Overlay */}
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Camera className="w-4 h-4 text-white" />
            </div>
          </div>
          
          <input
            id="profileImageUpload"
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            disabled={imageUploading}
          />
        </label>
      </div>

      {/* Upload Status */}
      {imageUploading && (
        <div className="text-center mb-4">
          <p className="text-sm text-blue-600">Uploading profile image...</p>
        </div>
      )}

      {/* Profile Content */}
      <div className="px-4 py-6 space-y-4 pb-24">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        {/* NGO Name & Tagline */}
        <div className="text-center mb-2">
          {editingField === 'name' ? (
            <div className="flex items-center justify-center gap-2">
              <input
                type="text"
                value={tempData.name}
                onChange={(e) => setTempData({ ...tempData, name: e.target.value })}
                className="text-xl font-bold text-center bg-white border border-blue-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter charity name"
              />
              <Check 
                onClick={handleSave} 
                className="w-5 h-5 text-green-600 cursor-pointer hover:text-green-700" 
              />
              <X 
                onClick={handleCancel} 
                className="w-5 h-5 text-red-600 cursor-pointer hover:text-red-700" 
              />
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <h2 className="text-xl font-bold text-gray-900">{profileData.name}</h2>
              <Edit3 
                onClick={() => handleEdit('name')} 
                className="w-4 h-4 text-gray-500 cursor-pointer hover:text-blue-600 transition-colors" 
              />
            </div>
          )}
          
          {editingField === 'tagline' ? (
            <div className="flex items-center justify-center gap-2 mt-2">
              <input
                type="text"
                value={tempData.tagline}
                onChange={(e) => setTempData({ ...tempData, tagline: e.target.value })}
                className="text-gray-600 text-center bg-white border border-blue-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter tagline"
              />
              <Check 
                onClick={handleSave} 
                className="w-5 h-5 text-green-600 cursor-pointer hover:text-green-700" 
              />
              <X 
                onClick={handleCancel} 
                className="w-5 h-5 text-red-600 cursor-pointer hover:text-red-700" 
              />
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 mt-1">
              <p className="text-gray-600">{profileData.tagline || 'Add a tagline'}</p>
              <Edit3 
                onClick={() => handleEdit('tagline')} 
                className="w-4 h-4 text-gray-500 cursor-pointer hover:text-blue-600 transition-colors" 
              />
            </div>
          )}
        </div>

        {/* Phone */}
        <div className="bg-white border border-blue-200 rounded-xl shadow p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-md font-semibold text-gray-900">Phone</h3>
            {editingField !== 'phone' && (
              <Edit3 
                onClick={() => handleEdit('phone')} 
                className="w-4 h-4 text-gray-400 cursor-pointer hover:text-blue-600 transition-colors" 
              />
            )}
          </div>
          {editingField === 'phone' ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={tempData.phone || ""}
                onChange={(e) => setTempData({ ...tempData, phone: e.target.value })}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter phone number"
              />
              <Check 
                onClick={handleSave} 
                className="w-5 h-5 text-green-600 cursor-pointer hover:text-green-700" 
              />
              <X 
                onClick={handleCancel} 
                className="w-5 h-5 text-red-600 cursor-pointer hover:text-red-700" 
              />
            </div>
          ) : (
            <p className="text-sm text-gray-500">{profileData.phone || "No phone specified"}</p>
          )}
        </div>

        {/* Location */}
        <div className="bg-white border border-blue-200 rounded-xl shadow p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-md font-semibold text-gray-900">Location</h3>
            {editingField !== 'location' && (
              <Edit3 
                onClick={() => handleEdit('location')} 
                className="w-4 h-4 text-gray-400 cursor-pointer hover:text-blue-600 transition-colors" 
              />
            )}
          </div>
          {editingField === 'location' ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={tempData.location || ""}
                onChange={(e) => setTempData({ ...tempData, location: e.target.value })}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your location"
              />
              <Check 
                onClick={handleSave} 
                className="w-5 h-5 text-green-600 cursor-pointer hover:text-green-700" 
              />
              <X 
                onClick={handleCancel} 
                className="w-5 h-5 text-red-600 cursor-pointer hover:text-red-700" 
              />
            </div>
          ) : (
            <p className="text-sm text-gray-500">{profileData.location || "No location specified"}</p>
          )}
        </div>

        {/* Website/Social Media */}
        <div className="bg-white border border-blue-200 rounded-xl shadow p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-md font-semibold text-gray-900">Website/Social Media</h3>
            {editingField !== 'socials' && (
              <Edit3 
                onClick={() => handleEdit('socials')} 
                className="w-4 h-4 text-gray-400 cursor-pointer hover:text-blue-600 transition-colors" 
              />
            )}
          </div>
          {editingField === 'socials' ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={tempData.socials || ""}
                onChange={(e) => setTempData({ ...tempData, socials: e.target.value })}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter website or social media links"
              />
              <Check 
                onClick={handleSave} 
                className="w-5 h-5 text-green-600 cursor-pointer hover:text-green-700" 
              />
              <X 
                onClick={handleCancel} 
                className="w-5 h-5 text-red-600 cursor-pointer hover:text-red-700" 
              />
            </div>
          ) : (
            <p className="text-sm text-gray-500">{profileData.socials || "No website specified"}</p>
          )}
        </div>

        {/* About Us Section */}
        <div className="bg-white border border-blue-200 rounded-xl shadow p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-md font-semibold text-gray-900">About Us</h3>
            {editingField !== 'aboutUs' && (
              <Edit3 
                onClick={() => handleEdit('aboutUs')} 
                className="w-4 h-4 text-gray-400 cursor-pointer hover:text-blue-600 transition-colors" 
              />
            )}
          </div>
          
          {editingField === 'aboutUs' ? (
            <div>
              <textarea
                value={tempData.aboutUs}
                onChange={(e) => setTempData({...tempData, aboutUs: e.target.value})}
                rows="6"
                className="w-full text-gray-600 leading-relaxed border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Tell people about your organization..."
              />
              <div className="flex gap-2 mt-3">
                <button 
                  onClick={handleSave}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Save Changes
                </button>
                <button 
                  onClick={handleCancel}
                  className="bg-gray-400 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-500 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500 leading-relaxed">
              {profileData.aboutUs || "No description provided"}
            </p>
          )}
        </div>


        {/* Logout Button */}
        <button 
          onClick={handleLogout} 
          className="w-full bg-red-500 text-white py-3 rounded-xl font-medium hover:bg-red-600 transition-colors shadow"
        >
          LOG OUT
        </button>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-sm bg-white border-t border-gray-200 shadow-inner">
        <div className="flex justify-around py-3">
          <button 
            onClick={() => setCurrentPage('dashboard')}
            className="flex flex-col items-center gap-1"
          >
            <Home className={`w-6 h-6 ${currentPage === 'dashboard' ? 'text-blue-700' : 'text-blue-300'}`} />
            <span className={`text-xs ${currentPage === 'dashboard' ? 'text-blue-700 font-medium' : 'text-blue-300'}`}>Home</span>
          </button>
          <button 
            onClick={() => setCurrentPage('selectPostType')}
            className="flex flex-col items-center gap-1"
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              currentPage === 'selectPostType' ? 'bg-blue-600' : 'bg-blue-300'
            }`}>
              <Plus className="w-5 h-5 text-white" />
            </div>
            <span className={`text-xs font-medium ${currentPage === 'selectPostType' ? 'text-blue-600' : 'text-blue-300'}`}>Post</span>
          </button>
          <button 
            onClick={() => setCurrentPage('profile')}
            className="flex flex-col items-center gap-1"
          >
            <User className={`w-6 h-6 ${currentPage === 'profile' ? 'text-blue-700' : 'text-blue-300'}`} />
            <span className={`text-xs ${currentPage === 'profile' ? 'text-blue-700 font-medium' : 'text-blue-300'}`}>Profile</span>
          </button>
        </div>
      </div>

      <div className="h-20" />
    </div>
  );
};

export default ProfilePage;