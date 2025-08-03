import React from 'react';
import { Trash2 } from 'lucide-react';

const DriveCard = ({ drive, onClick, onDelete, showDeleteButton = false }) => {
  // Debug what items we're receiving
  console.log('Drive items:', drive.items);
  
  // Format items list for display
  const formatItemsList = (items) => {
    if (!items || items.length === 0) {
      console.log('No items found, showing default message');
      return "Various items needed";
    }
    
    console.log('Formatting items:', items);
    const firstItem = `${items[0].name} (${items[0].quantity})`;
    return firstItem + (items.length > 1 ? '...' : '');
  };

  const handleDelete = (e) => {
    e.stopPropagation(); // Prevent card click when delete button is clicked
    if (onDelete) {
      onDelete(drive);
    }
  };

  return (
    <div className="bg-white rounded-xl p-4 mb-4 shadow-sm border-2 border-blue-200 w-full relative hover:border-blue-400 hover:shadow-lg transition-all duration-200">
      {/* Delete button - only show for user's own posts */}
      {showDeleteButton && (
        <button
          onClick={handleDelete}
          className="absolute top-3 right-3 p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors z-10"
          title="Delete this drive"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
      
      {/* Make the card clickable */}
      <button 
        onClick={() => onClick && onClick(drive)}
        className="w-full text-left hover:scale-[1.02] transition-transform duration-200"
        style={{ paddingRight: showDeleteButton ? '48px' : '0' }}
      >
      <div className="flex gap-3">
        <div className="w-20 h-16 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
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
            <div className="w-full h-full bg-gray-200"></div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-1">
            <h3 className="font-semibold text-gray-900 text-sm break-words overflow-wrap-anywhere">{drive.name}</h3>
          </div>
          <p className="text-xs text-gray-500 mb-1 truncate">{drive.vendor}</p>
          <p className="text-xs text-gray-400 mb-2 leading-relaxed truncate">{drive.description}</p>
          <div className="flex-1 mr-16 min-w-0">
            <p className="text-xs text-gray-400">Raising for:</p>
            <p className="font-semibold text-sm text-gray-900 truncate">
              {formatItemsList(drive.items)}
            </p>
          </div>
          <div className="absolute bottom-3 right-3 text-right">
            <p className="text-xs text-gray-400">Deadline:</p>
            <p className="font-semibold text-sm text-gray-900">{drive.expiry}</p>
          </div>
        </div>
      </div>
      </button>
    </div>
  );
};

export default DriveCard;