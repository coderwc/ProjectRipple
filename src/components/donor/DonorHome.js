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
  User,
  ExternalLink
} from 'lucide-react';

import { useCart } from '../shared/CartContext';
import { getLatestCharityPosts } from '../../firebase/posts';
import { auth, db } from '../../firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import SortFilterBar from './Donorcomponents/SortFilterBar';

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
  const [sortOption, setSortOption] = useState('default');

  useEffect(() => {
    const fetchExploreDrives = async () => {
      try {
        const response = await getLatestCharityPosts(8);
        if (response.success && response.posts) {
          const formattedPosts = response.posts.map(post => {
            const today = new Date();
            const target = new Date(post.deadline);
            const diffDays = Math.ceil((target - today) / (1000 * 60 * 60 * 24));
            const daysLeft = diffDays > 0 ? diffDays : 0;

            return {
              id: post.id,
              title: post.headline,
              org: post.charityName || 'Unknown Org',
              progress: post.donationsReceived || 0,
              daysLeft,
              imageUrl: post.imageUrl,
              charityData: {
                id: post.charityId,
                name: post.charityName,
                description: post.storyDescription
              }
            };
          });

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

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      onLogout();
    }
  };

  const sortedDrives = [...exploreDrives].sort((a, b) => {
    switch (sortOption) {
      case 'alphabetical':
        return a.title.localeCompare(b.title);
      case 'daysLeft':
        return a.daysLeft - b.daysLeft;
      case 'progress-high':
        return b.progress - a.progress;
      case 'progress-low':
        return a.progress - b.progress;
      default:
        return 0;
    }
  });

  return (
    <div className="max-w-sm mx-auto bg-gray-50 min-h-screen relative">
      {/* Top Blue Header Section - Made shorter and more proportional */}
      <div className="bg-blue-300 px-4 pt-4 pb-3 rounded-b-3xl">
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
              {donorProfile?.firstName || user?.displayName || 'John Doe'}
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

        {/* Explore and Sort */}
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-sm font-semibold text-gray-700">Explore</h2>
          <SortFilterBar onSortChange={setSortOption} />
        </div>

        {/* Explore Posts */}
        <div className="space-y-3 pb-24">
          {sortedDrives.map((drive) => (
            <div
              key={drive.id}
              className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm relative cursor-pointer hover:shadow-md transition-all duration-200"
              onClick={() => onSelectPost(drive.id)}
            >
              {/* Charity image - Standardized uniform size */}
              <div className="w-full h-20 bg-gray-300 rounded-lg mb-3 overflow-hidden">
                {drive.imageUrl ? (
                  <img 
                    src={drive.imageUrl} 
                    alt={drive.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                    <span className="text-gray-500 text-xs">No Image</span>
                  </div>
                )}
              </div>
              
              {/* Content section */}
              <div className="space-y-2">
                <h3 className="text-base font-semibold text-gray-900 leading-tight line-clamp-2">{drive.title}</h3>
                <p className="text-sm text-blue-600 font-medium">{drive.org}</p>
                
                {/* Progress and days info */}
                <div className="space-y-2">
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
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min(drive.progress || 0, 100)}%` }}
                    />
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