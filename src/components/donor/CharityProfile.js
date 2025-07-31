import React, { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Globe, Phone, Heart, Loader } from 'lucide-react';
import { getCharityProfile } from '../../api/posts';

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
        const response = await getCharityProfile(charityId);
        
        if (response.success) {
          setCharityData(response.charity);
          setError(null);
        } else {
          setError(response.error || "Failed to load charity profile");
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
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center border-4 border-white -mt-12">
              <Heart className="w-12 h-12 text-gray-400" />
            </div>
          </div>

          {/* Charity Name & Tagline */}
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-1">{charityData.name}</h2>
            <p className="text-gray-600">{charityData.tagline}</p>
          </div>

          {/* Contact Information */}
          <div className="mb-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Contact Information</h3>
            
            {/* Location */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <MapPin className="w-5 h-5 text-gray-500" />
              <span className="text-gray-700">{charityData.location}</span>
            </div>

            {/* Phone */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Phone className="w-5 h-5 text-gray-500" />
              <span className="text-gray-700">{charityData.phone}</span>
            </div>

            {/* Website */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Globe className="w-5 h-5 text-gray-500" />
              <span className="text-blue-600">{charityData.website}</span>
            </div>
          </div>

          {/* About Us Section */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-3">About Us</h3>
            <p className="text-gray-600 leading-relaxed text-sm">
              {charityData.aboutUs}
            </p>
          </div>

          {/* Our Focus Section */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-3">Our Focus</h3>
            <div className="flex flex-wrap gap-2">
              {charityData.focusAreas.map((area, index) => (
                <span
                  key={index}
                  className="bg-blue-100 text-blue-700 rounded-full px-3 py-1 text-xs font-medium"
                >
                  {area}
                </span>
              ))}
            </div>
          </div>

          {/* Impact Statistics */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-4 text-white">
            <h3 className="text-lg font-bold mb-3">Our Impact</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{charityData.impactStats.familiesHelped.toLocaleString()}</div>
                <div className="text-xs opacity-90">Families Helped</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{charityData.impactStats.communitiesReached}</div>
                <div className="text-xs opacity-90">Communities Reached</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{charityData.impactStats.yearsActive}</div>
                <div className="text-xs opacity-90">Years Active</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharityProfile;