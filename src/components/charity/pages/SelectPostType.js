import React from 'react';
import { Heart, Camera , ArrowLeft} from 'lucide-react';

const SelectPostType = ({ setCurrentPage,onBack }) => {
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
      <div className="bg-white px-4 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <button onClick={onBack}>
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">New Post</h1>
        </div>
      </div>
      {/* Post Type Options */}
      <div className="px-4 py-8 flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">What would you like to share?</h2>
        <p className="text-gray-600 mb-12 text-center">Choose the type of post you want to create</p>
    
      <div className="w-full space-y-6">
        {/* Need Post Option */}
        <button 
          onClick={() => setCurrentPage('RequestHelp')}
          className="w-full bg-white border-2 border-blue-200 rounded-2xl p-8 flex flex-col items-center gap-4 hover:border-blue-400 hover:shadow-lg transition-all duration-200 active:scale-95"
        >
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
            <Heart className="w-10 h-10 text-blue-600" />
          </div>
          <div className="text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Request Help</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Share your story and request specific items or aid from the community
            </p>
          </div>
        </button>
        
        {/* Impact Post Option */}
          <button 
            onClick={() => setCurrentPage('ImpactPostDrafting')} //the impact post page (caption, images)
            className="w-full bg-white border-2 border-green-200 rounded-2xl p-8 flex flex-col items-center gap-4 hover:border-green-400 hover:shadow-lg transition-all duration-200 active:scale-95"
          >
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <Camera className="w-10 h-10 text-green-600" />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Share Impact</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Share photos and stories of positive impact in your community
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SelectPostType;