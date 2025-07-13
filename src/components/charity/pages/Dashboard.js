import React from 'react';
import { ChevronDown, Home, Plus, User, CheckCircle2 } from 'lucide-react';
import DriveCard from '../common/DriveCard';
import { categories } from '../constants/categories';

const Dashboard = ({
  showMore,
  setShowMore,
  selectedCategory,
  setSelectedCategory,
  ongoingDrives,
  currentPage,
  setCurrentPage,
  onDriveClick
}) => (
  <div className="max-w-sm mx-auto bg-gray-50 min-h-screen">
    {/* Status Bar */}
    <div className="flex justify-between items-center px-4 py-2 bg-white text-sm font-medium">
      <span>9:30</span>
      <div className="flex gap-1">
        <div className="w-4 h-2 bg-black rounded-sm"></div>
        <div className="w-4 h-2 bg-black rounded-sm"></div>
      </div>
    </div>

    {/* Header */}
    <div className="bg-white px-4 py-6 border-b border-gray-100">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
          <User className="w-6 h-6 text-gray-400" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-gray-900">Hope Foundation</h1>
            <CheckCircle2 className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-sm text-gray-500">Verified Identification</p>
        </div>
      </div>
    </div>
 
    <div className="px-4 py-6">
      {/* Ongoing Drives Section */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Ongoing drives:</h2>
        
        {ongoingDrives.slice(0, showMore ? ongoingDrives.length : 3).map(drive => (
          <DriveCard key={drive.id} drive={drive} onClick={onDriveClick}/>
        ))}
        
        <button 
          onClick={() => setShowMore(!showMore)}
          className="w-full flex flex-col items-center justify-center py-4 text-gray-500"
        >
          <span className="text-sm font-medium mb-1">
            {showMore ? 'Show less' : 'Show more'}
          </span>
          <ChevronDown className={`w-5 h-5 transition-transform ${showMore ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Other Raisings Section */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Other Raisings :</h2>
        
        <div className="grid grid-cols-2 gap-3">
          {categories.map((category, index) => (
            <button
              key={index}
              onClick={() => setSelectedCategory(category)}
              className={`p-4 rounded-xl border-2 transition-all ${
                selectedCategory === category 
                  ? 'border-gray-900 bg-white' 
                  : 'border-gray-200 bg-gray-100'
              }`}
            >
              <div className="h-12 mb-2"></div>
              <span className={`text-xs font-medium ${
                selectedCategory === category ? 'text-gray-900' : 'text-gray-500'
              }`}>
                {category}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>

    {/* Bottom Navigation */}
    <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-sm bg-white border-t border-gray-200">
      <div className="flex justify-around py-3">
        <button 
          onClick={() => setCurrentPage('dashboard')}
          className="flex flex-col items-center gap-1"
        >
          <Home className={`w-6 h-6 ${currentPage === 'dashboard' ? 'text-gray-900' : 'text-gray-400'}`} />
          <span className={`text-xs ${currentPage === 'dashboard' ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>Home</span>
        </button>
        <button 
          onClick={() => setCurrentPage('createPost')}
          className="flex flex-col items-center gap-1"
        >
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            currentPage === 'createPost' ? 'bg-blue-600' : 'bg-gray-800'
          }`}>
            <Plus className="w-5 h-5 text-white" />
          </div>
          <span className={`text-xs font-medium ${currentPage === 'createPost' ? 'text-blue-600' : 'text-gray-600'}`}>Post</span>
        </button>
        <button 
          onClick={() => setCurrentPage('profile')}
          className="flex flex-col items-center gap-1"
        >
          <User className={`w-6 h-6 ${currentPage === 'profile' ? 'text-gray-900' : 'text-gray-400'}`} />
          <span className={`text-xs ${currentPage === 'profile' ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>Profile</span>
        </button>
      </div>
    </div>

    {/* Bottom padding to account for fixed nav */}
    <div className="h-20"></div>
    
  </div>
);

export default Dashboard;
