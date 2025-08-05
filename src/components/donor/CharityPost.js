import React, { useEffect, useState } from 'react';
import { ArrowLeft, Users, FileText, Camera, ChevronRight } from 'lucide-react';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { getItemDonationTotals } from '../../firebase/posts';

// Using keyword-based matching from posts.js - no need for local normalization

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
  const [charityImageUrl, setCharityImageUrl] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Function to refresh post data (e.g., after donations)
  const refreshPostData = () => {
    console.log('🔄 Refreshing charity post data...');
    setRefreshTrigger(prev => prev + 1);
  };

  useEffect(() => {
    const fetchPost = async () => {
      try {
        if (!postId) {
          setLoading(false);
          return;
        }
        
        const docRef = doc(db, 'charities', postId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const rawData = docSnap.data();
          setPostData(rawData);

          // ⬇️ Fetch updated charity profile image from publicCharities
const publicCharityId = rawData.charityId || rawData.authorId;
if (publicCharityId) {
  try {
    const publicProfileRef = doc(db, 'publicCharities', publicCharityId);
    const publicProfileSnap = await getDoc(publicProfileRef);

    if (publicProfileSnap.exists()) {
      const publicProfileData = publicProfileSnap.data();
      console.log('📥 Charity profile data for image:', publicProfileData);
      setCharityImageUrl(publicProfileData.imageUrl || null);
    } else {
      console.log('⚠️ No public charity profile found for ID:', publicCharityId);
    }
  } catch (error) {
    console.log('⚠️ Error fetching charity profile image:', error);
  }
}

          // Fetch donation totals from separate collection using keyword matching
          const donationTotals = await getItemDonationTotals(postId, rawData.items);

          const formatted = rawData.items?.map((item) => {
            // Use direct item name matching from keyword-based donation totals
            const donatedQuantity = donationTotals[item.name] || 0;
            
            console.log(`🔍 [CharityPost] Charity item "${item.name}" received ${donatedQuantity} donations`);
            console.log(`🔍 [CharityPost] Available donation totals:`, donationTotals);
            
            if (donatedQuantity > 0) {
              console.log(`✅ MATCH FOUND! "${item.name}" received ${donatedQuantity} donations`);
            }
            
            const isCompleted = donatedQuantity >= item.quantity && item.quantity > 0;
            
            return {
              type: item.name || 'Unknown',
              current: donatedQuantity, // Use keyword-matched donation totals
              target: item.quantity || 0,
              available: item.quantity > 0 && donatedQuantity < item.quantity,
              completed: isCompleted
            };
          }) || [];

          setTransformedItems(formatted);
          
          // Calculate total donations received across all items
          const totalDonationsReceived = Object.values(donationTotals).reduce((sum, quantity) => sum + quantity, 0);
          console.log(`🎁 Total donations received for post: ${totalDonationsReceived}`);
          
          // Update the post data with actual donation count
          setPostData(prevData => ({
            ...prevData,
            actualDonationsReceived: totalDonationsReceived
          }));
        }
      } catch (error) {
        console.error('❌ Error loading post:', error);
      } finally {
        setLoading(false);
      }
    };

    if (postId) {
      fetchPost();
    } else {
      // If no postId, stop loading immediately
      setLoading(false);
    }

    // Add timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 10000); // 10 second timeout

    return () => clearTimeout(timeout);
  }, [postId, refreshTrigger]);

  if (loading) {
    return (
      <div className="text-center mt-8 p-4">
        <div className="text-sm text-gray-500 mb-4">Loading post...</div>
        <button 
          onClick={onBack}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (!postData) {
    return (
      <div className="text-center mt-8 p-4">
        <div className="text-sm text-red-500 mb-2">Post not found.</div>
        <div className="text-xs text-gray-500">PostID: {postId}</div>
        <div className="text-xs text-gray-500">Check browser console for details</div>
        <button 
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  const {
    headline,
    charityName,
    charityId,
    authorId,
    donationsReceived,
    actualDonationsReceived,
    deadline,
    imageUrl
  } = postData;

  const remainingDays = (() => {
    if (!deadline) return 0;
    
    try {
      // Create dates at midnight to avoid timezone issues
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      let target;
      if (typeof deadline === 'string') {
        // Handle different string formats
        if (deadline.includes('/')) {
          // Format: DD/MM/YYYY or MM/DD/YYYY
          const parts = deadline.split('/');
          if (parts.length === 3) {
            // Assume DD/MM/YYYY format (European)
            const [day, month, year] = parts.map(Number);
            target = new Date(year, month - 1, day);
          } else {
            target = new Date(deadline);
          }
        } else {
          target = new Date(deadline);
        }
      } else {
        target = new Date(deadline);
      }
      
      target.setHours(23, 59, 59, 999); // End of target day
      
      const diffTime = target - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      console.log(`📅 Deadline calculation: today=${today.toDateString()}, target=${target.toDateString()}, days=${diffDays}`);
      
      return diffDays > 0 ? diffDays : 0;
    } catch (error) {
      console.error('❌ Error calculating remaining days:', error);
      return 0;
    }
  })();

  // Calculate kindness cup percentage based on 'we currently need' items fulfillment
  const kindnessCupPercentage = (() => {
    if (!transformedItems || transformedItems.length === 0) {
      console.log('🔍 Kindness cup: No transformed items available');
      return 0;
    }
    
    let totalFulfillment = 0;
    let itemCount = 0;
    
    console.log('🔍 Kindness cup calculation - Items:', transformedItems);
    
    transformedItems.forEach(item => {
      if (item.target > 0) {
        const itemFulfillment = Math.min((item.current / item.target) * 100, 100);
        totalFulfillment += itemFulfillment;
        itemCount++;
        console.log(`🔍 Item "${item.type}": ${item.current}/${item.target} = ${itemFulfillment.toFixed(1)}%`);
      }
    });
    
    const finalPercentage = itemCount > 0 ? Math.round(totalFulfillment / itemCount) : 0;
    console.log(`🔍 Final kindness cup percentage: ${finalPercentage}% (${itemCount} items processed)`);
    return finalPercentage;
  })();

  const handleItemClick = (item) => {
    if (item.available && onCharitySelect) {
      const charityData = {
        id: postId,
        name: charityName,
        selectedItem: item.type,
        refreshPostData: refreshPostData // Pass refresh function to parent
      };
      onCharitySelect(charityData);
    }
  };

  return (
    <div className="max-w-sm mx-auto p-4 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen relative">

      {/* Header - Clean vendor-style header */}
      <div className="bg-white px-4 py-6 border-b border-gray-100 shadow-md -mx-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-1 hover:bg-gray-100 rounded">
              <ArrowLeft className="w-6 h-6 text-gray-700" />
            </button>
            <span className="text-xl font-bold text-gray-900">Charity Post</span>
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
            </div>
          </div>

          <h2 className="font-semibold text-gray-900 mb-1">{headline}</h2>
          <p className="text-sm text-blue-600 mb-3">{actualDonationsReceived || donationsReceived || 0} Items Donated</p>

          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-blue-600">Kindness Cup: {kindnessCupPercentage}%</span>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-blue-500 rounded" />
                <span className="text-gray-500 text-xs">{remainingDays} More Days</span>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all"
                style={{ width: `${kindnessCupPercentage}%` }}
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
                <p className="font-medium text-gray-900 text-sm">{charityName}</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Items Needed */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-900">We currently need</h3>
          </div>

          <div className="grid grid-cols-2 gap-4 items-stretch">
            {transformedItems.map((item, index) => (
              <div key={index} className="relative h-full">
                <div
                  className={`p-4 rounded-xl border flex flex-col transition-all min-h-[8rem] h-full ${
                    item.completed 
                      ? 'bg-green-50 border-green-200' 
                      : item.available 
                        ? 'bg-blue-50 border-blue-200 hover:bg-blue-100 cursor-pointer hover:shadow-md' 
                        : 'bg-gray-50 border-gray-200'
                  }`}
                  onClick={() => handleItemClick(item)}
                >
                  <div className="flex flex-col flex-1 mb-3">
                    <span className={`text-sm font-medium mb-2 leading-tight ${
                      item.completed ? 'text-green-900' : item.available ? 'text-gray-900' : 'text-gray-500'
                    }`}>
                      {item.type}
                    </span>
                    {item.completed && (
                      <span className="text-xs text-green-600 mb-3 font-medium">
                        ✅ Goal Achieved!
                      </span>
                    )}
                    {item.available && !item.completed && (
                      <span className="text-xs text-blue-600 mb-3">
                        Click to shop
                      </span>
                    )}
                    {!item.available && !item.completed && (
                      <span className="text-xs text-gray-400 mb-3">Not Available</span>
                    )}
                  </div>
                  <div>
                    <div className="text-lg font-bold text-gray-900 mb-2">{item.current}/{item.target}</div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full transition-all ${
                          item.completed ? 'bg-green-500' : item.available ? 'bg-blue-500' : 'bg-gray-400'
                        }`}
                        style={{ width: `${Math.min((item.current / item.target) * 100, 100)}%` }}
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