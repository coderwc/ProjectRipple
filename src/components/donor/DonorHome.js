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
  LogOut
} from 'lucide-react';
import { useCart } from '../shared/CartContext';
import { getLatestCharityPosts } from '../../firebase/posts';
import SortFilterBar from './Donorcomponents/SortFilterBar'; // ✅ updated name but still used for sort only

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
  onLogout 
}) {
  const { getTotalItems } = useCart();
  const [exploreDrives, setExploreDrives] = useState([]);
  const [sortOption, setSortOption] = useState(null);

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

  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to log out?");
    if (confirmLogout) {
      onLogout();
    }
  };

  const handleSortChange = (option) => setSortOption(option);

  const sortedDrives = exploreDrives.sort((a, b) => {
    if (sortOption === 'alphabetical') return a.title.localeCompare(b.title);
    if (sortOption === 'daysLeft') return a.daysLeft - b.daysLeft;
    if (sortOption === 'progress-high') return b.progress - a.progress;
    if (sortOption === 'progress-low') return a.progress - b.progress;
    return 0;
  });

  return (
    <div className="max-w-sm mx-auto p-4 bg-gray-50 min-h-screen relative">
      {/* Top Bar */}
      <div className="flex items-center mb-4">
        <div className="w-10 h-10 bg-gray-300 rounded-full" />
        <div className="flex-1 mx-2 mr-4 relative">
          <Search className="absolute left-2 top-2.5 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search"
            className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded-full"
          />
        </div>
        <div className="flex items-center space-x-3">
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
          <button
            onClick={handleLogout}
            className="text-gray-500 hover:text-red-600 transition-colors"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
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

      {/* Explore + Sort */}
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-sm font-semibold text-gray-700">Explore</h2>
        <SortFilterBar onSortChange={handleSortChange} />
      </div>

      {/* Explore Feed */}
      <div className="space-y-3 pb-24">
        {sortedDrives.map((drive) => (
          <div 
            key={drive.id}
            className="bg-white rounded-xl p-4 shadow-sm cursor-pointer hover:shadow-md transition-all duration-200 border border-gray-100"
            onClick={() => onSelectPost(drive.id)}
          >
            <div className="flex gap-4 items-start">
              <div className="w-20 h-20 bg-gray-300 rounded-lg flex-shrink-0"></div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold text-gray-900 text-base leading-tight line-clamp-2 pr-2">{drive.title}</h3>
                </div>
                <p className="text-sm text-blue-600 font-medium mb-3">{drive.org}</p>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-blue-600 font-medium">Kindness Cup: {drive.progress}%</span>
                    <div className="flex items-center gap-1 text-right">
                      <span className="text-gray-500">Remaining Days</span>
                      <span className="font-semibold text-gray-800 min-w-[2ch]">{drive.daysLeft}</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="bg-blue-500 h-full rounded-full transition-all duration-500 ease-out" 
                      style={{ width: `${drive.progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}