import React, { useState } from 'react';
import { ArrowLeft, Heart, Users, FileText, Camera, ChevronRight } from 'lucide-react';

const CharityPost = ({ 
  onBack, 
  postId = 1, 
  onCharitySelect, 
  onViewDonors, 
  onViewStory, 
  onViewImpactGallery // ✅ Add this here
}) => {
  const [isLiked, setIsLiked] = useState(false);
  // Mock data - in real app this would be fetched based on postId
  const postData = {
    headline: "Emergency Earthquake Relief Fund",
    organization: "Disaster Relief NGO",
    kindnessCap: "78% Full",
    remainingDays: 40,
    progress: 78,
    image: "/api/placeholder/400/200"
  };

  const donationItems = [
    { id: 1, type: "Water Bottles", current: 28, target: 40, available: true },
    { id: 2, type: "Blankets", current: 15, target: 20, available: true },
    { id: 3, type: "Rice Bags", current: 28, target: 40, available: true },
    { id: 4, type: "Soap Bars", current: 28, target: 40, available: false }
  ];

  const handleItemClick = (item) => {
    if (item.available && item.type === "Water Bottles" && onCharitySelect) {
      // Create mock charity data for the shopping interface
      const charityData = {
        id: postData.id || postId,
        name: postData.organization || "Charity Name",
        selectedItem: item.type
      };
      onCharitySelect(charityData);
    }
  };

  const familiesSupported = 4;

  return (
    <div className="max-w-sm mx-auto p-4 bg-gray-50 min-h-screen relative">
      {/* Status Bar */}
      <div className="bg-white px-4 py-2 flex justify-between items-center text-sm text-gray-600 -mx-4">
        <span>9:30</span>
        <div className="flex items-center gap-1">
          <div className="w-4 h-2 bg-black rounded-sm"></div>
          <div className="w-1 h-1 bg-black rounded-full"></div>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white px-4 py-4 border-b border-gray-200 -mx-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-1 hover:bg-gray-100 rounded">
              <ArrowLeft className="w-6 h-6 text-gray-700" />
            </button>
            <span className="text-lg font-medium text-gray-900">Charity post</span>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Main Post Card */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          {/* Image placeholder */}
          <div className="w-full h-32 bg-gray-300 rounded mb-4"></div>
          
          {/* Organization info */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-900">Charity Name</span>
              <div className="w-2 h-2 bg-black rounded-full"></div>
            </div>
            <button 
              onClick={() => setIsLiked(!isLiked)}
              className="p-1"
            >
              <Heart 
                className={`w-5 h-5 ${isLiked ? 'text-red-500 fill-red-500' : 'text-gray-400'} hover:text-red-500 cursor-pointer`} 
              />
            </button>
          </div>

          <h2 className="font-semibold text-gray-900 mb-1">Headline Here</h2>
          <p className="text-sm text-blue-600 mb-3">Donated</p>

          {/* Progress info */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-blue-600">Kindness Cap: {postData.kindnessCap}</span>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span className="text-gray-500 text-xs">xxx More Days</span>
              </div>
            </div>
            
            {/* Progress bar */}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all" 
                style={{ width: `${postData.progress}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button 
          onClick={() => onViewDonors(postId)} // ✅ onClick goes here
    className="flex-1 flex flex-col items-center gap-2 bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
  >
    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
      <Users className="w-5 h-5 text-blue-600" />
    </div>
    <span className="text-sm font-medium text-gray-900">Donors</span>
  </button>
          
          <button 
  onClick={() => onViewStory(postId)} 
  className="flex-1 flex flex-col items-center gap-2 bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
>
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-gray-900">Story</span>
          </button>

          {/* ✅ Correct Impact Gallery Button */}
  <button 
    onClick={() => onViewImpactGallery(postId)} 
    className="flex-1 flex flex-col items-center gap-2 bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
  >
    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
      <Camera className="w-5 h-5 text-blue-600" />
    </div>
    <span className="text-sm font-medium text-gray-900">Impact Gallery</span>
  </button>
</div>

        {/* Charity Information */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h3 className="font-medium text-gray-900 mb-3">Charity Information:</h3>
          
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
              <div>
                <p className="font-medium text-gray-900 text-sm">Charity Name</p>
                <div className="w-2 h-2 bg-black rounded-full mt-1"></div>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
          
          <p className="text-xs text-gray-500 mt-3 leading-4">
            Lorem Ipsum Dolor sit Amet Consectetur Lectus elitta, 
            Sed do eiusmod Tempor Incididunt ut labore et dolore magna 
            aliqua, lorem ipsum
          </p>
        </div>

        {/* Current Need Section */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-900">We currently need</h3>
            <span className="text-xs text-blue-600">See All</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {donationItems.map((item) => (
              <div key={item.id} className="relative h-32">
                <div 
                  className={`p-4 rounded-lg border h-full flex flex-col justify-between transition-all ${
                    item.available ? 'bg-blue-50 border-blue-200 hover:bg-blue-100 cursor-pointer' : 'bg-gray-50 border-gray-200'
                  } ${item.type === "Water Bottles" && item.available ? 'hover:shadow-md' : ''}`}
                  onClick={() => handleItemClick(item)}
                >
                  <div className="flex flex-col">
                    <span className={`text-sm font-medium mb-1 ${item.available ? 'text-gray-900' : 'text-gray-500'}`}>
                      {item.type}
                    </span>
                    {item.available && (
                      <span className="text-xs text-blue-600 mb-3">
                        {item.type === "Water Bottles" ? "Click to shop" : "Available for donors"}
                      </span>
                    )}
                    {!item.available && (
                      <span className="text-xs text-gray-400 mb-3">Not Available</span>
                    )}
                  </div>
                  
                  <div className="flex flex-col">
                    <div className="text-lg font-bold text-gray-900 mb-2">
                      {item.current}/{item.target}
                    </div>
                    
                    {/* Progress bar */}
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div 
                        className={`h-1.5 rounded-full transition-all ${item.available ? 'bg-blue-500' : 'bg-gray-400'}`}
                        style={{ width: `${(item.current / item.target) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Support Statistics */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-4 text-white">
          <p className="text-sm opacity-90 mb-2">So Far, We're Supporting</p>
          <div className="flex items-center gap-4">
            <div className="bg-white bg-opacity-20 rounded-lg p-3 min-w-0">
              <div className="text-2xl font-bold">{familiesSupported}</div>
            </div>
            <div>
              <div className="text-lg font-semibold">FAMILIES</div>
              <div className="text-sm opacity-90">In Need</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharityPost;