import React from 'react';

const DriveCard = ({ drive, onClick }) => (
  <button 
    onClick={() => onClick && onClick(drive)}
    className="bg-white rounded-xl p-4 mb-4 shadow-sm border border-gray-100 w-full text-left hover:shadow-md transition-shadow"
  >
    <div className="flex gap-3">
      <div className="w-20 h-16 bg-gray-200 rounded-lg flex-shrink-0"></div>
      <div className="flex-1">
        <div className="flex justify-between items-start mb-1">
          <h3 className="font-semibold text-gray-900 text-sm">{drive.name}</h3>
          {/* Heart icon removed */}
        </div>
        <p className="text-xs text-gray-500 mb-1">{drive.vendor}</p>
        <p className="text-xs text-gray-400 mb-2 leading-relaxed">{drive.description}</p>
        <div className="flex justify-between items-center">
          <div>
            <p className="text-xs text-gray-400">Selling At</p>
            <p className="font-semibold text-sm text-gray-900">{drive.price}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">Expiring In:</p>
            <p className="font-semibold text-sm text-gray-900">{drive.expiry}</p>
          </div>
        </div>
      </div>
    </div>
  </button>
);

export default DriveCard;