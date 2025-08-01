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

// ✅ category array can remain here
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

// ✅ component definition starts here
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
  const [exploreDrives, setExploreDrives] = useState([]); // ✅ move useState inside component
  const [donorProfile, setDonorProfile] = useState(null);

  // ✅ useEffect goes here
  useEffect(() => {
  const fetchExploreDrives = async () => {
    try {
      const response = await getLatestCharityPosts(8); // limit to 8 latest posts
      console.log('📦 Response from getPostsAPI:', response); // ✅ Debug log

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
            charityData: {
              id: post.charityId,
              name: post.charityName,
              description: post.storyDescription
            }
          };
        });

        setExploreDrives(formattedPosts);
      } else {
        console.warn('🚨 Unexpected response structure:', response);
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

      {/* Most Urgent */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-2">Most Urgent</h2>
        <div className="flex space-x-4 overflow-x-auto pb-2">
          {urgentPosts.map((post, index) => (
            <div
              key={index}
              className="min-w-[160px] shrink-0 p-4 bg-white rounded-lg shadow-sm border border-gray-200 relative"
            >
              <div className="w-full h-24 bg-gray-100 rounded mb-2"></div>
              <h3 className="text-sm font-semibold">{post.title}</h3>
              <p className="text-xs text-gray-500">{post.ngo}</p>
              <p className="text-xs text-blue-600 mt-1">{post.progress}% full</p>
              
              {/* Shop Button */}
              <button
                onClick={(e) => handleShopForCharity(post.charityData, e)}
                className="mt-2 w-full bg-blue-500 hover:bg-blue-600 text-white text-xs py-1 px-2 rounded flex items-center justify-center space-x-1 transition-colors"
              >
                <Package className="w-3 h-3" />
                <span>Shop</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Explore + Sort/Filter */}
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-sm font-semibold text-gray-700">Explore</h2>
        <div className="flex items-center gap-2 text-gray-500 text-xs">
          <SortAsc className="w-4 h-4" />
          <span>Sort</span>
          <Filter className="w-4 h-4 ml-4" />
          <span>Filter</span>
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

