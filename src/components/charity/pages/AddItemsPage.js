import React from 'react';
import { ArrowLeft, Minus, Plus } from 'lucide-react';

const AddItemsPage = ({ 
  selectedItemCategory, 
  setSelectedItemCategory, 
  itemName, 
  setItemName, 
  quantity, 
  setQuantity, 
  onBack, 
  onAddItem, 
  onPostNeed,
  itemCategories = ["Food", "Water", "Shelter", "Medical Supplies", "Sanitation", "Others"]
}) => (
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
        <h1 className="text-xl font-bold text-gray-900">Add Items</h1>
      </div>
    </div>

    {/* Form Content */}
    <div className="px-4 py-6 pb-32">
      {/* Item Category */}
      <div className="mb-6">
        <label className="block text-lg font-bold text-gray-900 mb-4">Item Category:</label>
        <div className="grid grid-cols-2 gap-3">
          {itemCategories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedItemCategory(category)}
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedItemCategory === category 
                  ? 'border-blue-500 bg-blue-50 text-blue-700' 
                  : 'border-gray-200 bg-white text-gray-700'
              }`}
            >
              <span className="text-sm font-medium">{category}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Item Name */}
      <div className="mb-6">
        <label className="block text-lg font-bold text-gray-900 mb-2">Item Name:</label>
        <input 
          type="text" 
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
          className="w-full p-4 bg-white rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter item name or description..."
        />
      </div>

      {/* Quantity */}
      <div className="mb-8">
        <label className="block text-lg font-bold text-gray-900 mb-2">Quantity:</label>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setQuantity(Math.max(0, quantity - 1))}
            className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-300 transition-colors"
          >
            <Minus className="w-5 h-5 text-gray-600" />
          </button>
          
          <input 
            type="text" 
            value={quantity}
            onChange={(e) => {
              const value = e.target.value;
              if (value === '' || /^\d+$/.test(value)) {
                setQuantity(value === '' ? 0 : parseInt(value));
              }
            }}
            className="flex-1 p-4 bg-white rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-lg font-semibold"
            placeholder="0"
          />
          
          <button 
            onClick={() => setQuantity(quantity + 1)}
            className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-300 transition-colors"
          >
            <Plus className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Add Item Button */}
      <button 
        onClick={onAddItem}
        className="w-full bg-blue-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-blue-700 transition-colors"
      >
        Add Item
      </button>
    </div>

    {/* Fixed Bottom Button */}
    <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-sm bg-white border-t border-gray-200 px-4 py-4">
      <button 
        onClick={onPostNeed}
        className="w-full bg-green-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-green-700 transition-colors"
      >
        Post Need
      </button>
    </div>
  </div>
);

export default AddItemsPage;