import React from 'react';
import { Trash2, Plus, ArrowLeft } from 'lucide-react';

const MyListings = ({ listings, setListings, user, onLogout, onNavigateToAdd, onNavigateToEdit, onNavigateToHome }) => {
  const handleDelete = (index) => {
    const updated = [...listings];
    updated.splice(index, 1);
    setListings(updated);
  };

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
          <button onClick={onNavigateToHome}>
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">My Listings</h1>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6 pb-24">
        {/* Section Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Active Products</h2>
          <span className="text-sm text-gray-500">{listings.length} items</span>
        </div>

        {/* Info Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            💡 List your surplus goods to reduce loss while helping charities around you
          </p>
        </div>

        {/* Listings */}
        {listings.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No listings yet</h3>
            <p className="text-gray-500 mb-6">Start by adding your first product listing</p>
            <button 
              onClick={onNavigateToAdd}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Add First Listing
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {listings.map((item, index) => (
              <div key={index} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex gap-3">
                  {/* Product Image */}
                  <div className="w-20 h-16 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
                    {item.image ? (
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Plus className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                  
                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-semibold text-gray-900 text-sm truncate">{item.name}</h3>
                      <button 
                        onClick={() => handleDelete(index)}
                        className="text-red-500 hover:text-red-700 ml-2 flex-shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <p className="text-xs text-gray-500 mb-1">{user.name}</p>
                    
                    {item.description && (
                      <p className="text-xs text-gray-400 mb-2 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        {item.category}
                      </span>
                      <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                        {item.condition}
                      </span>
                      {item.quantity > 1 && (
                        <span className="text-xs text-gray-500">
                          Qty: {item.quantity}
                        </span>
                      )}
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-sm text-gray-900">
                        SGD ${parseFloat(item.price || 0).toFixed(2)}
                      </span>
                      {item.expiryDate && (
                        <span className="text-xs text-gray-500">
                          Expires: {new Date(item.expiryDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Edit button */}
                <button 
                  onClick={() => onNavigateToEdit(index)}
                  className="w-full mt-3 bg-gray-100 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                >
                  Edit Listing
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Fixed Add Button */}
      {listings.length > 0 && (
        <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-sm bg-white border-t border-gray-200 px-4 py-4">
          <button 
            onClick={onNavigateToAdd}
            className="w-full bg-blue-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            ADD LISTING
          </button>
        </div>
      )}
    </div>
  );
};

export default MyListings;