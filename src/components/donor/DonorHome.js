import React from 'react';
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
  LogOut,
  Package
} from 'lucide-react';
import { useCart } from '../shared/CartContext';

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

const exploreDrives = [
  { 
    id: 4, 
    title: 'Books for Kids', 
    org: 'EduFuture', 
    progress: 45, 
    daysLeft: 12,
    charityData: { id: 4, name: 'EduFuture', description: 'Educational support for children' }
  },
  { 
    id: 5, 
    title: 'Medical Camp Aid', 
    org: 'CureMore', 
    progress: 73, 
    daysLeft: 28,
    charityData: { id: 5, name: 'CureMore', description: 'Medical aid and healthcare' }
  },
  { 
    id: 6, 
    title: 'New Shelter Homes', 
    org: 'SafeHaven', 
    progress: 35, 
    daysLeft: 20,
    charityData: { id: 6, name: 'SafeHaven', description: 'Shelter and housing assistance' }
  },
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

  const handleShopForCharity = (charityData, event) => {
    event.stopPropagation(); // Prevent triggering the post selection
    onCharitySelect(charityData);
  };

  return (
    <div className="max-w-sm mx-auto p-4 bg-gray-50 min-h-screen relative">
      {/* Logout Button */}
      <button
        onClick={onLogout}
        className="absolute top-4 right-4 text-gray-500 hover:text-red-600 transition-colors"
        title="Logout"
      >
        <LogOut className="w-5 h-5" />
      </button>

      {/* Top Bar */}
      <div className="flex justify-between items-center mb-4">
        <div className="w-10 h-10 bg-gray-300 rounded-full" />
        <div className="flex-1 mx-3 relative">
          <Search className="absolute left-2 top-2.5 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search"
            className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded-full"
          />
        </div>
        
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

      {/* Explore Feed */}
      <div className="space-y-3 pb-24">
        {exploreDrives.map((drive) => (
          <div
            key={drive.id}
            className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm relative"
          >
            <div 
              onClick={() => onSelectPost(drive.id)}
              className="cursor-pointer"
            >
              <div className="h-20 bg-gray-200 rounded mb-2" />
              <h3 className="text-sm font-semibold mb-1">{drive.title}</h3>
              <p className="text-xs text-gray-500 mb-1">{drive.org}</p>
              <div className="flex justify-between items-center text-xs text-gray-500 mb-2">
                <div className="flex items-center gap-1">
                  <Droplet className="w-3 h-3 text-blue-500" />
                  <span>Kindness Cup: {drive.progress}%</span>
                </div>
                <span>{drive.daysLeft} days left</span>
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