import React from 'react';
import { ArrowLeft, SlidersHorizontal, ArrowUpDown, Heart } from 'lucide-react';

const CategoryFeed = ({ onBack, onSelectPost, categoryName = "Natural Disasters" }) => {
  // Generate different content based on category
  const getCategoryNews = (category) => {
    switch (category) {
      case 'Natural Disasters':
        return [
          { id: 1, headline: "Emergency Earthquake Relief Fund", source: "NBC News", kindness: "Kindness Cap: 75% Full", remainingDays: 28, progress: 75 },
          { id: 2, headline: "Flood Relief Supplies", source: "Relief International", kindness: "Kindness Cap: 85% Full", remainingDays: 15, progress: 85 },
          { id: 3, headline: "Hurricane Recovery Aid", source: "Red Cross", kindness: "Kindness Cap: 62% Full", remainingDays: 35, progress: 62 }
        ];
      case 'Animals':
        return [
          { id: 4, headline: "Animal Rescue Fund", source: "PawSafe", kindness: "Kindness Cap: 61% Full", remainingDays: 22, progress: 61 },
          { id: 5, headline: "Wildlife Sanctuary Support", source: "Animal Welfare", kindness: "Kindness Cap: 78% Full", remainingDays: 18, progress: 78 },
          { id: 6, headline: "Street Dog Vaccination Drive", source: "Pet Care NGO", kindness: "Kindness Cap: 45% Full", remainingDays: 30, progress: 45 }
        ];
      case 'Education':
        return [
          { id: 7, headline: "Books for Kids", source: "EduFuture", kindness: "Kindness Cap: 45% Full", remainingDays: 12, progress: 45 },
          { id: 8, headline: "School Building Project", source: "Teach for All", kindness: "Kindness Cap: 67% Full", remainingDays: 25, progress: 67 },
          { id: 9, headline: "Digital Learning Initiative", source: "Tech4Education", kindness: "Kindness Cap: 52% Full", remainingDays: 40, progress: 52 }
        ];
      case 'Medical':
        return [
          { id: 10, headline: "Medical Camp Aid", source: "CureMore", kindness: "Kindness Cap: 73% Full", remainingDays: 28, progress: 73 },
          { id: 11, headline: "Cancer Treatment Fund", source: "Hope Foundation", kindness: "Kindness Cap: 89% Full", remainingDays: 10, progress: 89 },
          { id: 12, headline: "Rural Health Centers", source: "Health First", kindness: "Kindness Cap: 38% Full", remainingDays: 45, progress: 38 }
        ];
      case 'Sustainability':
        return [
          { id: 13, headline: "Clean Energy Initiative", source: "Green Future", kindness: "Kindness Cap: 65% Full", remainingDays: 30, progress: 65 },
          { id: 14, headline: "Plastic-Free Ocean Project", source: "Ocean Clean", kindness: "Kindness Cap: 72% Full", remainingDays: 22, progress: 72 },
          { id: 15, headline: "Tree Planting Drive", source: "Earth Savers", kindness: "Kindness Cap: 48% Full", remainingDays: 35, progress: 48 }
        ];
      case 'Non-profit':
        return [
          { id: 16, headline: "Community Kitchen Support", source: "Feed the Hungry", kindness: "Kindness Cap: 83% Full", remainingDays: 12, progress: 83 },
          { id: 17, headline: "Homeless Shelter Fund", source: "Shelter First", kindness: "Kindness Cap: 56% Full", remainingDays: 28, progress: 56 },
          { id: 18, headline: "Youth Skill Development", source: "Skill Up", kindness: "Kindness Cap: 41% Full", remainingDays: 40, progress: 41 }
        ];
      case 'Orphanage':
        return [
          { id: 19, headline: "New Shelter Homes", source: "SafeHaven", kindness: "Kindness Cap: 35% Full", remainingDays: 20, progress: 35 },
          { id: 20, headline: "Educational Supplies for Kids", source: "Hope for Children", kindness: "Kindness Cap: 67% Full", remainingDays: 25, progress: 67 },
          { id: 21, headline: "Nutrition Program", source: "Child Care NGO", kindness: "Kindness Cap: 79% Full", remainingDays: 18, progress: 79 }
        ];
      case 'Infrastructure':
        return [
          { id: 22, headline: "Clean Water Pipeline", source: "Water for All", kindness: "Kindness Cap: 58% Full", remainingDays: 45, progress: 58 },
          { id: 23, headline: "Rural Road Development", source: "Build Together", kindness: "Kindness Cap: 43% Full", remainingDays: 60, progress: 43 },
          { id: 24, headline: "Solar Power Installation", source: "Power Up", kindness: "Kindness Cap: 71% Full", remainingDays: 30, progress: 71 }
        ];
      default:
        return [
          { id: 25, headline: "Community Support Initiative", source: "Local NGO", kindness: "Kindness Cap: 55% Full", remainingDays: 20, progress: 55 },
          { id: 26, headline: "Social Welfare Program", source: "Helping Hands", kindness: "Kindness Cap: 70% Full", remainingDays: 15, progress: 70 },
          { id: 27, headline: "Youth Development Project", source: "Future Leaders", kindness: "Kindness Cap: 42% Full", remainingDays: 35, progress: 42 }
        ];
    }
  };

  const newsItems = getCategoryNews(categoryName);

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
              {/* Image placeholder - Grey placeholder, uniform size */}
              <div className="w-20 h-20 bg-gray-300 rounded-lg flex-shrink-0"></div>
              
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