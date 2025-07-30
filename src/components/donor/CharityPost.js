import React, { useEffect, useState } from 'react';
import { ArrowLeft, Heart, Users, FileText, Camera, ChevronRight } from 'lucide-react';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase/config'; // adjust this path if needed

const CharityPost = ({ 
  onBack, 
  postId, 
  onCharitySelect, 
  onViewDonors, 
  onViewStory, 
  onViewImpactGallery 
}) => {
  const [postData, setPostData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const docRef = doc(db, 'charities', postId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setPostData(docSnap.data());
        } else {
          console.warn('❌ No post found with ID:', postId);
        }
      } catch (error) {
        console.error('❌ Error loading post:', error);
      } finally {
        setLoading(false);
      }
    };

    if (postId) {
      fetchPost();
    }
  }, [postId]);

  if (loading) {
    return <div className="text-center mt-8 text-sm text-gray-500">Loading post...</div>;
  }

  if (!postData) {
    return <div className="text-center mt-8 text-sm text-red-500">Post not found.</div>;
  }

  const {
    headline,
    charityName,
    donationsReceived,
    deadline,
    imageUrl,
    items = [],
    storyDescription
  } = postData;

  const remainingDays = (() => {
    if (!deadline) return 0;
    const today = new Date();
    const target = new Date(deadline);
    const diff = Math.ceil((target - today) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  })();

  const familiesSupported = 4; // Placeholder or dynamic in future

  const handleItemClick = (item) => {
    if (item.available && onCharitySelect) {
      const charityData = {
        id: postId,
        name: charityName,
        selectedItem: item.type
      };
      onCharitySelect(charityData);
    }
  };

  return (
    <div className="max-w-sm mx-auto p-4 bg-gray-50 min-h-screen relative">
      {/* Header */}
      <div className="bg-white px-4 py-4 border-b border-gray-200 -mx-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-1 hover:bg-gray-100 rounded">
              <ArrowLeft className="w-6 h-6 text-gray-700" />
            </button>
            <span className="text-lg font-medium text-gray-900">Charity Post</span>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Main Post Card */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          {imageUrl ? (
            <img src={imageUrl} alt="Charity" className="w-full h-32 object-cover rounded mb-4" />
          ) : (
            <div className="w-full h-32 bg-gray-300 rounded mb-4" />
          )}

          {/* Organization info */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-900">{charityName}</span>
              <div className="w-2 h-2 bg-black rounded-full" />
            </div>
            <button onClick={() => setIsLiked(!isLiked)} className="p-1">
              <Heart
                className={`w-5 h-5 ${isLiked ? 'text-red-500 fill-red-500' : 'text-gray-400'} hover:text-red-500 cursor-pointer`}
              />
            </button>
          </div>

          <h2 className="font-semibold text-gray-900 mb-1">{headline}</h2>
          <p className="text-sm text-blue-600 mb-3">{donationsReceived} Donated</p>

          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-blue-600">Kindness Cap: {donationsReceived}%</span>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-blue-500 rounded" />
                <span className="text-gray-500 text-xs">{remainingDays} More Days</span>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all"
                style={{ width: `${Math.min(donationsReceived || 0, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={() => onViewDonors(postId)}
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

        {/* Charity Info Section */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h3 className="font-medium text-gray-900 mb-3">Charity Information:</h3>
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-300 rounded-full" />
              <div>
                <p className="font-medium text-gray-900 text-sm">{charityName}</p>
                <div className="w-2 h-2 bg-black rounded-full mt-1" />
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-xs text-gray-500 mt-3 leading-4">{storyDescription}</p>
        </div>

        {/* Items Needed */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-900">We currently need</h3>
            <span className="text-xs text-blue-600">See All</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {items.map((item, index) => (
              <div key={index} className="relative h-32">
                <div
                  className={`p-4 rounded-lg border h-full flex flex-col justify-between transition-all ${
                    item.available ? 'bg-blue-50 border-blue-200 hover:bg-blue-100 cursor-pointer' : 'bg-gray-50 border-gray-200'
                  }`}
                  onClick={() => handleItemClick(item)}
                >
                  <div className="flex flex-col">
                    <span className={`text-sm font-medium mb-1 ${item.available ? 'text-gray-900' : 'text-gray-500'}`}>
                      {item.type}
                    </span>
                    <span className={`text-xs mb-3 ${item.available ? 'text-blue-600' : 'text-gray-400'}`}>
                      {item.available ? 'Available for donors' : 'Not Available'}
                    </span>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-gray-900 mb-2">{item.current}/{item.target}</div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full transition-all ${item.available ? 'bg-blue-500' : 'bg-gray-400'}`}
                        style={{ width: `${(item.current / item.target) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Support Stats */}
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