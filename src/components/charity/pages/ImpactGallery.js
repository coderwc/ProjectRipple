import React, { useState, useEffect } from 'react';
import { ArrowLeft, Heart, ChevronLeft, ChevronRight, Trash2, MoreHorizontal } from 'lucide-react';

const ImpactGallery = ({ impactPosts = [], selectedPost: initialSelectedPost = null, onBack, onDeletePost }) => {
  const [selectedPost, setSelectedPost] = useState(initialSelectedPost);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showDeleteMenu, setShowDeleteMenu] = useState(null);

  // Set the initial selected post when passed from dashboard
  useEffect(() => {
    if (initialSelectedPost) {
      setSelectedPost(initialSelectedPost);
      setCurrentImageIndex(0);
    }
  }, [initialSelectedPost]);

  const openPost = (post) => {
    setSelectedPost(post);
    setCurrentImageIndex(0);
  };

  const closePost = () => {
    setSelectedPost(null);
    setCurrentImageIndex(0);
  };

  const nextImage = () => {
    if (selectedPost && currentImageIndex < selectedPost.images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  const prevImage = () => {
    if (selectedPost && currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const handleDeletePost = async (post) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete this impact post?\n\nThis action cannot be undone.`
    );
    
    if (!confirmDelete) return;
    
    try {
      if (onDeletePost) {
        await onDeletePost(post);
        // Close the selected post if we're viewing it
        if (selectedPost && selectedPost.id === post.id) {
          setSelectedPost(null);
        }
      }
      setShowDeleteMenu(null);
    } catch (error) {
      console.error('Error deleting impact post:', error);
      alert(`Failed to delete impact post: ${error.message}`);
    }
  };

  if (selectedPost) {
    return (
      <div className="max-w-sm mx-auto bg-white min-h-screen">
        {/* Status Bar */}
        <div className="flex justify-between items-center px-4 py-2 bg-white text-sm font-medium">
          <span>9:30</span>
          <div className="flex gap-1">
            <div className="w-4 h-2 bg-black rounded-sm"></div>
            <div className="w-4 h-2 bg-black rounded-sm"></div>
          </div>
        </div>

        {/* Header */}
        <div className="bg-white px-4 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <button onClick={closePost}>
              <ArrowLeft className="w-6 h-6 text-gray-700" />
            </button>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900">{selectedPost.authorName || selectedPost.author}</h2>
              <p className="text-sm text-gray-500">{selectedPost.drive}</p>
            </div>
            <div className="relative">
              <button
                onClick={() => setShowDeleteMenu(showDeleteMenu === selectedPost.id ? null : selectedPost.id)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <MoreHorizontal className="w-5 h-5 text-gray-600" />
              </button>
              {showDeleteMenu === selectedPost.id && (
                <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px]">
                  <button
                    onClick={() => handleDeletePost(selectedPost)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Image Display */}
        <div className="relative aspect-square">
          <div className="flex h-full overflow-hidden">
            {selectedPost.images && selectedPost.images.length > 0 ? (
              <img
                src={Array.isArray(selectedPost.images) ? selectedPost.images[currentImageIndex] : selectedPost.images[currentImageIndex]?.url || selectedPost.images[currentImageIndex]}
                alt={`Impact ${currentImageIndex + 1}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                  <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Text-only impact story</p>
                  {selectedPost.localOnly ? (
                    <p className="text-xs text-red-600 mt-2">⚠️ Local only (not synced)</p>
                  ) : selectedPost.syncedToFirebase ? (
                    <p className="text-xs text-blue-600 mt-2">✅ Text synced to Firebase</p>
                  ) : null}
                </div>
              </div>
            )}
          </div>

          {/* Navigation arrows for multiple images */}
          {selectedPost.images && selectedPost.images.length > 1 && (
            <>
              {currentImageIndex > 0 && (
                <button
                  onClick={prevImage}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-black bg-opacity-50 text-white rounded-full flex items-center justify-center hover:bg-opacity-70"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}
              {currentImageIndex < selectedPost.images.length - 1 && (
                <button
                  onClick={nextImage}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-black bg-opacity-50 text-white rounded-full flex items-center justify-center hover:bg-opacity-70"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}

              {/* Image counter */}
              <div className="absolute top-3 right-3 bg-black bg-opacity-50 text-white px-2 py-1 rounded-full text-sm">
                {currentImageIndex + 1} / {selectedPost.images.length}
              </div>
            </>
          )}
        </div>

        {/* Post Details */}
        <div className="p-4">
          {/* Date */}
          <div className="flex justify-end mb-4">
            <span className="text-sm text-gray-500">{formatDate(selectedPost.timestamp || selectedPost.createdAt)}</span>
          </div>

          {/* Caption */}
          {selectedPost.caption && (
            <div className="mb-4">
              <p className="text-gray-900">{selectedPost.caption}</p>
            </div>
          )}

          {/* Location */}
          {selectedPost.location && (
            <div className="text-sm text-gray-500">
              📍 {selectedPost.location}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-sm mx-auto bg-white min-h-screen">
      {/* Status Bar */}
      <div className="flex justify-between items-center px-4 py-2 bg-white text-sm font-medium">
        <span>9:30</span>
        <div className="flex gap-1">
          <div className="w-4 h-2 bg-black rounded-sm"></div>
          <div className="w-4 h-2 bg-black rounded-sm"></div>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white px-4 py-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <button onClick={onBack}>
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">Impact Gallery</h1>
        </div>
      </div>

      {/* Gallery Content */}
      <div className="p-4">
        {impactPosts.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Impact Stories Yet</h3>
            <p className="text-gray-500">Share your first impact story to inspire others!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {impactPosts
              .sort((a, b) => new Date(b.timestamp || b.createdAt) - new Date(a.timestamp || a.createdAt))
              .map((post) => (
              <div key={post.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {/* Post Header */}
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold text-sm">
                          {(post.authorName || post.author)?.charAt(0).toUpperCase() || 'A'}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">
                          {post.authorName || post.author || 'Anonymous'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(post.timestamp || post.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openPost(post)}
                        className="text-blue-600 text-sm font-medium hover:text-blue-700"
                      >
                        View
                      </button>
                      <div className="relative">
                        <button
                          onClick={() => setShowDeleteMenu(showDeleteMenu === post.id ? null : post.id)}
                          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                        >
                          <MoreHorizontal className="w-4 h-4 text-gray-600" />
                        </button>
                        {showDeleteMenu === post.id && (
                          <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px]">
                            <button
                              onClick={() => handleDeletePost(post)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Images */}
                {post.images && post.images.length > 0 && (
                  <div className="relative">
                    {post.images.length === 1 ? (
                      <img
                        src={Array.isArray(post.images) ? post.images[0] : post.images[0]?.url || post.images[0]}
                        alt="Impact"
                        className="w-full aspect-square object-cover"
                      />
                    ) : (
                      <div className="grid grid-cols-2 gap-1">
                        {post.images.slice(0, 4).map((img, index) => (
                          <div key={index} className="relative">
                            <img
                              src={Array.isArray(post.images) ? img : img?.url || img}
                              alt={`Impact ${index + 1}`}
                              className="w-full aspect-square object-cover"
                            />
                            {index === 3 && post.images.length > 4 && (
                              <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                                <span className="text-white font-semibold text-lg">
                                  +{post.images.length - 4}
                                </span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Post Content */}
                <div className="p-4">
                  {/* Caption */}
                  {post.caption && (
                    <p className="text-gray-800 text-sm leading-relaxed mb-3">
                      {post.caption}
                    </p>
                  )}

                  {/* Drive and Location Info */}
                  <div className="space-y-2">
                    {post.drive && (
                      <div className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                        <span>{post.drive}</span>
                      </div>
                    )}
                    
                    {post.location && (
                      <div className="flex items-center text-gray-500 text-xs mt-2">
                        <span>📍 {post.location}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImpactGallery;