import React from 'react';
import { ArrowLeft } from 'lucide-react';

const Story = ({ onBack, postId, postData }) => {
  // Use the actual post data passed from CharityPost
  // Try multiple possible field names for the description
  const storyContent = postData?.description || 
                      postData?.storyDescription || 
                      postData?.about || 
                      postData?.story || 
                      postData?.details || 
                      `Lorem ipsum dolor sit amet consectetur. Lectus viverra sed aliquam quis enim leo. 
                       Turpis nec facilisis placerat dolor ac donec. Odio semper quis rutrum quis lacus odio 
                       vivamus ultricies. Ultrices ultricies platea feugiat ac velit nulla. 
                       Proin lectus commodo id nullam venenatis.`;
  
  const charityName = postData?.charityName || 'Charity Name';
  const headline = postData?.headline || 'Headline Story';
  const imageUrl = postData?.imageUrl;

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
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-1 hover:bg-gray-100 rounded">
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <span className="text-lg font-medium text-gray-900">About This Drive</span>
        </div>
      </div>

      {/* Story Content */}
      <div className="space-y-4">
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-1">{headline}</h2>

          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
            <div>
              <p className="text-sm font-semibold text-gray-800">{charityName}</p>
              <p className="text-xs text-gray-500">Verified Identification</p>
            </div>
          </div>

          <p className="text-sm text-gray-700 leading-6">{storyContent}</p>

          {/* Drive image if available */}
          {imageUrl && (
            <div className="my-4">
              <img 
                src={imageUrl} 
                alt="Drive activity" 
                className="rounded-lg mb-3 w-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          )}

          {/* CTA Button */}
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg text-sm font-semibold">
            DONATE NOW
          </button>
        </div>
      </div>
    </div>
  );
};

export default Story;

// Temporary commit to trigger PR