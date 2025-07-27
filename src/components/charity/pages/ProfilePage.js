import React, { useState, useEffect } from 'react';
import { Edit3, Check, X, Plus, Home, User } from 'lucide-react';
import { updateUserProfile } from '../../../firebase/auth';

const ProfilePage = ({ currentPage, setCurrentPage, onLogout, user, onUserUpdate }) => {
  const [editingField, setEditingField] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Initialize profile data from user prop - no more mock data
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    location: user?.location || '',
    socials: user?.socials || '',
    queries: user?.queries || '',
    tagline: user?.tagline || '',
    aboutUs: user?.aboutUs || '',
    focusAreas: user?.focusAreas || []
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
        focusAreas: user.focusAreas || []
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

  const addFocusArea = () => {
    setTempData({
      ...tempData,
      focusAreas: [...tempData.focusAreas, "New Focus Area"]
    });
  };

  const updateFocusArea = (index, value) => {
    const newFocusAreas = [...tempData.focusAreas];
    newFocusAreas[index] = value;
    setTempData({
      ...tempData,
      focusAreas: newFocusAreas
    });
  };

  const removeFocusArea = (index) => {
    const newFocusAreas = tempData.focusAreas.filter((_, i) => i !== index);
    setTempData({
      ...tempData,
      focusAreas: newFocusAreas
    });
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
      <div className="relative bg-white px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-900">NGO</h1>
      </div>

      {/* Profile Content */}
      <div className="px-4 pb-24">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}
        
        <div className="bg-white rounded-3xl p-6 relative">
          {/* Profile Picture */}
          <div className="flex justify-center mb-4">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center border-4 border-white -mt-12">
              <User className="w-12 h-12 text-gray-400" />
            </div>
          </div>

          {/* NGO Name & Tagline */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-2 mb-1">
              {editingField === 'name' ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={tempData.name}
                    onChange={(e) => setTempData({...tempData, name: e.target.value})}
                    className="text-xl font-bold text-center bg-blue-50 border border-blue-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button onClick={handleSave} className="text-green-600">
                    <Check className="w-4 h-4" />
                  </button>
                  <button onClick={handleCancel} className="text-red-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-gray-900">{profileData.name}</h2>
                  <button onClick={() => handleEdit('name')} className="text-gray-500">
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
            
            {editingField === 'tagline' ? (
              <div className="flex items-center justify-center gap-2">
                <input
                  type="text"
                  value={tempData.tagline}
                  onChange={(e) => setTempData({...tempData, tagline: e.target.value})}
                  className="text-gray-600 text-center bg-blue-50 border border-blue-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button onClick={handleSave} className="text-green-600">
                  <Check className="w-4 h-4" />
                </button>
                <button onClick={handleCancel} className="text-red-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <p className="text-gray-600">{profileData.tagline}</p>
                <button onClick={() => handleEdit('tagline')} className="text-gray-500">
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Contact Information */}
          <div className="mb-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Contact Information</h3>
            
            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              {editingField === 'phone' ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={tempData.phone}
                    onChange={(e) => setTempData({...tempData, phone: e.target.value})}
                    placeholder="Enter phone number"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  <button onClick={handleSave} disabled={loading} className="text-green-600">
                    <Check className="w-4 h-4" />
                  </button>
                  <button onClick={handleCancel} className="text-red-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                  <span className="text-gray-600 text-sm flex-1">
                    {profileData.phone || 'Not provided'}
                  </span>
                  <button onClick={() => handleEdit('phone')} className="text-gray-500">
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              {editingField === 'location' ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={tempData.location}
                    onChange={(e) => setTempData({...tempData, location: e.target.value})}
                    placeholder="Enter location"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  <button onClick={handleSave} disabled={loading} className="text-green-600">
                    <Check className="w-4 h-4" />
                  </button>
                  <button onClick={handleCancel} className="text-red-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                  <span className="text-gray-600 text-sm flex-1">
                    {profileData.location || 'Not provided'}
                  </span>
                  <button onClick={() => handleEdit('location')} className="text-gray-500">
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Website/Social Media */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Website/Social Media</label>
              {editingField === 'socials' ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={tempData.socials}
                    onChange={(e) => setTempData({...tempData, socials: e.target.value})}
                    placeholder="Enter website or social media links"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  <button onClick={handleSave} disabled={loading} className="text-green-600">
                    <Check className="w-4 h-4" />
                  </button>
                  <button onClick={handleCancel} className="text-red-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                  <span className="text-gray-600 text-sm flex-1">
                    {profileData.socials || 'Not provided'}
                  </span>
                  <button onClick={() => handleEdit('socials')} className="text-gray-500">
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* About Us Section */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-lg font-bold text-gray-900">About Us</h3>
              {editingField !== 'aboutUs' && (
                <button onClick={() => handleEdit('aboutUs')} className="text-gray-500">
                  <Edit3 className="w-4 h-4" />
                </button>
              )}
            </div>
            
            {editingField === 'aboutUs' ? (
              <div>
                <textarea
                  value={tempData.aboutUs}
                  onChange={(e) => setTempData({...tempData, aboutUs: e.target.value})}
                  rows="6"
                  className="w-full text-gray-600 leading-relaxed bg-blue-50 border border-blue-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
                <div className="flex gap-2 mt-2">
                  <button 
                    onClick={handleSave}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
                  >
                    Save
                  </button>
                  <button 
                    onClick={handleCancel}
                    className="bg-gray-400 text-white px-4 py-2 rounded-lg text-sm font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-gray-600 leading-relaxed text-sm">
                {profileData.aboutUs}
              </p>
            )}
          </div>

          {/* Our Focus Section */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-lg font-bold text-gray-900">Our Focus</h3>
              {editingField !== 'focusAreas' && (
                <button onClick={() => handleEdit('focusAreas')} className="text-gray-500">
                  <Edit3 className="w-4 h-4" />
                </button>
              )}
            </div>
            
            {editingField === 'focusAreas' ? (
              <div>
                <div className="flex flex-wrap gap-2 mb-3">
                  {tempData.focusAreas.map((area, index) => (
                    <div key={index} className="relative">
                      <input
                        type="text"
                        value={area}
                        onChange={(e) => updateFocusArea(index, e.target.value)}
                        className="bg-blue-50 border border-blue-200 rounded-full px-3 py-1 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={() => removeFocusArea(index)}
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={addFocusArea}
                    className="bg-gray-200 border-2 border-dashed border-gray-300 rounded-full px-3 py-1 text-xs font-medium flex items-center gap-1 hover:bg-gray-300"
                  >
                    <Plus className="w-3 h-3" />
                    Add
                  </button>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={handleSave}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
                  >
                    Save
                  </button>
                  <button 
                    onClick={handleCancel}
                    className="bg-gray-400 text-white px-4 py-2 rounded-lg text-sm font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {profileData.focusAreas.map((area, index) => (
                  <span
                    key={index}
                    className="bg-gray-100 text-gray-700 rounded-full px-3 py-1 text-xs font-medium"
                  >
                    {area}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* New Logout Component */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <button onClick={onLogout} className="w-full bg-red-500 text-white py-3 rounded-lg font-medium hover:bg-red-600 transition">LOG OUT</button>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-sm bg-white border-t border-gray-200">
        <div className="flex justify-around py-3">
          <button 
            onClick={() => setCurrentPage('dashboard')}
            className="flex flex-col items-center gap-1"
          >
            <Home className={`w-6 h-6 ${currentPage === 'dashboard' ? 'text-gray-900' : 'text-gray-400'}`} />
            <span className={`text-xs ${currentPage === 'dashboard' ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>Home</span>
          </button>
          <button 
            onClick={() => setCurrentPage('createPost')}
            className="flex flex-col items-center gap-1"
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              currentPage === 'createPost' ? 'bg-blue-600' : 'bg-gray-800'
            }`}>
              <Plus className="w-5 h-5 text-white" />
            </div>
            <span className={`text-xs font-medium ${currentPage === 'createPost' ? 'text-blue-600' : 'text-gray-600'}`}>Post</span>
          </button>
          <button 
            onClick={() => setCurrentPage('profile')}
            className="flex flex-col items-center gap-1"
          >
            <User className={`w-6 h-6 ${currentPage === 'profile' ? 'text-gray-900' : 'text-gray-400'}`} />
            <span className={`text-xs ${currentPage === 'profile' ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;