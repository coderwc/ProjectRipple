import React, { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Calendar, Users, Package } from 'lucide-react';
import { getItemDonationTotals } from '../../../firebase/posts';

// Using keyword-based matching from posts.js - no need for local normalization

const DriveDetailsPage = ({ drive, onBack, user, onDriveImpactClick, impactPosts = [] }) => {
  const [progressData, setProgressData] = useState({ percentage: 0, itemsCollected: 0, totalItemsNeeded: 0 });
  const [itemDonationTotals, setItemDonationTotals] = useState({});
  const [loadingProgress, setLoadingProgress] = useState(true);

  // ✅ Always call hooks unconditionally
  useEffect(() => {
    const fetchProgress = async () => {
      if (drive?.id && drive?.items) {
        try {
          setLoadingProgress(true);
          
          // Fetch donation totals using keyword matching
          const donationTotals = await getItemDonationTotals(drive.id, drive.items);
          
          // Store donation totals for individual item display
          setItemDonationTotals(donationTotals);
          
          // Calculate progress using same logic as kindness cup
          let totalFulfillment = 0;
          let itemCount = 0;
          let totalItemsNeeded = 0;
          let totalItemsCollected = 0;
          
          drive.items.forEach(item => {
            if (item.quantity > 0) {
              const donatedQuantity = donationTotals[item.name] || 0;
              const itemFulfillment = Math.min((donatedQuantity / item.quantity) * 100, 100);
              
              totalFulfillment += itemFulfillment;
              itemCount++;
              totalItemsNeeded += item.quantity;
              totalItemsCollected += donatedQuantity;
              
              console.log(`🔍 [DriveDetails] Item "${item.name}": ${donatedQuantity}/${item.quantity} = ${itemFulfillment.toFixed(1)}%`);
            }
          });
          
          const percentage = itemCount > 0 ? Math.round(totalFulfillment / itemCount) : 0;
          
          setProgressData({
            percentage,
            itemsCollected: totalItemsCollected,
            totalItemsNeeded,
            progressText: `${percentage}% collected`
          });
          
          console.log('✅ Charity progress calculated:', { percentage, itemsCollected: totalItemsCollected, totalItemsNeeded });
        } catch (error) {
          console.error('❌ Error calculating progress:', error);
          setProgressData({ percentage: 0, itemsCollected: 0, totalItemsNeeded: 0 });
        } finally {
          setLoadingProgress(false);
        }
      } else {
        setLoadingProgress(false);
      }
    };

    fetchProgress();
  }, [drive?.id, drive?.items]); // ✅ Recalculate when drive data changes

  if (!drive) return null;

  // Format items list for display
  const formatItemsList = (items) => {
    if (!items || items.length === 0) return [];
    return items;
  };

  const itemsList = formatItemsList(drive.items);
  
  // Keep progress bar blue regardless of percentage
  const getProgressBarColor = (percentage) => {
    return 'bg-blue-500';
  };
  
  const progressBarColor = getProgressBarColor(progressData.percentage);

  return (
    <div className="max-w-sm mx-auto min-h-screen bg-gradient-to-b from-white via-blue-100 to-blue-200">
      {/* Header */}
      <div className="flex justify-between items-center px-4 py-2 bg-white text-sm font-medium">
        <span>9:30</span>
        <div className="flex gap-1">
          <div className="w-4 h-2 bg-black rounded-sm"></div>
          <div className="w-4 h-2 bg-black rounded-sm"></div>
        </div>
      </div>

      <div className="bg-white px-4 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <button onClick={onBack}>
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Drive Details</h1>
        </div>
      </div>

      <div className="px-4 py-6 pb-24">
        {/* Drive Image */}
        <div className="w-full h-48 bg-gray-200 rounded-lg mb-6 overflow-hidden">
          {drive.image ? (
            <img 
              src={drive.image} 
              alt={drive.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentNode.style.backgroundColor = '#e5e7eb';
              }}
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <Package className="w-12 h-12 text-gray-400" />
            </div>
          )}
        </div>

        {/* Drive Title & Vendor */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{drive.name}</h2>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center overflow-hidden">
              {user?.imageUrl ? (
                <img 
                  src={user.imageUrl} 
                  alt={user.name || 'Charity Profile'} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <Users className={`w-4 h-4 text-blue-700 ${user?.imageUrl ? 'hidden' : ''}`} />
            </div>
            <div>
              <p className="font-medium text-gray-900">{drive.vendor}</p>
            </div>
          </div>
        </div>

        {/* Key Info */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 text-center shadow-sm border-2 border-blue-200">
            <Calendar className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <p className="text-xs text-gray-500 mb-1">Deadline</p>
            <p className="font-bold text-gray-900">{drive.expiry}</p>
          </div>
          <div className="bg-white rounded-lg p-4 text-center shadow-sm border-2 border-blue-200">
            <Package className="w-6 h-6 text-green-600 mx-auto mb-2" />
            <p className="text-xs text-gray-500 mb-1">Items Needed</p>
            <p className="font-bold text-gray-900">{itemsList.length} Types</p>
          </div>
        </div>

        {/* Progress */}
        <div className="bg-white rounded-lg p-4 mb-6 shadow-sm border-2 border-blue-200">
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm font-medium text-gray-900">Collection Progress</p>
            {loadingProgress ? (
              <p className="text-sm text-gray-400">Loading...</p>
            ) : (
              <p className="text-sm text-gray-600">{progressData.progressText}</p>
            )}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
            <div 
              className={`${progressBarColor} h-2 rounded-full transition-all duration-500`}
              style={{ width: `${Math.min(progressData.percentage, 100)}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            {loadingProgress ? (
              <span>Calculating progress...</span>
            ) : (
              <span>{progressData.itemsCollected} items collected</span>
            )}
            <span>{progressData.percentage}% complete</span>
          </div>
        </div>

        {/* Items Needed */}
        {itemsList.length > 0 && (
          <div className="bg-white rounded-lg p-4 mb-6 shadow-sm border-2 border-blue-200">
            <h3 className="font-bold text-gray-900 mb-3">Items Needed</h3>
            <div className="space-y-3">
              {itemsList.map((item, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <p className="text-xs text-gray-500">{item.category || 'Essential Item'}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-blue-600">
                      {loadingProgress ? `${item.quantity}` : `${itemDonationTotals[item.name] || 0}/${item.quantity}`}
                    </p>
                    <p className="text-xs text-gray-500">
                      {loadingProgress ? 'Loading...' : (
                        (itemDonationTotals[item.name] || 0) >= item.quantity ? 'Goal achieved!' : 'In progress'
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        <div className="bg-white rounded-lg p-4 mb-6 shadow-sm border-2 border-blue-200">
          <h3 className="font-bold text-gray-900 mb-3">About This Drive</h3>
          <p className="text-sm text-gray-600 leading-relaxed mb-4">
            {drive.description}
          </p>
        </div>

        {/* Location */}
        <div className="bg-white rounded-lg p-4 mb-6 shadow-sm border-2 border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-4 h-4 text-gray-500" />
            <h3 className="font-bold text-gray-900">Location</h3>
          </div>
          <p className="text-sm text-gray-600">{user?.location || 'Location not specified'}</p>
        </div>

        {/* Impact Posts for this Drive */}
        {(() => {
          const driveImpactPosts = impactPosts?.filter(post => post.drive === drive?.name) || [];
          
          return (
            <div className="bg-white rounded-lg p-4 mb-6 shadow-sm border-2 border-blue-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-gray-900">Impact Stories</h3>
                {driveImpactPosts.length > 0 && (
                  <button
                    onClick={() => onDriveImpactClick && onDriveImpactClick(drive.name)}
                    className="text-blue-600 text-sm font-medium hover:text-blue-700 transition-colors"
                  >
                    View All ({driveImpactPosts.length})
                  </button>
                )}
              </div>
              
              {driveImpactPosts.length === 0 ? (
                <div className="text-center py-6">
                  <Package className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">No impact stories shared yet</p>
                  <p className="text-gray-400 text-xs">Share your first impact story for this drive!</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {driveImpactPosts.slice(0, 4).map((post) => (
                    <button
                      key={post.id}
                      onClick={() => onDriveImpactClick && onDriveImpactClick(drive.name)}
                      className="bg-gray-50 rounded-lg p-2 text-left hover:bg-gray-100 transition-colors"
                    >
                      {post.images && post.images.length > 0 && (
                        <img
                          src={post.images[0]}
                          alt="Impact"
                          className="w-full h-16 object-cover rounded-md mb-2"
                        />
                      )}
                      <p className="text-xs text-gray-600 line-clamp-2">
                        {post.caption || 'Impact shared'}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })()}

      </div>
    </div>
  );
};

export default DriveDetailsPage;
