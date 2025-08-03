import React, { useState } from 'react';
import { Filter, X } from 'lucide-react';

export default function FilterBar({ onFilterChange, activeFilters = {} }) {
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  const timeFilters = [
    { label: '1 Week', value: 'week' },
    { label: '2 Weeks', value: 'twoWeeks' },
    { label: '1 Month', value: 'month' }
  ];

  const categoryFilters = [
    { label: 'Natural Disasters', value: 'Natural Disasters' },
    { label: 'Animals', value: 'Animals' },
    { label: 'Sustainability', value: 'Sustainability' },
    { label: 'Education', value: 'Education' },
    { label: 'Medical', value: 'Medical' },
    { label: 'Non-profit', value: 'Non-profit' },
    { label: 'Orphanage', value: 'Orphanage' },
    { label: 'Infrastructure', value: 'Infrastructure' }
  ];

  const handleTimeFilterChange = (timeValue) => {
    const currentTimeFilters = activeFilters.time || [];
    let newTimeFilters;
    
    if (currentTimeFilters.includes(timeValue)) {
      // Remove if already selected
      newTimeFilters = currentTimeFilters.filter(t => t !== timeValue);
    } else {
      // Add if not selected
      newTimeFilters = [...currentTimeFilters, timeValue];
    }
    
    const newFilters = {
      ...activeFilters,
      time: newTimeFilters.length > 0 ? newTimeFilters : null
    };
    onFilterChange(newFilters);
  };

  const handleCategoryFilterChange = (categoryValue) => {
    const currentCategoryFilters = activeFilters.category || [];
    let newCategoryFilters;
    
    if (currentCategoryFilters.includes(categoryValue)) {
      // Remove if already selected
      newCategoryFilters = currentCategoryFilters.filter(c => c !== categoryValue);
    } else {
      // Add if not selected
      newCategoryFilters = [...currentCategoryFilters, categoryValue];
    }
    
    const newFilters = {
      ...activeFilters,
      category: newCategoryFilters.length > 0 ? newCategoryFilters : null
    };
    onFilterChange(newFilters);
  };

  const clearAllFilters = () => {
    onFilterChange({});
    setShowFilterMenu(false);
  };

  const hasActiveFilters = (activeFilters.time && activeFilters.time.length > 0) || 
                          (activeFilters.category && activeFilters.category.length > 0);
  
  const filterCount = (activeFilters.time?.length || 0) + (activeFilters.category?.length || 0);

  return (
    <div className="relative z-10">
      <div className="relative">
        <button
          onClick={() => setShowFilterMenu(prev => !prev)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all ${
            hasActiveFilters 
              ? 'bg-blue-100 text-blue-700 border border-blue-200' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Filter className="w-3.5 h-3.5" />
          <span className="font-medium">Filter</span>
          {hasActiveFilters && (
            <span className="bg-blue-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
              {filterCount}
            </span>
          )}
        </button>
        
        {showFilterMenu && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black bg-opacity-10 z-10"
              onClick={() => setShowFilterMenu(false)}
            />
            
            {/* Filter Menu */}
            <div className="absolute top-12 right-0 bg-white border border-gray-200 rounded-xl shadow-xl z-20 min-w-[520px]">
              {/* Header */}
              <div className="flex justify-between items-center px-5 py-3 bg-gray-50 border-b border-gray-100">
                <span className="font-semibold text-gray-800">Filter Posts</span>
                <button 
                  onClick={() => setShowFilterMenu(false)}
                  className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              {/* Content - Side by Side */}
              <div className="flex">
                {/* Time Filters - Left Side */}
                <div className="flex-1 p-5 border-r border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-700 mb-4">By Time</h3>
                  <div className="space-y-2">
                    {timeFilters.map((filter) => (
                      <button
                        key={filter.value}
                        onClick={() => handleTimeFilterChange(filter.value)}
                        className={`w-full p-3 rounded-lg text-center transition-all ${
                          activeFilters.time?.includes(filter.value)
                            ? 'bg-blue-500 text-white shadow-md'
                            : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        <div className="font-medium text-sm">{filter.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Category Filters - Right Side */}
                <div className="flex-1 p-5">
                  <h3 className="text-sm font-semibold text-gray-700 mb-4">By Category</h3>
                  <div className="space-y-2">
                    {categoryFilters.map((filter) => (
                      <button
                        key={filter.value}
                        onClick={() => handleCategoryFilterChange(filter.value)}
                        className={`w-full p-3 rounded-lg text-center transition-all ${
                          activeFilters.category?.includes(filter.value)
                            ? 'bg-blue-500 text-white shadow-md'
                            : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        <div className="font-medium text-sm">{filter.label}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Clear All Button */}
              {hasActiveFilters && (
                <div className="px-5 py-3 border-t border-gray-100 bg-gray-50">
                  <button
                    onClick={clearAllFilters}
                    className="w-full py-2 text-sm text-gray-600 hover:text-gray-800 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Clear All Filters
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}