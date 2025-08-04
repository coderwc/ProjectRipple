import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { getItemDonationTotals } from '../../firebase/posts';

import { ArrowLeft, Filter } from 'lucide-react';

// Helper function to normalize item names for matching (same as in other components)
const normalizeItemName = (itemName) => {
  if (!itemName) return '';
  
  // Remove vendor names and common variations
  let normalized = itemName
    .toLowerCase()
    .trim()
    // Remove vendor names
    .replace(/\s*-\s*(gomgom|premium mart|coldstorage|cold storage|vendor\d+).*$/i, '')
    // Remove brand prefixes 
    .replace(/^(gomgom|premium mart|coldstorage|cold storage)\s*/i, '')
    // Remove water brand names (Dasani, Evian, etc.)
    .replace(/\s*(dasani|evian|aquafina|nestle|pure life|ice mountain)\s*/gi, ' ')
    // Normalize water product variations
    .replace(/\s*(bottle|btl|container)\s*/gi, ' ')
    .replace(/\s*(250ml|500ml|1l|1.5l|2l|litre|liter|ml)\s*/gi, ' ')
    // Normalize plural/singular
    .replace(/s$/, '') // Remove trailing 's'
    .replace(/ies$/, 'y') // flies -> fly
    .replace(/es$/, '') // boxes -> box
    // Remove extra spaces and clean up
    .replace(/\s+/g, ' ')
    .trim();
    
  return normalized;
};

// Calculate kindness cup percentage based on 'we currently need' items fulfillment
const calculateKindnessCupPercentage = async (post) => {
  try {
    if (!post.items || post.items.length === 0) return 0;
    
    // Fetch donation totals from separate collection
    const donationTotals = await getItemDonationTotals(post.id);
    
    let totalFulfillment = 0;
    let itemCount = 0;
    
    post.items.forEach(item => {
      if (item.quantity > 0) {
        const normalizedItemName = normalizeItemName(item.name);
        const donatedQuantity = donationTotals[normalizedItemName] || 0;
        const itemFulfillment = Math.min((donatedQuantity / item.quantity) * 100, 100);
        totalFulfillment += itemFulfillment;
        itemCount++;
      }
    });
    
    return itemCount > 0 ? Math.round(totalFulfillment / itemCount) : 0;
  } catch (error) {
    console.error('❌ Error calculating kindness cup percentage:', error);
    return 0;
  }
};

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
            const deadlineStr = data.deadline || '';
            const remainingDays = calculateRemainingDays(deadlineStr);

            fetchedPosts.push({
              id: doc.id,
              headline: data.headline,
              source: data.charityName || 'Unknown Charity',
              progress: 0, // Will be calculated later
              kindness: 0, // Will be calculated later
              remainingDays,
              imageUrl: data.imageUrl,
              items: data.items || [] // Include items for calculation
            });
          }
        });

        // Calculate kindness cup percentage for each post
        const postsWithProgress = await Promise.all(fetchedPosts.map(async post => {
          const progress = await calculateKindnessCupPercentage(post);
          return {
            ...post,
            progress,
            kindness: progress
          };
        }));

        setPosts(postsWithProgress);
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [categoryName]);

  const calculateRemainingDays = (deadline) => {
    if (!deadline) return 0;
    
    try {
      // Create dates at midnight to avoid timezone issues
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      let target;
      if (typeof deadline === 'string') {
        // Handle different string formats
        if (deadline.includes('/')) {
          // Format: DD/MM/YYYY or MM/DD/YYYY
          const parts = deadline.split('/');
          if (parts.length === 3) {
            // Assume DD/MM/YYYY format (European)
            const [day, month, year] = parts.map(Number);
            target = new Date(year, month - 1, day);
          } else {
            target = new Date(deadline);
          }
        } else {
          target = new Date(deadline);
        }
      } else {
        target = new Date(deadline);
      }
      
      target.setHours(23, 59, 59, 999); // End of target day
      
      const diffTime = target - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      return diffDays > 0 ? diffDays : 0;
    } catch (error) {
      console.error('❌ Error calculating remaining days:', error);
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
              <div className="flex gap-3 items-start">
                {/* Charity image - keep same size but improve styling */}
                <div className="w-20 h-20 bg-gray-300 rounded-xl flex-shrink-0 overflow-hidden shadow-sm">
                  {item.imageUrl ? (
                    <img 
                      src={item.imageUrl} 
                      alt={item.headline}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                      <span className="text-gray-500 text-xs font-medium">No Image</span>
                    </div>
                  )}
                </div>
                
                {/* Content - improved spacing and hierarchy */}
                <div className="flex-1 min-w-0 flex flex-col justify-between h-20">
                  {/* Title and source with better spacing */}
                  <div className="space-y-1.5">
                    <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2">{item.headline}</h3>
                    <p className="text-xs text-blue-600 font-medium">{item.source}</p>
                  </div>
                  
                  {/* Progress section - more compact */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-blue-600 font-medium">Kindness Cup: {item.progress}%</span>
                      <div className="flex items-center gap-1 bg-gray-50 px-2 py-0.5 rounded-full">
                        <span className="text-xs text-gray-500">Days:</span>
                        <span className="text-xs font-bold text-gray-800">{item.remainingDays}</span>
                      </div>
                    </div>
                    
                    {/* Progress bar - slightly thinner */}
                    <div className="w-full bg-gray-200 rounded-full h-1 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-full rounded-full transition-all duration-500 ease-out" 
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