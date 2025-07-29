import React, { useState, useEffect } from 'react';
import { Edit3, Check, X, Plus, Home, User } from 'lucide-react';
import { auth, db } from '../../../firebase/config';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../../../firebase/config";

const ProfilePage = ({ currentPage, setCurrentPage, onLogout }) => {
  const [editingField, setEditingField] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [tempData, setTempData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        const docRef = doc(db, "vendors", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setProfileData(data);
          setTempData(data);
        }
      } catch (err) {
        console.error("Error fetching vendor profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleEdit = (field) => {
    setEditingField(field);
    setTempData({ ...profileData });
  };

  const handleSave = async () => {
    try {
      const user = auth.currentUser;
      const docRef = doc(db, "vendors", user.uid);
      await updateDoc(docRef, { ...tempData });
      setProfileData({ ...tempData });
      setEditingField(null);
    } catch (error) {
      console.error("Failed to save:", error);
    }
  };

  const handleCancel = () => {
    setTempData({ ...profileData });
    setEditingField(null);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const user = auth.currentUser;
      const storageRef = ref(storage, `profileImages/${user.uid}`);
      await uploadBytes(storageRef, file);

      const downloadURL = await getDownloadURL(storageRef);
      const docRef = doc(db, "vendors", user.uid);
      await updateDoc(docRef, { imageUrl: downloadURL });

      setProfileData((prev) => ({ ...prev, imageUrl: downloadURL }));
      setTempData((prev) => ({ ...prev, imageUrl: downloadURL }));
    } catch (err) {
      console.error("Error uploading image:", err);
    }
  };

  const addFocusArea = () => {
    setTempData({
      ...tempData,
      focusAreas: [...(tempData.focusAreas || []), "New Focus Area"]
    });
  };

  const updateFocusArea = (index, value) => {
    const newFocus = [...tempData.focusAreas];
    newFocus[index] = value;
    setTempData({ ...tempData, focusAreas: newFocus });
  };

  const removeFocusArea = (index) => {
    const updated = tempData.focusAreas.filter((_, i) => i !== index);
    setTempData({ ...tempData, focusAreas: updated });
  };

  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to log out?");
    if (confirmLogout) {
      onLogout();
    }
  };

  if (loading || !profileData) return <div className="text-center py-10">Loading...</div>;

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
        <p className="text-sm text-gray-500 mt-1">Manage your account details</p>
      </div>

      {/* Profile Image */}
      <div className="flex justify-center mb-4 relative">
        <label htmlFor="profileImageUpload" className="cursor-pointer">
          <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center border-4 border-white -mt-12 overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
            {profileData.imageUrl ? (
              <img src={profileData.imageUrl} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <User className="w-12 h-12 text-blue-700" />
            )}
          </div>
          <input
            id="profileImageUpload"
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </label>
      </div>

      {/* Profile Content */}
      <div className="px-4 py-6 space-y-4 pb-24">
        {/* Name */}
        <div className="bg-white border border-blue-200 rounded-xl shadow p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-md font-semibold text-gray-900">Vendor Details</h3>
            {editingField !== 'name' && (
              <Edit3 
                onClick={() => handleEdit('name')} 
                className="w-4 h-4 text-gray-400 cursor-pointer hover:text-blue-600 transition-colors" 
              />
            )}
          </div>
          {editingField === 'name' ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={tempData.name}
                onChange={(e) => setTempData({ ...tempData, name: e.target.value })}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <div>
              <p className="text-gray-700 font-medium">{profileData.name}</p>
              <p className="text-sm text-gray-500">{profileData.email}</p>
            </div>
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

        {/* Website */}
        <div className="bg-white border border-blue-200 rounded-xl shadow p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-md font-semibold text-gray-900">Website</h3>
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
                placeholder="Enter website URL"
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
            <a
              href={profileData.socials || "#"}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
            >
              {profileData.socials || "No website specified"}
            </a>
          )}
        </div>

        {/* Focus Areas */}
        <div className="bg-white border border-blue-200 rounded-xl shadow p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-md font-semibold text-gray-900">Focus Areas</h3>
            {editingField !== 'focusAreas' && (
              <Edit3 
                onClick={() => handleEdit('focusAreas')} 
                className="w-4 h-4 text-gray-400 cursor-pointer hover:text-blue-600 transition-colors" 
              />
            )}
          </div>
          {editingField === 'focusAreas' ? (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {(tempData.focusAreas || []).map((area, index) => (
                  <div key={index} className="relative">
                    <input
                      value={area}
                      onChange={(e) => updateFocusArea(index, e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => removeFocusArea(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  onClick={addFocusArea}
                  className="border-2 border-dashed border-blue-300 text-blue-600 rounded-lg px-3 py-1 text-sm flex items-center gap-1 hover:border-blue-400 hover:text-blue-700 transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  Add Focus Area
                </button>
              </div>
              <div className="flex gap-2">
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
            <div className="flex flex-wrap gap-2">
              {(profileData.focusAreas || []).map((area, index) => (
                <span 
                  key={index} 
                  className="bg-blue-50 text-blue-700 border border-blue-200 rounded-lg px-3 py-1 text-sm"
                >
                  {area}
                </span>
              ))}
            </div>
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
          <button onClick={() => setCurrentPage('home')} className="flex flex-col items-center gap-1">
            <Home className="w-6 h-6 text-blue-300" />
            <span className="text-xs text-blue-300">Home</span>
          </button>
          <button onClick={() => setCurrentPage('addListing')} className="flex flex-col items-center gap-1">
            <div className="w-8 h-8 bg-blue-300 rounded-full flex items-center justify-center">
              <Plus className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs text-blue-300 font-medium">Add Listing</span>
          </button>
          <button onClick={() => setCurrentPage('profile')} className="flex flex-col items-center gap-1">
            <User className="w-6 h-6 text-blue-700" />
            <span className="text-xs text-blue-700 font-medium">Profile</span>
          </button>
        </div>
      </div>

      <div className="h-20" />
    </div>
  );
}

export default ProfilePage;