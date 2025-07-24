import React from 'react';
import { ArrowLeft, MapPin, Calendar, DollarSign, Users, CheckCircle2, Package } from 'lucide-react';

const DriveDetailsPage = ({ drive, onBack }) => {
  if (!drive) return null;

  // Format items list for display
  const formatItemsList = (items) => {
    if (!items || items.length === 0) return [];
    return items;
  };

  const itemsList = formatItemsList(drive.items);

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
          <h1 className="text-xl font-bold text-gray-900">Drive Details</h1>
        </div>
      </div>

      {/* Content */}
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
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
              <Users className="w-4 h-4 text-gray-500" />
            </div>
            <div>
              <p className="font-medium text-gray-900">{drive.vendor}</p>
            </div>
          </div>
        </div>

        {/* Key Information Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 text-center">
            <Calendar className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <p className="text-xs text-gray-500 mb-1">Deadline</p>
            <p className="font-bold text-gray-900">{drive.expiry}</p>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <Package className="w-6 h-6 text-green-600 mx-auto mb-2" />
            <p className="text-xs text-gray-500 mb-1">Items Needed</p>
            <p className="font-bold text-gray-900">{itemsList.length} Types</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm font-medium text-gray-900">Collection Progress</p>
            <p className="text-sm text-gray-600">68% collected</p>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
            <div className="bg-green-500 h-2 rounded-full w-2/3"></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>Items collected: 850+</span>
            <span>142 supporters</span>
          </div>
        </div>

        {/* Items Needed Section */}
        {itemsList.length > 0 && (
          <div className="bg-white rounded-lg p-4 mb-6">
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
                    <p className="text-xs text-gray-500">Still needed</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        <div className="bg-white rounded-lg p-4 mb-6">
          <h3 className="font-bold text-gray-900 mb-3">About This Drive</h3>
          <p className="text-sm text-gray-600 leading-relaxed mb-4">
            {drive.description}
          </p>
        </div>

        {/* Location */}
        <div className="bg-white rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-4 h-4 text-gray-500" />
            <h3 className="font-bold text-gray-900">Location</h3>
          </div>
          <p className="text-sm text-gray-600">Singapore, Central Region</p>
          <p className="text-xs text-gray-500 mt-1">Serving affected areas nationwide</p>
        </div>

        {/* Impact Stats */}
        <div className="bg-white rounded-lg p-4 mb-6">
          <h3 className="font-bold text-gray-900 mb-3">Impact So Far</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-lg font-bold text-blue-600">1,240</p>
              <p className="text-xs text-gray-500">People Helped</p>
            </div>
            <div>
              <p className="text-lg font-bold text-green-600">350</p>
              <p className="text-xs text-gray-500">Families Assisted</p>
            </div>
            <div>
              <p className="text-lg font-bold text-purple-600">15</p>
              <p className="text-xs text-gray-500">Communities Reached</p>
            </div>
          </div>
        </div>

        {/* Support Button */}
        <button className="w-full bg-blue-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-blue-700 transition-colors">
          Support This Drive
        </button>
      </div>
    </div>
  );
};

export default DriveDetailsPage;