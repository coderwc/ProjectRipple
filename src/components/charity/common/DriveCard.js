import React from 'react';

const DriveCard = ({ drive, onClick }) => {
  // Debug what items we're receiving
  console.log('Drive items:', drive.items);
  
  // Format items list for display
  const formatItemsList = (items) => {
    if (!items || items.length === 0) {
      console.log('No items found, showing default message');
      return "Various items needed";
    }
    
    console.log('Formatting items:', items);
    return items.slice(0, 3).map(item => 
      `${item.name} (${item.quantity})`
    ).join(', ') + (items.length > 3 ? '...' : '');
  };

  return (
    <button 
      onClick={() => onClick && onClick(drive)}
      className="bg-white rounded-xl p-4 mb-4 shadow-sm border border-gray-100 w-full text-left hover:shadow-md transition-shadow"
    >
      <div className="flex gap-3">
        <div className="w-20 h-16 bg-gray-200 rounded-lg flex-shrink-0"></div>
        <div className="flex-1">
          <div className="flex justify-between items-start mb-1">
            <h3 className="font-semibold text-gray-900 text-sm">{drive.name}</h3>
          </div>
          <p className="text-xs text-gray-500 mb-1">{drive.vendor}</p>
          <p className="text-xs text-gray-400 mb-2 leading-relaxed">{drive.description}</p>
          <div className="flex justify-between items-center">
            <div className="flex-1 mr-4">
              <p className="text-xs text-gray-400">Raising for:</p>
              <p className="font-semibold text-sm text-gray-900 break-words">
                {formatItemsList(drive.items)}
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-xs text-gray-400">Deadline:</p>
              <p className="font-semibold text-sm text-gray-900">{drive.expiry}</p>
            </div>
          </div>
        </div>
      </div>
    </button>
  );
};

export default DriveCard;