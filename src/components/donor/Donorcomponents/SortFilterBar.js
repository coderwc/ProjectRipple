import React, { useState } from 'react';
import { SortAsc, Filter } from 'lucide-react';

export default function SortFilterBar({ onSortChange }) {
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [selectedTimeFilter, setSelectedTimeFilter] = useState('any time');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all categories');

  const timeFilters = [
    'any time',
    'ends in a week',
    'ends in two weeks', 
    'ends in a month'
  ];

  const categoryFilters = [
    'all categories',
    'Natural Disasters',
    'Animals', 
    'Sustainability',
    'Education',
    'Medical',
    'Non-profit',
    'Orphanage',
    'Infrastructure'
  ];

  const handleTimeFilterChange = (timeFilter) => {
    setSelectedTimeFilter(timeFilter);
    onSortChange('filter', { timeFilter, categoryFilter: selectedCategoryFilter });
    setShowFilterMenu(false);
  };

  const handleCategoryFilterChange = (categoryFilter) => {
    setSelectedCategoryFilter(categoryFilter);
    onSortChange('filter', { timeFilter: selectedTimeFilter, categoryFilter });
    setShowFilterMenu(false);
  };

  return (
    <div className="relative z-10 flex gap-2">
      <div className="relative">
        <button
          onClick={() => setShowSortMenu(prev => !prev)}
          className="flex items-center gap-1 text-gray-600 text-sm hover:text-gray-800"
        >
          <SortAsc className="w-4 h-4" />
          Sort
        </button>
        {showSortMenu && (
          <div className="absolute top-6 right-0 bg-white border border-gray-200 rounded shadow-md text-sm text-gray-700 min-w-[180px]">
            <button onClick={() => { onSortChange('alphabetical'); setShowSortMenu(false); }} className="block w-full text-left px-4 py-2 hover:bg-gray-100">A–Z</button>
            <button onClick={() => { onSortChange('daysLeft'); setShowSortMenu(false); }} className="block w-full text-left px-4 py-2 hover:bg-gray-100">Soonest Deadline</button>
            <button onClick={() => { onSortChange('progress-high'); setShowSortMenu(false); }} className="block w-full text-left px-4 py-2 hover:bg-gray-100">Kindness Cup: High → Low</button>
            <button onClick={() => { onSortChange('progress-low'); setShowSortMenu(false); }} className="block w-full text-left px-4 py-2 hover:bg-gray-100">Kindness Cup: Low → High</button>
          </div>
        )}
      </div>
      
      <div className="relative">
        <button
          onClick={() => setShowFilterMenu(prev => !prev)}
          className="flex items-center gap-1 text-gray-600 text-sm hover:text-gray-800"
        >
          <Filter className="w-4 h-4" />
          Filter
        </button>
        {showFilterMenu && (
          <div className="absolute top-6 right-0 bg-white border border-gray-200 rounded shadow-md text-sm text-gray-700 min-w-[200px] max-h-80 overflow-y-auto">
            <div className="px-4 py-2 bg-gray-50 font-semibold border-b">Time Filter</div>
            {timeFilters.map((filter) => (
              <button 
                key={filter}
                onClick={() => handleTimeFilterChange(filter)}
                className={`block w-full text-left px-4 py-2 hover:bg-gray-100 ${selectedTimeFilter === filter ? 'bg-blue-50 text-blue-600' : ''}`}
              >
                {filter}
              </button>
            ))}
            
            <div className="px-4 py-2 bg-gray-50 font-semibold border-b border-t">Category Filter</div>
            {categoryFilters.map((filter) => (
              <button 
                key={filter}
                onClick={() => handleCategoryFilterChange(filter)}
                className={`block w-full text-left px-4 py-2 hover:bg-gray-100 ${selectedCategoryFilter === filter ? 'bg-blue-50 text-blue-600' : ''}`}
              >
                {filter}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}