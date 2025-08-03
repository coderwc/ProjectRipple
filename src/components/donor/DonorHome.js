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
  User
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
              imageUrl: post.imageUrl, // Include the image URL
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
    <div className="max-w-sm mx-auto p-4 bg-gray-50 min-h-screen relative">
      {/* Top Navigation */}
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

      {/* Category Selection */}
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
  );
}