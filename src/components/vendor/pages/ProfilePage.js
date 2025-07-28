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

  if (loading || !profileData) return <div className="text-center py-10">Loading...</div>;

  return (
    <div className="max-w-sm mx-auto min-h-screen bg-gray-50">
      {/* Status Bar */}
      <div className="flex justify-between items-center px-4 py-2 bg-white text-sm font-medium">
        <span>9:30</span>
        <div className="flex gap-1">
          <div className="w-4 h-2 bg-black rounded-sm" />
          <div className="w-4 h-2 bg-black rounded-sm" />
        </div>
      </div>

      {/* Header */}
      <div className="bg-white px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
      </div>

      {/* Profile Image Upload */}
      <div className="flex justify-center mb-4 relative">
        <label htmlFor="profileImageUpload" className="cursor-pointer">
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center border-4 border-white -mt-12 overflow-hidden">
            {profileData.imageUrl ? (
              <img src={profileData.imageUrl} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <User className="w-12 h-12 text-gray-400" />
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
      <div className="px-4 pb-24">
        {/* Name */}
        <div className="text-center mb-2">
          {editingField === 'name' ? (
            <div className="flex justify-center items-center gap-2">
              <input
                type="text"
                value={tempData.name}
                onChange={(e) => setTempData({ ...tempData, name: e.target.value })}
                className="text-xl font-bold text-center bg-blue-50 border border-blue-200 rounded px-2 py-1"
              />
              <Check onClick={handleSave} className="w-4 h-4 text-green-600 cursor-pointer" />
              <X onClick={handleCancel} className="w-4 h-4 text-red-600 cursor-pointer" />
            </div>
          ) : (
            <div className="flex justify-center items-center gap-2">
              <h2 className="text-xl font-bold text-gray-900">{profileData.name}</h2>
              <Edit3 onClick={() => handleEdit('name')} className="w-4 h-4 text-gray-500 cursor-pointer" />
            </div>
          )}
        </div>

        {/* Email */}
        <p className="text-sm text-center text-gray-500 mb-4">{profileData.email}</p>

        {/* Location */}
        <div className="mb-4 text-center">
          {editingField === 'location' ? (
            <div className="flex justify-center items-center gap-2">
              <input
                type="text"
                value={tempData.location || ""}
                onChange={(e) => setTempData({ ...tempData, location: e.target.value })}
                className="text-sm text-center bg-blue-50 border border-blue-200 rounded px-2 py-1"
              />
              <Check onClick={handleSave} className="w-4 h-4 text-green-600 cursor-pointer" />
              <X onClick={handleCancel} className="w-4 h-4 text-red-600 cursor-pointer" />
            </div>
          ) : (
            <div className="flex justify-center items-center gap-2">
              <p className="text-sm text-gray-600">{profileData.location || "No address"}</p>
              <Edit3 onClick={() => handleEdit('location')} className="w-4 h-4 text-gray-500 cursor-pointer" />
            </div>
          )}
        </div>

        {/* Socials */}
        <div className="mb-6 text-center">
          {editingField === 'socials' ? (
            <div className="flex justify-center items-center gap-2">
              <input
                type="text"
                value={tempData.socials || ""}
                onChange={(e) => setTempData({ ...tempData, socials: e.target.value })}
                className="text-sm text-center bg-blue-50 border border-blue-200 rounded px-2 py-1"
              />
              <Check onClick={handleSave} className="w-4 h-4 text-green-600 cursor-pointer" />
              <X onClick={handleCancel} className="w-4 h-4 text-red-600 cursor-pointer" />
            </div>
          ) : (
            <div className="flex justify-center items-center gap-2">
              <a
                href={profileData.socials || "#"}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-blue-600 underline"
              >
                {profileData.socials || "No website"}
              </a>
              <Edit3 onClick={() => handleEdit('socials')} className="w-4 h-4 text-gray-500 cursor-pointer" />
            </div>
          )}
        </div>

        {/* Focus Areas */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">Our Focus</h3>
            {editingField !== 'focusAreas' && (
              <Edit3 onClick={() => handleEdit('focusAreas')} className="w-4 h-4 text-gray-500 cursor-pointer" />
            )}
          </div>
          {editingField === 'focusAreas' ? (
            <>
              <div className="flex flex-wrap gap-2 mb-2">
                {(tempData.focusAreas || []).map((area, index) => (
                  <div key={index} className="relative">
                    <input
                      value={area}
                      onChange={(e) => updateFocusArea(index, e.target.value)}
                      className="bg-blue-50 border border-blue-200 rounded-full px-3 py-1 text-xs"
                    />
                    <button
                      onClick={() => removeFocusArea(index)}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  onClick={addFocusArea}
                  className="bg-gray-200 text-gray-600 border border-dashed border-gray-400 rounded-full px-3 py-1 text-xs flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  Add
                </button>
              </div>
              <div className="flex gap-2">
                <button onClick={handleSave} className="bg-green-600 text-white px-3 py-1 rounded text-sm">Save</button>
                <button onClick={handleCancel} className="bg-gray-400 text-white px-3 py-1 rounded text-sm">Cancel</button>
              </div>
            </>
          ) : (
            <div className="flex flex-wrap gap-2">
              {(profileData.focusAreas || []).map((area, index) => (
                <span key={index} className="bg-gray-100 text-gray-700 rounded-full px-3 py-1 text-xs">{area}</span>
              ))}
            </div>
          )}
        </div>

        {/* Logout */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <button onClick={onLogout} className="w-full bg-red-500 text-white py-3 rounded-lg font-medium hover:bg-red-600 transition">LOG OUT</button>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-sm bg-white border-t border-gray-200">
        <div className="flex justify-around py-3">
          <button onClick={() => setCurrentPage('home')} className="flex flex-col items-center gap-1">
            <Home className="w-6 h-6 text-gray-400" />
            <span className="text-xs text-gray-400">Home</span>
          </button>
          <button onClick={() => setCurrentPage('addListing')} className="flex flex-col items-center gap-1">
            <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center">
              <Plus className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs text-gray-600">Add Listing</span>
          </button>
          <button onClick={() => setCurrentPage('profile')} className="flex flex-col items-center gap-1">
            <User className="w-6 h-6 text-gray-900" />
            <span className="text-xs text-gray-900 font-medium">Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;