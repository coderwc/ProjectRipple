import React, { useEffect, useState } from 'react';
import { ArrowLeft, Heart, Users, FileText, Camera, ChevronRight } from 'lucide-react';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { getItemDonationTotals } from '../../firebase/posts';

// Helper function to normalize item names for matching (same as in posts.js)
const normalizeItemName = (itemName) => {
  if (!itemName) return '';
  
  // Remove vendor names and common variations
  let normalized = itemName
    .toLowerCase()
    .trim()
    // Remove vendor names
    .replace(/\s*-\s*(gomgom|premium mart|vendor\d+).*$/i, '')
    // Remove brand prefixes 
    .replace(/^(gomgom|premium mart)\s*/i, '')
    // Normalize plural/singular
    .replace(/s$/, '') // Remove trailing 's'
    .replace(/ies$/, 'y') // flies -> fly
    .replace(/es$/, '') // boxes -> box
    // Remove extra spaces
    .replace(/\s+/g, ' ')
    .trim();
    
  return normalized;
};

const CharityPost = ({
  onBack,
  postId,
  onCharitySelect,
  onViewDonors,
  onViewStory,
  onViewImpactGallery,
  onViewCharityProfile
}) => {
  const [postData, setPostData] = useState(null);
  const [transformedItems, setTransformedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        console.log('🔍 Fetching post with ID:', postId);
        const docRef = doc(db, 'charities', postId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const rawData = docSnap.data();
          console.log('✅ Post data retrieved:', rawData);
          setPostData(rawData);

          // Fetch donation totals from separate collection
          const donationTotals = await getItemDonationTotals(postId);
          console.log('🎁 Donation totals retrieved:', donationTotals);

          const formatted = rawData.items?.map((item) => {
            // Normalize charity post item name to match donation records
            const normalizedCharityItemName = normalizeItemName(item.name);
            const donatedQuantity = donationTotals[normalizedCharityItemName] || 0;
            
            console.log(`🔍 Matching charity item "${item.name}" (normalized: "${normalizedCharityItemName}") with donations: ${donatedQuantity}`);
            
            return {
              type: item.name || 'Unknown',
              current: donatedQuantity, // Use donation totals from separate collection
              target: item.quantity || 0,
              available: item.quantity > 0 && donatedQuantity < item.quantity
            };
          }) || [];

          setTransformedItems(formatted);
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
    return (
      <div className="text-center mt-8 p-4">
        <div className="text-sm text-red-500 mb-2">Post not found.</div>
        <div className="text-xs text-gray-500">PostID: {postId}</div>
        <div className="text-xs text-gray-500">Check browser console for details</div>
      </div>
    );
  }

  const {
    headline,
    charityName,
    charityId,
    authorId,
    donationsReceived,
    deadline,
    imageUrl,
    storyDescription
  } = postData;

  const remainingDays = (() => {
    if (!deadline) return 0;
    const today = new Date();
    const target = new Date(deadline);
    const diff = Math.ceil((target - today) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  })();

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
              <span className="text-blue-600">Kindness Cup: {donationsReceived}%</span>
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
            onClick={() => onViewStory(postId, postData)}
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
          <button 
            onClick={() => {
              const actualCharityId = charityId || authorId;
              console.log('🏢 Charity Profile Click - PostID:', postId, 'CharityID:', actualCharityId, 'CharityName:', charityName);
              onViewCharityProfile?.(actualCharityId, charityName);
            }}
            className="w-full flex items-center justify-between py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors rounded"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-300 rounded-full" />
              <div>
                <p className="font-medium text-gray-900 text-sm">{charityName}</p>
                <div className="w-2 h-2 bg-black rounded-full mt-1" />
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Items Needed */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-900">We currently need</h3>
            <span className="text-xs text-blue-600">See All</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {transformedItems.map((item, index) => (
              <div key={index} className="relative h-32">
                <div
                  className={`p-4 rounded-lg border h-full flex flex-col justify-between transition-all ${
                    item.available ? 'bg-blue-50 border-blue-200 hover:bg-blue-100 cursor-pointer hover:shadow-md' : 'bg-gray-50 border-gray-200'
                  }`}
                  onClick={() => handleItemClick(item)}
                >
                  <div className="flex flex-col">
                    <span className={`text-sm font-medium mb-1 ${item.available ? 'text-gray-900' : 'text-gray-500'}`}>
                      {item.type}
                    </span>
                    {item.available && (
                      <span className="text-xs text-blue-600 mb-3">
                        Click to shop
                      </span>
                    )}
                    {!item.available && (
                      <span className="text-xs text-gray-400 mb-3">Not Available</span>
                    )}
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
      </div>
    </div>
  );
};

export default CharityPost;