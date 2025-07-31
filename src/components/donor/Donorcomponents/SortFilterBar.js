import React, { useState } from 'react';
import { SortAsc } from 'lucide-react';

export default function SortFilterBar({ onSortChange }) {
  const [showSortMenu, setShowSortMenu] = useState(false);

  return (
    <div className="relative z-10">
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
    </div>
  );
}