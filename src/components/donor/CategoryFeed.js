import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';

import { ArrowLeft, Filter } from 'lucide-react';

const kindnessCupOptions = [
  { label: 'All', value: 'all' },
  { label: 'Low (0-33%)', value: 'low' },
  { label: 'Half (34-66%)', value: 'half' },
  { label: 'High (67-100%)', value: 'high' }
];

const timeOptions = [
  { label: 'All Time', value: 'all' },
  { label: 'Ending in one week', value: 'week' },
  { label: 'Ending in two weeks', value: 'two-weeks' },
  { label: 'Ending in a month', value: 'month' }
];

const CategoryFeed = ({ onBack, onSelectPost, categoryName = "Natural Disasters" }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [filterOptions, setFilterOptions] = useState({
    kindnessCup: 'all',
    time: 'all'
  });

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, 'charities'), where('status', '==', 'active'));
        const querySnapshot = await getDocs(q);

        const fetchedPosts = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const matchedCategory = (data.category || '').toLowerCase() === categoryName.toLowerCase();

          if (matchedCategory) {
            const donations = data.donationsReceived || 0;
            const deadlineStr = data.deadline || '';
            const remainingDays = calculateRemainingDays(deadlineStr);

            fetchedPosts.push({
              id: doc.id,
              headline: data.headline,
              source: data.charityName || 'Unknown Charity',
              progress: donations,
              kindness: donations,
              remainingDays,
              imageUrl: data.imageUrl // Include the image URL
            });
          }
        });

        setPosts(fetchedPosts);
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [categoryName]);

  const calculateRemainingDays = (deadlineStr) => {
    try {
      const [day, month, year] = deadlineStr.split('/').map(Number);
      const deadline = new Date(year, month - 1, day);
      const now = new Date();
      const diff = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
      return diff > 0 ? diff : 0;
    } catch {
      return 0;
    }
  };

  const handleKindnessCupFilterChange = (value) => {
    const newFilters = { ...filterOptions, kindnessCup: value };
    setFilterOptions(newFilters);
    
    // Close popup if both filters are selected (and not default values)
    if (newFilters.time !== 'all' && value !== 'all') {
      setShowFilterMenu(false);
    }
  };

  const handleTimeFilterChange = (value) => {
    const newFilters = { ...filterOptions, time: value };
    setFilterOptions(newFilters);
    
    // Close popup if both filters are selected (and not default values)
    if (newFilters.kindnessCup !== 'all' && value !== 'all') {
      setShowFilterMenu(false);
    }
  };

  const handleClearFilters = () => {
    setFilterOptions({
      kindnessCup: 'all',
      time: 'all'
    });
    setShowFilterMenu(false);
  };

  const filteredPosts = [...posts].filter((post) => {
    // Kindness Cup filter
    let passesKindnessFilter = true;
    if (filterOptions.kindnessCup !== 'all') {
      const progress = post.progress || 0;
      switch (filterOptions.kindnessCup) {
        case 'low':
          passesKindnessFilter = progress <= 33;
          break;
        case 'half':
          passesKindnessFilter = progress > 33 && progress <= 66;
          break;
        case 'high':
          passesKindnessFilter = progress > 66;
          break;
        default:
          passesKindnessFilter = true;
      }
    }
    
    // Time filter
    let passesTimeFilter = true;
    if (filterOptions.time !== 'all') {
      const remainingDays = post.remainingDays || 0;
      switch (filterOptions.time) {
        case 'week':
          passesTimeFilter = remainingDays <= 7;
          break;
        case 'two-weeks':
          passesTimeFilter = remainingDays <= 14;
          break;
        case 'month':
          passesTimeFilter = remainingDays <= 30;
          break;
        default:
          passesTimeFilter = true;
      }
    }
    
    return passesKindnessFilter && passesTimeFilter;
  });

  if (loading) {
    return <p className="text-center mt-10">Loading posts...</p>;
  }

  return (
    <div className="max-w-sm mx-auto p-4 bg-gray-50 min-h-screen relative">
      {/* Status Bar */}
      <div className="bg-white px-4 py-2 flex justify-between items-center text-sm text-gray-600 -mx-4">
        <span>9:30</span>
        <div className="flex items-center gap-1">
          <div className="w-4 h-2 bg-black rounded-sm"></div>
          <div className="w-1 h-1 bg-black rounded-full"></div>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white px-4 py-4 border-b border-gray-200 -mx-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-1 hover:bg-gray-100 rounded">
              <ArrowLeft className="w-6 h-6 text-gray-700" />
            </button>
            <h1 className="text-xl font-medium text-gray-900">{categoryName}</h1>
          </div>
          <div className="relative z-10">
            <button
              onClick={() => setShowFilterMenu(prev => !prev)}
              className="flex items-center gap-1 text-gray-600 text-sm hover:text-gray-800 border rounded px-2 py-1 bg-white"
            >
              <Filter className="w-4 h-4" />
              Filter
            </button>
            {showFilterMenu && (
              <div className="absolute top-8 right-0 bg-white border border-gray-200 rounded shadow-md text-sm text-gray-700 min-w-[400px]">
                <div className="p-4">
                  {/* Filter Options */}
                  <div className="flex gap-8 mb-4">
                    {/* Kindness Cup Filter Section */}
                    <div className="flex flex-col gap-2">
                      <div className="font-semibold mb-1">Kindness Cup</div>
                      {kindnessCupOptions.map((option) => (
                        <button 
                          key={option.value}
                          onClick={() => handleKindnessCupFilterChange(option.value)}
                          className={`text-left px-3 py-1 rounded hover:bg-gray-100 whitespace-nowrap ${filterOptions.kindnessCup === option.value ? 'bg-blue-50 text-blue-600' : ''}`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                    
                    {/* Time Filter Section */}
                    <div className="flex flex-col gap-2">
                      <div className="font-semibold mb-1">Time Filter</div>
                      {timeOptions.map((option) => (
                        <button 
                          key={option.value}
                          onClick={() => handleTimeFilterChange(option.value)}
                          className={`text-left px-3 py-1 rounded hover:bg-gray-100 whitespace-nowrap ${filterOptions.time === option.value ? 'bg-blue-50 text-blue-600' : ''}`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Clear Filter Button */}
                  <div className="border-t border-gray-200 pt-3">
                    <button 
                      onClick={handleClearFilters}
                      className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded text-center font-medium"
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* News Items or Empty Message */}
      {filteredPosts.length === 0 ? (
        <div className="text-center text-gray-500 mt-20 text-sm">
          No posts found in this category.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredPosts.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl p-4 shadow-sm cursor-pointer hover:shadow-md transition-all duration-200 border border-gray-100"
              onClick={() => onSelectPost && onSelectPost(item.id)}
            >
              <div className="flex gap-4 items-start">
                {/* Charity image - uniform size */}
                <div className="w-20 h-20 bg-gray-300 rounded-lg flex-shrink-0 overflow-hidden">
                  {item.imageUrl ? (
                    <img 
                      src={item.imageUrl} 
                      alt={item.headline}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                      <span className="text-gray-500 text-xs">No Image</span>
                    </div>
                  )}
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="mb-3">
                    <h3 className="font-semibold text-gray-900 text-base leading-tight line-clamp-2">{item.headline}</h3>
                  </div>
                  
                  <p className="text-sm text-blue-600 font-medium mb-3">{item.source}</p>
                  
                  {/* Progress section */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-blue-600 font-medium">Kindness Cup: {item.progress}% Full</span>
                      <div className="flex items-center gap-1 text-right">
                        <span className="text-gray-500">Remaining Days</span>
                        <span className="font-semibold text-gray-800 min-w-[2ch]">{item.remainingDays}</span>
                      </div>
                    </div>
                    
                    {/* Progress bar */}
                    <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className="bg-blue-500 h-full rounded-full transition-all duration-500 ease-out" 
                        style={{ width: `${item.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryFeed;