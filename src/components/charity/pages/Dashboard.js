import React, { useEffect } from 'react';
import { ChevronDown, Home, Plus, User, CheckCircle2 } from 'lucide-react';
import DriveCard from '../common/DriveCard';

const Dashboard = ({
  showMore,
  setShowMore,
  ongoingDrives,
  currentPage,
  setCurrentPage,
  onDriveClick,
  onDeleteDrive,
  user,
  loadingPosts,
  impactPosts,
  onImpactPostClick
}) => (
  <div className="max-w-sm mx-auto min-h-screen bg-gradient-to-b from-blue-200 via-blue-100 to-white relative">
    {/* Status Bar */}
    <div className="flex justify-between items-center px-4 py-2 bg-white text-sm font-medium text-gray-700">
      <span>9:30</span>
      <div className="flex gap-1">
        <div className="w-4 h-2 bg-black rounded-sm"></div>
        <div className="w-4 h-2 bg-black rounded-sm"></div>
      </div>
    </div>

    {/* Header */}
    <div className="bg-white px-4 py-6 border-b border-gray-100 shadow-md">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
          <User className="w-6 h-6 text-blue-700" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-blue-800">{user?.name || 'Charity Organization'}</h1>
            {user?.isVerified && <CheckCircle2 className="w-5 h-5 text-blue-500" />}
          </div>
        </div>
      </div>
    </div>
 
    <div className="px-4 py-6">
      {/* Ongoing Drives Section */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Ongoing drives:</h2>
        
        {loadingPosts ? (
          <div className="text-center py-4">
            <div className="text-gray-500 text-sm">Loading your posts...</div>
          </div>
        ) : null}
        
        {ongoingDrives.slice(0, showMore ? ongoingDrives.length : 3).map((drive) => (
          <DriveCard 
            key={drive.id} 
            drive={drive} 
            onClick={onDriveClick}
            onDelete={onDeleteDrive}
            showDeleteButton={drive.isUserPost === true} // Only show delete for user's posts
          />
        ))}
        
        {ongoingDrives.length > 3 && (
          <button 
            onClick={() => setShowMore(!showMore)}
            className="w-full flex flex-col items-center justify-center py-4 text-gray-500"
          >
            <span className="text-sm font-medium mb-1">
              {showMore ? 'Show less' : 'Show more'}
            </span>
            <ChevronDown className={`w-5 h-5 transition-transform ${showMore ? 'rotate-180' : ''}`} />
          </button>
        )}
      </div>

      {/* Recent Impact Posts Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Recent Impact:</h2>
          {impactPosts && impactPosts.length > 0 && (
            <button
              onClick={() => setCurrentPage('impactGallery')}
              className="text-blue-600 text-sm font-medium hover:text-blue-700 transition-colors"
            >
              View All
            </button>
          )}
        </div>
        
        {impactPosts && impactPosts.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {impactPosts.slice(0, 4).map((post) => (
              <button
                key={post.id}
                onClick={() => onImpactPostClick && onImpactPostClick(post)}
                className="bg-white rounded-lg p-3 shadow-sm border-2 border-blue-200 hover:border-blue-400 hover:shadow-lg transition-all duration-200 text-left hover:scale-[1.02]"
              >
                {post.images && post.images.length > 0 && (
                  <img
                    src={post.images[0]}
                    alt="Impact"
                    className="w-full h-20 object-cover rounded-md mb-2"
                  />
                )}
                <p className="text-xs text-gray-600 line-clamp-2 mb-1">
                  {post.caption || 'Impact shared'}
                </p>
                <p className="text-xs text-gray-400">
                  {post.drive}
                </p>
              </button>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg p-6 text-center border border-gray-100">
            <p className="text-gray-500 text-sm mb-2">No impact posts yet</p>
            <button
              onClick={() => setCurrentPage('selectPostType')}
              className="text-blue-600 text-sm font-medium hover:text-blue-700 transition-colors"
            >
              Share your first impact
            </button>
          </div>
        )}
      </div>

    </div>

    {/* Bottom Navigation */}
    <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-sm bg-white border-t border-gray-200 shadow-inner">
      <div className="flex justify-around py-3">
        <button 
          onClick={() => setCurrentPage('dashboard')}
          className="flex flex-col items-center gap-1"
        >
          <Home className={`w-6 h-6 ${currentPage === 'dashboard' ? 'text-blue-700' : 'text-blue-300'}`} />
          <span className={`text-xs ${currentPage === 'dashboard' ? 'text-blue-700 font-medium' : 'text-blue-300'}`}>Home</span>
        </button>
        <button 
          onClick={() => setCurrentPage('selectPostType')}
          className="flex flex-col items-center gap-1"
        >
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            currentPage === 'selectPostType' ? 'bg-blue-600' : 'bg-blue-300'
          }`}>
            <Plus className="w-5 h-5 text-white" />
          </div>
          <span className={`text-xs font-medium ${currentPage === 'selectPostType' ? 'text-blue-600' : 'text-blue-300'}`}>Post</span>
        </button>
        <button 
          onClick={() => setCurrentPage('profile')}
          className="flex flex-col items-center gap-1"
        >
          <User className={`w-6 h-6 ${currentPage === 'profile' ? 'text-blue-700' : 'text-blue-300'}`} />
          <span className={`text-xs ${currentPage === 'profile' ? 'text-blue-700 font-medium' : 'text-blue-300'}`}>Profile</span>
        </button>
      </div>
    </div>

    {/* Bottom padding to account for fixed nav */}
    <div className="h-20"></div>
    
  </div>
);

export default Dashboard;
