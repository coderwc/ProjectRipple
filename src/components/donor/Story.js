import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase/config';

const Story = ({ onBack, postId, postData }) => {
  const [charityImageUrl, setCharityImageUrl] = useState(null);

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

  useEffect(() => {
    const fetchCharityProfileImage = async () => {
      // Get charity ID from postData
      const publicCharityId = postData?.charityId || postData?.authorId;
      
      if (publicCharityId) {
        try {
          const publicProfileRef = doc(db, 'publicCharities', publicCharityId);
          const publicProfileSnap = await getDoc(publicProfileRef);

          if (publicProfileSnap.exists()) {
            const publicProfileData = publicProfileSnap.data();
            console.log('📥 Story - Charity profile data for image:', publicProfileData);
            setCharityImageUrl(publicProfileData.imageUrl || null);
          } else {
            console.log('⚠️ Story - No public charity profile found for ID:', publicCharityId);
          }
        } catch (error) {
          console.log('⚠️ Story - Error fetching charity profile image:', error);
        }
      }
    };

    if (postData) {
      fetchCharityProfileImage();
    }
  }, [postData]);

  return (
    <div className="max-w-sm mx-auto p-4 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen relative">
      {/* Status Bar */}
      <div className="bg-white px-4 py-2 flex justify-between items-center text-sm text-gray-600 -mx-4">
        <span>9:30</span>
        <div className="flex items-center gap-1">
          <div className="w-4 h-2 bg-black rounded-sm"></div>
          <div className="w-1 h-1 bg-black rounded-full"></div>
        </div>
      </div>

      {/* Header - Clean vendor-style header */}
      <div className="bg-white px-4 py-6 border-b border-gray-100 shadow-md -mx-4 mb-4">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-1 hover:bg-gray-100 rounded">
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <span className="text-xl font-bold text-gray-900">About This Drive</span>
        </div>
      </div>

      {/* Story Content */}
      <div className="space-y-4">
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-1">{headline}</h2>

          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
              {charityImageUrl ? (
                <img
                  src={charityImageUrl}
                  alt="Charity Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-4 h-4 bg-gray-400 rounded-full" />
              )}
            </div>
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

        </div>
      </div>
    </div>
  );
};

export default Story;

// Temporary commit to trigger PR