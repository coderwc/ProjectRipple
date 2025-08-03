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
  SortAsc,
  Droplet,
  Package,
  User
} from 'lucide-react';
import { useCart } from '../shared/CartContext';
import { getLatestCharityPosts } from '../../firebase/posts';
import { auth, db } from '../../firebase/config';
import { doc, getDoc } from 'firebase/firestore';

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
  const [timeFilter, setTimeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [allPosts, setAllPosts] = useState([]);

  useEffect(() => {
    const fetchExploreDrives = async () => {
      try {
        const response = await getLatestCharityPosts(8);
        if (response.success && response.posts) {
          const formattedPosts = response.posts.map(post => {
            const remainingDays = (() => {
              const today = new Date();
              const target = new Date(post.deadline);
              const diff = Math.ceil((target - today) / (1000 * 60 * 60 * 24));
              return diff > 0 ? diff : 0;
            })();
            return {
              id: post.id,
              title: post.headline,
              org: post.charityName || 'Unknown Org',
              progress: Math.floor(Math.random() * 50) + 30,
              daysLeft: remainingDays,
              category: post.category || 'Natural Disasters',
              charityData: {
                id: post.charityId,
                name: post.charityName,
                description: post.storyDescription
              }
            };
          });
          setAllPosts(formattedPosts);
          setExploreDrives(formattedPosts);
        }
      } catch (error) {
        console.error('❌ Failed to load explore posts:', error);
      }
    };

    fetchExploreDrives();
  }, []);

  // Fetch donor profile data
  useEffect(() => {
    const fetchDonorProfile = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) return;

        const docRef = doc(db, "donors", currentUser.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setDonorProfile(docSnap.data());
        }
      } catch (error) {
        console.error("Error fetching donor profile:", error);
      }
    };

    fetchDonorProfile();
  }, []);

  // Combined filter effect
  useEffect(() => {
    let filteredPosts = [...allPosts];

    // Apply time filter
    if (timeFilter === 'week') {
      filteredPosts = filteredPosts.filter(post => post.daysLeft <= 7);
    } else if (timeFilter === '2weeks') {
      filteredPosts = filteredPosts.filter(post => post.daysLeft <= 14);
    } else if (timeFilter === 'month') {
      filteredPosts = filteredPosts.filter(post => post.daysLeft <= 30);
    }
    // If timeFilter === 'all', no time filtering applied

    // Apply category filter
    if (categoryFilter !== 'all') {
      filteredPosts = filteredPosts.filter(post => post.category === categoryFilter);
    }

    // Always sort by urgency (days remaining)
    filteredPosts.sort((a, b) => a.daysLeft - b.daysLeft);

    setExploreDrives(filteredPosts);
  }, [allPosts, timeFilter, categoryFilter]);

  const urgentPosts = [
    { 
      id: 1,
      title: 'Emergency Shelter', 
      ngo: 'Relief Org', 
      progress: 82,
      charityData: { id: 1, name: 'Relief Org', description: 'Emergency relief organization' }
    },
    { 
      id: 2,
      title: 'Animal Rescue Fund', 
      ngo: 'PawSafe', 
      progress: 61,
      charityData: { id: 2, name: 'PawSafe', description: 'Animal rescue and protection' }
    },
    { 
      id: 3,
      title: 'Flood Relief Supplies', 
      ngo: 'NGO WaterAid', 
      progress: 92,
      charityData: { id: 3, name: 'NGO WaterAid', description: 'Water and sanitation aid' }
    },
  ];


  const handleShopForCharity = (charityData, event) => {
    event.stopPropagation(); // Prevent triggering the post selection
    onCharitySelect(charityData);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.relative')) {
        setShowFilterDropdown(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="max-w-sm mx-auto p-4 bg-gray-50 min-h-screen relative">
      {/* Top Bar */}
      <div className="flex items-center mb-4">
        <button 
          onClick={onGoToProfile}
          className="w-10 h-10 bg-gray-300 rounded-full hover:bg-gray-400 transition-colors cursor-pointer overflow-hidden border-2 border-gray-200"
        >
          {donorProfile?.imageUrl ? (
            <img 
              src={donorProfile.imageUrl} 
              alt="Profile" 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <User className="w-5 h-5 text-gray-600" />
            </div>
          )}
        </button>
        
        {/* Lengthened Search Bar - Shifted Left */}
        <div className="flex-1 mx-2 mr-4 relative">
          <Search className="absolute left-2 top-2.5 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search"
            className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded-full"
          />
        </div>
        
        {/* Cart Button */}
        <div className="flex items-center">
          {/* Shopping Cart Icon with Badge */}
          <button 
            onClick={onGoToCart}
            className="relative text-gray-600 hover:text-blue-600 transition-colors"
          >
            <ShoppingCart className="w-6 h-6" />
            {getTotalItems() > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {getTotalItems()}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Category Grid */}
      <h2 className="text-sm font-semibold text-gray-700 mb-2">Donate by Category</h2>
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

      {/* Explore + Filter */}
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-sm font-semibold text-gray-700">Explore</h2>
        <div className="flex items-center gap-2 text-gray-500 text-xs relative">
          {/* Combined Filter Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className="flex items-center gap-1 hover:text-gray-700 transition-colors"
            >
              <Filter className="w-4 h-4" />
              <span>Filter</span>
            </button>
            {showFilterDropdown && (
              <div className="absolute top-6 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 w-80">
                <div className="flex">
                  {/* Time filters column */}
                  <div className="flex-1 border-r border-gray-200">
                    <div className="px-3 py-2 text-xs font-semibold text-gray-600 bg-gray-50 rounded-tl-lg border-b border-gray-200">
                      BY TIME
                    </div>
                    <div className="p-2 space-y-1">
                      <label className="flex items-center px-2 py-1.5 text-xs hover:bg-gray-50 rounded cursor-pointer">
                        <input
                          type="radio"
                          name="timeFilter"
                          value="all"
                          checked={timeFilter === 'all'}
                          onChange={(e) => setTimeFilter(e.target.value)}
                          className="mr-2 text-blue-600 w-3 h-3"
                        />
                        All Time
                      </label>
                      <label className="flex items-center px-2 py-1.5 text-xs hover:bg-gray-50 rounded cursor-pointer">
                        <input
                          type="radio"
                          name="timeFilter"
                          value="week"
                          checked={timeFilter === 'week'}
                          onChange={(e) => setTimeFilter(e.target.value)}
                          className="mr-2 text-blue-600 w-3 h-3"
                        />
                        Ending in a Week
                      </label>
                      <label className="flex items-center px-2 py-1.5 text-xs hover:bg-gray-50 rounded cursor-pointer">
                        <input
                          type="radio"
                          name="timeFilter"
                          value="2weeks"
                          checked={timeFilter === '2weeks'}
                          onChange={(e) => setTimeFilter(e.target.value)}
                          className="mr-2 text-blue-600 w-3 h-3"
                        />
                        Ending in Two Weeks
                      </label>
                      <label className="flex items-center px-2 py-1.5 text-xs hover:bg-gray-50 rounded cursor-pointer">
                        <input
                          type="radio"
                          name="timeFilter"
                          value="month"
                          checked={timeFilter === 'month'}
                          onChange={(e) => setTimeFilter(e.target.value)}
                          className="mr-2 text-blue-600 w-3 h-3"
                        />
                        Ending in a Month
                      </label>
                    </div>
                  </div>
                  
                  {/* Category filters column */}
                  <div className="flex-1">
                    <div className="px-3 py-2 text-xs font-semibold text-gray-600 bg-gray-50 rounded-tr-lg border-b border-gray-200">
                      BY CATEGORY
                    </div>
                    <div className="p-2 space-y-1 max-h-48 overflow-y-auto">
                      <label className="flex items-center px-2 py-1.5 text-xs hover:bg-gray-50 rounded cursor-pointer">
                        <input
                          type="radio"
                          name="categoryFilter"
                          value="all"
                          checked={categoryFilter === 'all'}
                          onChange={(e) => setCategoryFilter(e.target.value)}
                          className="mr-2 text-blue-600 w-3 h-3"
                        />
                        All Categories
                      </label>
                      {categories.map((category) => (
                        <label key={category.name} className="flex items-center px-2 py-1.5 text-xs hover:bg-gray-50 rounded cursor-pointer">
                          <input
                            type="radio"
                            name="categoryFilter"
                            value={category.name}
                            checked={categoryFilter === category.name}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="mr-2 text-blue-600 w-3 h-3"
                          />
                          <span className="truncate">{category.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Clear all filters button */}
                <div className="border-t border-gray-200 p-2">
                  <button 
                    onClick={() => {
                      setTimeFilter('all');
                      setCategoryFilter('all');
                    }}
                    className="w-full text-center px-3 py-2 text-xs hover:bg-gray-50 text-gray-500 rounded transition-colors"
                  >
                    Clear All Filters
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Explore Feed - UPDATED WITH STANDARDIZED STYLING */}
      <div className="space-y-3 pb-24">
        {exploreDrives.map((drive) => (
          <div
            key={drive.id}
            className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm relative"
          >
            <div 
              onClick={() => onSelectPost(drive.id)}
              className="cursor-pointer hover:shadow-md transition-all duration-200"
            >
              {/* Grey placeholder - Standardized uniform size */}
              <div className="w-full h-20 bg-gray-300 rounded-lg mb-3" />
              
              {/* Content section */}
              <div className="space-y-2">
                <h3 className="text-base font-semibold text-gray-900 leading-tight line-clamp-2">{drive.title}</h3>
                <p className="text-sm text-blue-600 font-medium">{drive.org}</p>
                
                {/* Progress and days info */}
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <Droplet className="w-4 h-4 text-blue-500" />
                    <span className="text-blue-600 font-medium">Kindness Cup: {drive.progress}%</span>
                  </div>
                  <div className="text-right">
                    <span className="text-gray-500">Remaining Days</span>
                    <span className="font-semibold text-gray-800 ml-1">{drive.daysLeft}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Shop Button */}
            <button
              onClick={(e) => handleShopForCharity(drive.charityData, e)}
              className="w-full bg-green-500 hover:bg-green-600 text-white text-xs py-2 px-3 rounded flex items-center justify-center space-x-1 transition-colors"
            >
              <Package className="w-3 h-3" />
              <span>Shop for {drive.org}</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}