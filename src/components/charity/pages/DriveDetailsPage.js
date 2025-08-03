import React, { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Calendar, DollarSign, Users, CheckCircle2, Package } from 'lucide-react';
import { calculateDriveProgress, formatProgressText, getProgressBarColor } from '../../../utils/progressCalculation';
import { getDonationsByPost } from '../../../firebase/donations'; // ✅ Fixed path

const DriveDetailsPage = ({ drive, onBack, user }) => {
  const [donations, setDonations] = useState([]);
  const [loadingDonations, setLoadingDonations] = useState(true);

  // ✅ Always call hooks unconditionally
  useEffect(() => {
    const fetchDonations = async () => {
      if (drive?.id) {
        try {
          setLoadingDonations(true);
          const donationsData = await getDonationsByPost(drive.id);
          setDonations(donationsData);
          console.log('✅ Loaded donations for drive:', drive.id, donationsData);
        } catch (error) {
          console.error('❌ Error loading donations:', error);
          setDonations([]);
        } finally {
          setLoadingDonations(false);
        }
      }
    };

    fetchDonations();
  }, [drive?.id]); // ✅ Prevent crash on undefined drive

  if (!drive) return null;

  // Format items list for display
  const formatItemsList = (items) => {
    if (!items || items.length === 0) return [];
    return items;
  };

  const itemsList = formatItemsList(drive.items);
  
  const progressData = calculateDriveProgress(drive, donations);
  const progressBarColor = getProgressBarColor(progressData.percentage);
  const progressText = formatProgressText(progressData);

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
            {loadingDonations ? (
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
            {loadingDonations ? (
              <span>Calculating progress...</span>
            ) : (
              <span>{progressText}</span>
            )}
            <span>{progressData.donorCount} supporter{progressData.donorCount === 1 ? '' : 's'}</span>
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
                    <p className="font-bold text-blue-600">Qty: {item.quantity}</p>
                    <p className="text-xs text-gray-500">
                      {progressData.percentage >= 100 ? 'Goal achieved!' : 'Still needed'}
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


      </div>
    </div>
  );
};

export default DriveDetailsPage;
