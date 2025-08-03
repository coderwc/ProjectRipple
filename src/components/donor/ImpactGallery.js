import React, { useState, useEffect } from 'react';
import { ArrowLeft, Heart, Package } from 'lucide-react';
import { getImpactPosts } from '../../firebase/posts';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';

const ImpactGallery = ({ onBack, postId }) => {
  const [impactPosts, setImpactPosts] = useState([]);
  const [charityInfo, setCharityInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchImpactPosts = async () => {
      try {
        setLoading(true);
        
        // First get the charity post to get charity ID and drive name
        const postDoc = await getDoc(doc(db, 'charities', postId));
        if (!postDoc.exists()) {
          console.log('Post not found');
          return;
        }
        
        const postData = postDoc.data();
        const charityId = postData.charityId || postData.authorId;
        const driveName = postData.headline;
        
        setCharityInfo({
          name: postData.charityName,
          driveName: driveName
        });
        
        // Fetch impact posts for this charity
        const response = await getImpactPosts(charityId);
        
        if (response.success && response.impacts) {
          // Filter impact posts by drive name to show only relevant ones
          const relevantPosts = response.impacts.filter(post => 
            post.drive === driveName
          );
          
          setImpactPosts(relevantPosts);
          console.log('✅ Loaded impact posts for drive:', driveName, relevantPosts);
        }
        
      } catch (error) {
        console.error('Error fetching impact posts:', error);
      } finally {
        setLoading(false);
      }
    };

    if (postId) {
      fetchImpactPosts();
    }
  }, [postId]);

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <div className="max-w-sm mx-auto p-4 bg-gray-50 min-h-screen">
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
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-1 hover:bg-gray-100 rounded">
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <div>
            <span className="text-lg font-medium text-gray-900">Impact Gallery</span>
            {charityInfo && (
              <p className="text-sm text-gray-500">{charityInfo.driveName}</p>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {loading ? (
          <div className="text-center py-8">
            <div className="text-gray-500">Loading impact stories...</div>
          </div>
        ) : impactPosts.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Impact Stories Yet</h3>
            <p className="text-gray-500">This charity hasn't shared any impact stories for this drive yet.</p>
          </div>
        ) : (
          impactPosts
            .sort((a, b) => new Date(b.timestamp || b.createdAt) - new Date(a.timestamp || a.createdAt))
            .map((post) => (
              <div key={post.id} className="bg-white rounded-lg p-4 shadow-sm">
                <p className="text-xs text-gray-400 mb-2">{formatDate(post.timestamp || post.createdAt)}</p>
                
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-sm">
                      {charityInfo?.name?.charAt(0).toUpperCase() || 'C'}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{charityInfo?.name || 'Charity'}</p>
                    <p className="text-xs text-gray-500">Impact Update</p>
                  </div>
                </div>

                {/* Caption/Message */}
                {post.caption && (
                  <div className="bg-gray-50 rounded-md p-3 text-sm text-gray-700 mb-3">
                    <p className="text-xs text-gray-500 mb-1">Message from charity:</p>
                    <p>{post.caption}</p>
                  </div>
                )}

                {/* Location */}
                {post.location && (
                  <p className="text-sm text-gray-600 mb-2">
                    <span className="font-semibold">📍 Location:</span> {post.location}
                  </p>
                )}

                {/* Drive Info */}
                {post.drive && (
                  <div className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium mb-3">
                    <span>{post.drive}</span>
                  </div>
                )}

                {/* Images */}
                {post.images && post.images.length > 0 && (
                  <div className="space-y-2">
                    {post.images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Impact ${index + 1}`}
                        className="w-full rounded-lg object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ))}
                  </div>
                )}

                {/* No images fallback */}
                {(!post.images || post.images.length === 0) && (
                  <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <Heart className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500 text-sm">Impact story shared</p>
                    </div>
                  </div>
                )}
              </div>
            ))
        )}
      </div>
    </div>
  );
};

export default ImpactGallery;