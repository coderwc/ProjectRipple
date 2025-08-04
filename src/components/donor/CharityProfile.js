import React, { useState, useEffect } from 'react'; 
import { ArrowLeft, MapPin, Globe, Phone, Heart, Loader } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';

const CharityProfile = ({ charityId, onBack }) => {
  const [charityData, setCharityData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCharityProfile = async () => {
      if (!charityId) {
        setError("No charity ID provided");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log('🔍 Fetching charity profile for ID:', charityId);
        
        // Fetch from publicCharities collection (synced from ProfilePage.js)
        const publicCharityDoc = await getDoc(doc(db, 'publicCharities', charityId));
        
        if (publicCharityDoc.exists()) {
          const charityData = publicCharityDoc.data();
          console.log('📥 Public charity profile data:', charityData);
          setCharityData(charityData);
          setError(null);
        } else {
          console.log('❌ No public charity profile found for ID:', charityId);
          setError("Charity profile not found. The charity may need to update their profile first.");
        }
      } catch (err) {
        console.error("Error fetching charity profile:", err);
        setError("Failed to load charity profile");
      } finally {
        setLoading(false);
      }
    };

    fetchCharityProfile();
  }, [charityId]);

  if (loading) {
    return (
      <div className="max-w-sm mx-auto bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Loading charity profile...</p>
        </div>
      </div>
    );
  }

  if (error || !charityData) {
    return (
      <div className="max-w-sm mx-auto bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="bg-white px-4 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-1 hover:bg-gray-100 rounded">
              <ArrowLeft className="w-6 h-6 text-gray-700" />
            </button>
            <span className="text-lg font-medium text-gray-900">Charity Profile</span>
          </div>
        </div>
        
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={onBack}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

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
      <div className="bg-white px-4 py-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-1 hover:bg-gray-100 rounded">
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <span className="text-lg font-medium text-gray-900">Charity Profile</span>
        </div>
      </div>

      {/* Profile Content */}
      <div className="px-4 pb-6">
        <div className="bg-white rounded-3xl p-6 relative mt-4">
          {/* Profile Picture */}
          <div className="flex justify-center mb-4">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center border-4 border-white -mt-12 overflow-hidden">
              {charityData.imageUrl ? (
                <img 
                  src={charityData.imageUrl} 
                  alt={charityData.name || 'Charity'} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <Heart className="w-12 h-12 text-gray-400" />
              )}
            </div>
          </div>



          {/* Charity Name & Tagline */}
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-1">{charityData.name || 'Charity Name'}</h2>
            {charityData.tagline ? (
              <p className="text-gray-600">{charityData.tagline}</p>
            ) : (
              <p className="text-gray-400 italic">No tagline provided</p>
            )}
          </div>

          {/* Contact Information */}
          <div className="mb-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Contact Information</h3>
            
            {/* Location */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <MapPin className="w-5 h-5 text-gray-500" />
              <span className={charityData.location ? "text-gray-700" : "text-gray-400 italic"}>
                {charityData.location || 'No location provided'}
              </span>
            </div>

            {/* Phone */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Phone className="w-5 h-5 text-gray-500" />
              <span className={charityData.phone ? "text-gray-700" : "text-gray-400 italic"}>
                {charityData.phone || 'No phone number provided'}
              </span>
            </div>

            {/* Website */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Globe className="w-5 h-5 text-gray-500" />
              <span className={charityData.socials ? "text-blue-600" : "text-gray-400 italic"}>
                {charityData.socials || 'No website provided'}
              </span>
            </div>
          </div>

          {/* Contact/Queries Section - only show if queries has content */}
          {charityData.queries && (
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-3">How to Contact Us</h3>
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <Phone className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                <p className="text-gray-700 text-sm leading-relaxed">
                  {charityData.queries}
                </p>
              </div>
            </div>
          )}

          {/* About Us Section */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-3">About Us</h3>
            {charityData.aboutUs ? (
              <p className="text-gray-600 leading-relaxed text-sm">
                {charityData.aboutUs}
              </p>
            ) : (
              <p className="text-gray-400 italic text-sm">
                No description provided yet.
              </p>
            )}
          </div>

          {/* Our Focus Section */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-3">Our Focus</h3>
            <div className="flex flex-wrap gap-2">
              {charityData.focusAreas && charityData.focusAreas.length > 0 ? (
                charityData.focusAreas.map((area, index) => (
                  <span
                    key={index}
                    className="bg-blue-100 text-blue-700 rounded-full px-3 py-1 text-xs font-medium"
                  >
                    {area}
                  </span>
                ))
              ) : (
                <span className="text-gray-400 italic text-sm">No focus areas specified</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharityProfile;
