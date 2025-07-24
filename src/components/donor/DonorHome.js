import React from 'react';
import bibleVerses from '../../data/bible_verses.json';
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
  const [bibleVerse, setBibleVerse] = React.useState("");
  const [bibleReference, setBibleReference] = React.useState("");

  const handleShopForCharity = (charityData, event) => {
    event.stopPropagation();
    onCharitySelect(charityData);
  };

  React.useEffect(() => {
    const randomIndex = Math.floor(Math.random() * bibleVerses.length);
    const selected = bibleVerses[randomIndex];
    setBibleVerse(selected.text);
    setBibleReference(`— ${selected.reference}`);
  }, []);

  return (
    <div className="max-w-sm mx-auto bg-gray-50 min-h-screen">
      {/* 🟩 Header */}
      <div
        className="p-4 rounded-b-3xl shadow-md"
        style={{
          background: 'linear-gradient(135deg, #A0D8EF 0%, #7FBFFF 50%, #63A4FF 100%)'
        }}
      >
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-300 rounded-full" />
            <div>
              <p className="text-xs text-gray-600">Welcome back,</p>
              <p className="text-base font-semibold text-gray-800">{user?.name || 'Username'}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="text-gray-700 hover:text-red-500 transition"
            title="Logout"
          >
            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-400">
              <LogOut className="w-5 h-5 text-gray-700" />
            </div>
          </button>
        </div>

        {/* ✅ Search & Cart */}
        <div className="flex items-center mt-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search here"
              className="w-full pl-10 pr-3 py-2 text-sm bg-white border border-gray-300 rounded-full shadow-sm"
            />
          </div>
          <button
            onClick={onGoToCart}
            className="ml-3 relative w-8 h-8 flex items-center justify-center rounded-full bg-gray-300 text-gray-700"
          >
            <ShoppingCart className="w-5 h-5" />
            {getTotalItems() > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
                {getTotalItems()}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* 🔘 Categories */}
      <div className="bg-white p-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-2">Donate by Category</h2>
        <div className="grid grid-cols-4 gap-3 mb-4">
          {categories.map(({ name, icon: Icon }) => (
            <button
              key={name}
              onClick={() => onSelectCategory(name)}
              className="w-20 h-20 flex flex-col items-center justify-center rounded-lg text-white border border-gray-300 transition duration-200"
              style={{ background: '#3f9bf1ff', opacity: 0.8 }}
            >
              <Icon className="w-6 h-6 mb-1 text-black" />
              <span style={{ fontSize: '10px' }} className="text-center leading-tight">
                {name}
              </span>
            </button>
          ))}
        </div>

        {/* 📖 Bible Verse */}
        <div className="text-gray-500 opacity-60 text-sm leading-snug max-w-[220px] mt-2">
          <p>"{bibleVerse}"</p>
          <p className="text-xs mt-1">{bibleReference}</p>
        </div>
      </div>

      {/* 🔽 Most Urgent */}
      <div className="bg-gray-50 p-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-2">Most Urgent</h2>
        <div className="flex space-x-4 overflow-x-auto pb-2">
          {urgentPosts.map((post) => (
            <div
              key={post.id}
              className="min-w-[160px] shrink-0 p-4 bg-white rounded-lg shadow-sm border border-gray-200 relative"
            >
              <div className="w-full h-24 bg-gray-100 rounded mb-2"></div>
              <h3 className="text-sm font-semibold">{post.title}</h3>
              <p className="text-xs text-gray-500">{post.ngo}</p>
              <p className="text-xs text-blue-600 mt-1">{post.progress}% full</p>
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

        {/* Explore + Filter/Sort */}
        <div className="flex justify-between items-center mt-6 mb-2">
          <h2 className="text-sm font-semibold text-gray-700">Explore</h2>
          <div className="flex items-center gap-2 text-gray-500 text-xs">
            <SortAsc className="w-4 h-4" />
            <span>Sort</span>
            <Filter className="w-4 h-4 ml-4" />
            <span>Filter</span>
          </div>
        </div>

        {/* 🧭 Explore Drives */}
        <div className="space-y-3 pb-24">
          {exploreDrives.map((drive) => (
            <div
              key={drive.id}
              onClick={() => onSelectPost(drive.id)}
              className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm cursor-pointer hover:shadow-md transition-all duration-200 relative"
            >
              <div className="w-full h-20 bg-gray-300 rounded-lg mb-3" />
              <div className="space-y-2">
                <h3 className="text-base font-semibold text-gray-900 leading-tight line-clamp-2">
                  {drive.title}
                </h3>
                <p className="text-sm text-blue-600 font-medium">{drive.org}</p>
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <Droplet className="w-4 h-4 text-blue-500" />
                    <span className="text-blue-600 font-medium">
                      Kindness Cup: {drive.progress}%
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-gray-500">Remaining Days</span>
                    <span className="font-semibold text-gray-800 ml-1">{drive.daysLeft}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={(e) => handleShopForCharity(drive.charityData, e)}
                className="mt-3 w-full bg-green-500 hover:bg-green-600 text-white text-xs py-2 px-3 rounded flex items-center justify-center space-x-1 transition-colors"
              >
                <Package className="w-3 h-3" />
                <span>Shop for {drive.org}</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
