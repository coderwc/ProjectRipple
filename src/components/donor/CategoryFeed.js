import { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config'; // adjust this path to your actual config file

import React from 'react';
import { ArrowLeft, SlidersHorizontal, ArrowUpDown, Heart } from 'lucide-react';

const CategoryFeed = ({ onBack, onSelectPost, categoryName = "Natural Disasters" }) => {
  // Generate different content based on category
  const [posts, setPosts] = useState([]);
const [loading, setLoading] = useState(true);

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
          fetchedPosts.push({
            id: doc.id,
            headline: data.headline,
            source: data.charityName,
            progress: data.donationsReceived || 0, // You might want to calculate %
            kindness: `Kindness Cap: ${data.donationsReceived || 0}% Full`,
            remainingDays: calculateRemainingDays(data.deadline),
            imageUrl: data.imageUrl, // Include the image URL
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
  } catch (e) {
    return 0;
  }
};

  const newsItems = posts;

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
        </div>
        
        {/* Sort and Filter */}
        <div className="flex items-center justify-end gap-4 mt-4">
          <button className="flex items-center gap-2 text-gray-600 text-sm hover:text-gray-800">
            <ArrowUpDown className="w-4 h-4" />
            Sort
          </button>
          <button className="flex items-center gap-2 text-gray-600 text-sm hover:text-gray-800">
            <SlidersHorizontal className="w-4 h-4" />
            Filter
          </button>
        </div>
      </div>

      {/* News Items */}
      <div className="space-y-3">
        {newsItems.map((item) => (
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
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold text-gray-900 text-base leading-tight line-clamp-2 pr-2">{item.headline}</h3>
                  <Heart className="w-5 h-5 text-gray-300 hover:text-red-500 cursor-pointer transition-colors flex-shrink-0" />
                </div>
                
                <p className="text-sm text-blue-600 font-medium mb-3">{item.source}</p>
                
                {/* Progress section */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-blue-600 font-medium">{item.kindness}</span>
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
    </div>
  );
};

export default CategoryFeed;