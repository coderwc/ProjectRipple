import React, { useEffect, useState } from 'react';
import {
  Search,
  ShoppingCart,
  PawPrint,
  Book,
  HeartHandshake,
  Heart,
  Home,
  Stethoscope,
  Building2,
  AlertTriangle,
  Filter,
  Droplet,
  User
} from 'lucide-react';

import { useCart } from '../shared/CartContext';
import { getLatestCharityPosts, getItemDonationTotals } from '../../firebase/posts';
import { auth, db } from '../../firebase/config';
import { doc, onSnapshot } from 'firebase/firestore';

const categories = [
  { name: 'Natural Disasters', icon: AlertTriangle },
  { name: 'Animals', icon: PawPrint },
  { name: 'Sustainability', icon: HeartHandshake },
  { name: 'Education', icon: Book },
  { name: 'Medical', icon: Stethoscope },
  { name: 'Non-profit', icon: Heart },
  { name: 'Orphanage', icon: Home },
  { name: 'Infrastructure', icon: Building2 },
];

// Helper function to normalize item names for matching (same as in CharityPost.js)
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

export default function DonorHome({ 
  user, 
  onSelectCategory, 
  onSelectPost, 
  onCharitySelect, 
  onGoToCart,
  onGoToProfile,
  onLogout 
}) {
  const { getTotalItems } = useCart();
  const [exploreDrives, setExploreDrives] = useState([]);
  const [donorProfile, setDonorProfile] = useState(null);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [filterOptions, setFilterOptions] = useState({
    timeFilter: 'any time',
    categoryFilter: 'all categories'
  });

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

  useEffect(() => {
    const fetchExploreDrives = async () => {
      try {
        const response = await getLatestCharityPosts(8);
        if (response.success && response.posts) {
          const formattedPosts = await Promise.all(response.posts.map(async post => {
            // Robust date calculation
            let daysLeft = 0;
            if (post.deadline) {
              try {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                
                let target;
                if (typeof post.deadline === 'string') {
                  if (post.deadline.includes('/')) {
                    const parts = post.deadline.split('/');
                    if (parts.length === 3) {
                      const [day, month, year] = parts.map(Number);
                      target = new Date(year, month - 1, day);
                    } else {
                      target = new Date(post.deadline);
                    }
                  } else {
                    target = new Date(post.deadline);
                  }
                } else {
                  target = new Date(post.deadline);
                }
                
                target.setHours(23, 59, 59, 999);
                const diffTime = target - today;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                daysLeft = diffDays > 0 ? diffDays : 0;
              } catch (error) {
                console.error('❌ Error calculating days left:', error);
                daysLeft = 0;
              }
            }

            // Calculate kindness cup percentage based on items fulfillment
            const progress = await calculateKindnessCupPercentage(post);

            return {
              id: post.id,
              title: post.headline,
              org: post.charityName || 'Unknown Org',
              progress,
              daysLeft,
              imageUrl: post.imageUrl,
              category: post.category || 'Uncategorized',
              charityData: {
                id: post.charityId,
                name: post.charityName,
                description: post.storyDescription
              }
            };
          }));

          setExploreDrives(formattedPosts);
        }
      } catch (error) {
        console.error('❌ Failed to load explore posts:', error);
      }
    };

    fetchExploreDrives();
  }, []);

  // Real-time donor profile data listener
  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    const docRef = doc(db, "users", currentUser.uid);
    
    // Set up real-time listener
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setDonorProfile(docSnap.data());
      } else {
        console.log("No donor profile found");
      }
    }, (error) => {
      console.error("Error listening to donor profile:", error);
    });

    // Cleanup listener on component unmount
    return () => unsubscribe();
  }, []);


  const handleTimeFilterChange = (timeFilter) => {
    const newFilterOptions = { ...filterOptions, timeFilter };
    setFilterOptions(newFilterOptions);
    
    // Close popup if both filters are selected (and not default values)
    if (newFilterOptions.categoryFilter !== 'all categories' && timeFilter !== 'any time') {
      setShowFilterMenu(false);
    }
  };

  const handleCategoryFilterChange = (categoryFilter) => {
    const newFilterOptions = { ...filterOptions, categoryFilter };
    setFilterOptions(newFilterOptions);
    
    // Close popup if both filters are selected (and not default values)
    if (newFilterOptions.timeFilter !== 'any time' && categoryFilter !== 'all categories') {
      setShowFilterMenu(false);
    }
  };

  const handleClearFilters = () => {
    setFilterOptions({
      timeFilter: 'any time',
      categoryFilter: 'all categories'
    });
    setShowFilterMenu(false);
  };
  
  const filteredDrives = [...exploreDrives]
    .filter((drive) => {
      // Time filter
      let passesTimeFilter = true;
      if (filterOptions.timeFilter !== 'any time') {
        switch (filterOptions.timeFilter) {
          case 'ends in a week':
            passesTimeFilter = drive.daysLeft <= 7;
            break;
          case 'ends in two weeks':
            passesTimeFilter = drive.daysLeft <= 14;
            break;
          case 'ends in a month':
            passesTimeFilter = drive.daysLeft <= 30;
            break;
          default:
            passesTimeFilter = true;
        }
      }
      
      // Category filter
      let passesCategoryFilter = true;
      if (filterOptions.categoryFilter !== 'all categories') {
        passesCategoryFilter = drive.category === filterOptions.categoryFilter;
      }
      
      return passesTimeFilter && passesCategoryFilter;
    });

  return (
    <div className="max-w-sm mx-auto bg-gray-50 min-h-screen relative">
      {/* Top Header Section with Blue-Purple Gradient */}
      <div className="bg-gradient-to-r from-blue-400 to-purple-500 px-4 pt-4 pb-3 rounded-b-3xl">
        {/* Top row with profile - Reduced spacing */}
        <div className="flex items-center gap-3 mb-3">
          {/* Profile Picture - Made smaller */}
          <button 
            onClick={onGoToProfile}
            className="w-12 h-12 bg-gray-300 rounded-full hover:bg-gray-400 transition-colors cursor-pointer overflow-hidden border-2 border-white shadow-md flex-shrink-0"
          >
            {donorProfile?.imageUrl ? (
              <img 
                src={donorProfile.imageUrl} 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-200">
                <User className="w-6 h-6 text-gray-600" />
              </div>
            )}
          </button>
          
          {/* Welcome Message - Adjusted spacing and sizing */}
          <div className="flex flex-col justify-center">
            <p className="text-gray-700 text-xs">Welcome back,</p>
            <h1 className="text-gray-900 text-base font-semibold">
              {donorProfile?.name || user?.displayName || 'John Doe'}
            </h1>
          </div>
        </div>
        
        {/* Search Bar and Cart - Reduced height */}
        <div className="flex items-center gap-3">
          {/* Search Bar */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search here"
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border-0 rounded-full shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          {/* Cart Button - Made smaller */}
          <button 
            onClick={onGoToCart}
            className="relative w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-all flex-shrink-0"
          >
            <ShoppingCart className="w-5 h-5 text-gray-700" />
            {getTotalItems() > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                {getTotalItems()}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4">
        {/* Category Selection */}
        <h2 className="text-sm font-semibold text-gray-700 mb-2 mt-2">Donate by Category</h2>
        <div className="grid grid-cols-4 gap-3 mb-4">
          {categories.map(({ name, icon: Icon }) => (
            <button
              key={name}
              onClick={() => onSelectCategory(name)}
              className="w-20 h-20 flex flex-col items-center justify-center bg-white rounded-lg border border-gray-200 shadow-sm hover:bg-gray-100 active:bg-gray-200 transition"
            >
              <Icon className="w-6 h-6 text-black mb-1" />
              <span style={{ fontSize: '10px' }} className="text-center leading-tight">{name}</span>
            </button>
          ))}
        </div>

        {/* Explore and Filter */}
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-sm font-semibold text-gray-700">Explore</h2>
          <div className="relative z-10">
            <div className="relative">
              <button
                onClick={() => setShowFilterMenu(prev => !prev)}
                className="flex items-center gap-1 text-gray-600 text-sm hover:text-gray-800"
              >
                <Filter className="w-4 h-4" />
                Filter
              </button>
              {showFilterMenu && (
                <div className="absolute top-6 right-0 bg-white border border-gray-200 rounded shadow-md text-sm text-gray-700 min-w-[500px]">
                  <div className="p-4">
                    {/* Filter Options */}
                    <div className="flex gap-8 mb-4">
                      {/* Time Filter Section */}
                      <div className="flex flex-col gap-2">
                        <div className="font-semibold mb-1">Time Filter</div>
                        {timeFilters.map((filter) => (
                          <button 
                            key={filter}
                            onClick={() => handleTimeFilterChange(filter)}
                            className={`text-left px-3 py-1 rounded hover:bg-gray-100 whitespace-nowrap ${filterOptions.timeFilter === filter ? 'bg-blue-50 text-blue-600' : ''}`}
                          >
                            {filter}
                          </button>
                        ))}
                      </div>
                      
                      {/* Category Filter Section */}
                      <div className="flex flex-col gap-2">
                        <div className="font-semibold mb-1">Category Filter</div>
                        {categoryFilters.map((filter) => (
                          <button 
                            key={filter}
                            onClick={() => handleCategoryFilterChange(filter)}
                            className={`text-left px-3 py-1 rounded hover:bg-gray-100 whitespace-nowrap ${filterOptions.categoryFilter === filter ? 'bg-blue-50 text-blue-600' : ''}`}
                          >
                            {filter}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {/* Clear Filter Button */}
                    <div className="border-t border-gray-200 pt-3">
                      <button 
                        onClick={() => handleClearFilters()}
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

        {/* Explore Posts - Updated with consistent formatting */}
        <div className="space-y-3 pb-24">
          {filteredDrives.map((drive) => (
            <div
              key={drive.id}
              className="bg-white rounded-xl border border-gray-100 shadow-sm cursor-pointer hover:shadow-md transition-all duration-200 overflow-hidden"
              onClick={() => onSelectPost(drive.id)}
            >
              {/* Fixed height container for consistent sizing */}
              <div className="h-48 flex flex-col">
                {/* Image section - Fixed height with consistent aspect ratio */}
                <div className="h-24 w-full bg-gray-200 flex-shrink-0 overflow-hidden">
                  {drive.imageUrl ? (
                    <img 
                      src={drive.imageUrl} 
                      alt={drive.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                      <div className="text-center">
                        <Heart className="w-8 h-8 text-gray-400 mx-auto mb-1" />
                        <span className="text-gray-500 text-xs font-medium">{drive.org}</span>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Content section - Fixed height to ensure consistency */}
                <div className="flex-1 p-4 flex flex-col justify-between">
                  {/* Title and org */}
                  <div className="mb-3">
                    <h3 className="text-sm font-semibold text-gray-900 leading-tight mb-1 line-clamp-2 min-h-[2.5rem]">
                      {drive.title}
                    </h3>
                    <p className="text-xs text-blue-600 font-medium truncate">{drive.org}</p>
                  </div>
                  
                  {/* Progress and days info - Fixed at bottom */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-1.5">
                        <Droplet className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                        <span className="text-blue-600 font-medium">Kindness Cup: {drive.progress}%</span>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="text-gray-500">Days: </span>
                        <span className="font-semibold text-gray-800">{drive.daysLeft}</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(drive.progress || 0, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}