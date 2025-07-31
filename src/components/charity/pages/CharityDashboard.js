import React, { useState } from 'react';
import { LogOut } from 'lucide-react';
import Dashboard from './Dashboard';
import CreatePostPage from './CreatePostPage';
import AddItemsPage from './AddItemsPage';
import SuccessPage from './SuccessPage';
import AIAnalysisPage from './AIAnalysisPage';
import ProfilePage from './ProfilePage';
import DriveDetailsPage from './DriveDetailsPage';
import SelectPostType from './SelectPostType';
import ImpactPostDrafting from './ImpactPostDrafting';
import ImpactGallery from './ImpactGallery';
import { createPost, getAIRecommendations, getCharityPosts } from '../../../api/posts';
import { deletePost, createImpactPost, getImpactPosts } from '../../../firebase/posts';
import { itemCategories } from '../constants/categories';

const CharityDashboard = ({ user, onLogout, onUserUpdate }) => {
  // Page navigation
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [loading, setLoading] = useState(false);

  // Create post form state
  const [selectedImage, setSelectedImage] = useState(null);
  const [formData, setFormData] = useState({
    headline: '',
    storyDescription: '',
    deadline: ''
  });
  const [addedItems, setAddedItems] = useState([]);

  // Add items page state
  const [selectedItemCategory, setSelectedItemCategory] = useState('');
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState(0);

  // AI Analysis state
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [articleText, setArticleText] = useState('');
  const [generatedItems, setGeneratedItems] = useState([]);

  // Dashboard state
  const [showMore, setShowMore] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Natural Disasters');
  const [selectedDrive, setSelectedDrive] = useState(null);

  // Impact posts state
  const [impactPosts, setImpactPosts] = useState([]);
  const [selectedImpactPost, setSelectedImpactPost] = useState(null);

  // Mock data as default state + Firebase posts
  const [ongoingDrives, setOngoingDrives] = useState([
    {
      id: 1,
      name: "Emergency Food Relief",
      vendor: "Local Food Bank",
      description: "Providing essential food supplies to families affected by recent flooding",
      expiry: "31/12/2025",
      image: "https://images.unsplash.com/photo-1584294232067-c97f5d99eff3?q=80&w=2776&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      items: [
        { name: "Canned Food", quantity: 100 },
        { name: "Rice Bags", quantity: 50 },
        { name: "Water Bottles", quantity: 200 }
      ]
    },
    {
      id: 2,
      name: "Winter Clothing Drive",
      vendor: "Community Center",
      description: "Collecting warm clothing for homeless individuals during winter season",
      expiry: "31/12/2025",
      image: "https://images.unsplash.com/photo-1518398046578-8cca57782e17?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      items: [
        { name: "Winter Coats", quantity: 30 },
        { name: "Blankets", quantity: 50 },
        { name: "Gloves", quantity: 100 }
      ]
    },
    {
      id: 3,
      name: "School Supplies Support",
      vendor: "Education Foundation",
      description: "Supporting underprivileged students with essential school materials",
      expiry: "1/6/2025",
      image: "https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=120&h=100&fit=crop",
      items: [
        { name: "Notebooks", quantity: 200 },
        { name: "Pens", quantity: 500 },
        { name: "Backpacks", quantity: 50 }
      ]
    }
  ]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  // Load user's posts and impact posts on component mount
  React.useEffect(() => {
    const loadUserData = async () => {
      if (user?.id) {
        try {
          setLoadingPosts(true);
          console.log('🔍 Loading posts for user:', user.id);
          
          // Load fundraising posts
          const response = await getCharityPosts(user.id);
          console.log('📥 Loaded posts from Firebase:', response);
          
          // Load impact posts
          const impactResponse = await getImpactPosts(user.id);
          console.log('📥 Loaded impact posts from Firebase:', impactResponse);
          
          // Process impact posts (keep separate from drives)
          if (impactResponse.success && impactResponse.impacts) {
            setImpactPosts(impactResponse.impacts);
            console.log('✅ Loaded impact posts:', impactResponse.impacts);
          }
          
          // Process fundraising posts only (not impact posts)
          if (response.success && response.posts && response.posts.length > 0) {
            const posts = response.posts;
            const formattedPosts = posts.map(post => ({
              id: post.id,
              name: post.headline,
              vendor: post.charityName || user.name,
              description: post.storyDescription,
              expiry: post.deadline,
              image: post.imageUrl || null,
              items: post.items || [],
              isUserPost: true
            }));
            
            console.log('✅ Formatted user posts:', formattedPosts);
            
            // Reset to mock data first, then add user posts to front
            setOngoingDrives(prev => {
              // Get the mock data (last 3 items should be mock data)
              const mockData = prev.length > 0 ? prev.filter(item => !item.isUserPost) : [
                {
                  id: 1,
                  name: "Emergency Food Relief",
                  vendor: "Local Food Bank",
                  description: "Providing essential food supplies to families affected by recent flooding",
                  expiry: "31/12/2025",
                  image: "https://images.unsplash.com/photo-1584294232067-c97f5d99eff3?q=80&w=2776&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                  items: [
                    { name: "Canned Food", quantity: 100 },
                    { name: "Rice Bags", quantity: 50 },
                    { name: "Water Bottles", quantity: 200 }
                  ]
                },
                {
                  id: 2,
                  name: "Winter Clothing Drive",
                  vendor: "Community Center",
                  description: "Collecting warm clothing for homeless individuals during winter season",
                  expiry: "31/12/2025",
                  image: "https://images.unsplash.com/photo-1518398046578-8cca57782e17?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                  items: [
                    { name: "Winter Coats", quantity: 30 },
                    { name: "Blankets", quantity: 50 },
                    { name: "Gloves", quantity: 100 }
                  ]
                },
                {
                  id: 3,
                  name: "School Supplies Support",
                  vendor: "Education Foundation",
                  description: "Supporting underprivileged students with essential school materials",
                  expiry: "1/6/2025",
                  image: "https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=120&h=100&fit=crop",
                  items: [
                    { name: "Notebooks", quantity: 200 },
                    { name: "Pens", quantity: 500 },
                    { name: "Backpacks", quantity: 50 }
                  ]
                }
              ];
              
              return [...formattedPosts, ...mockData];
            });
          } else {
            console.log('📭 No user posts found, showing only mock data');
          }
        } catch (error) {
          console.error('❌ Error loading user posts:', error);
        } finally {
          setLoadingPosts(false);
        }
      } else {
        setLoadingPosts(false);
      }
    };

    loadUserData();
  }, [user?.id]);

  // Image upload handler
  const handleImageUpload = (file) => {
    if (file) {
      setSelectedImage(URL.createObjectURL(file));
    }
  };

  // Logout handler with confirmation
  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to log out?");
    if (confirmLogout) {
      onLogout();
    }
  };

  // Add item function
  const handleAddItem = () => {
    if (!selectedItemCategory || !itemName || quantity <= 0) {
      alert('Please fill in all fields correctly!');
      return;
    }

    const newItem = {
      id: Date.now(),
      category: selectedItemCategory,
      name: itemName,
      quantity: quantity
    };

    setAddedItems([...addedItems, newItem]);
    
    // Reset form
    setSelectedItemCategory('');
    setItemName('');
    setQuantity(0);
    
    // Go back to create post page  
    setCurrentPage('RequestHelp');
  };

  // Post creation function with image support
  const handlePostNeed = async () => {
    if (!formData.headline || !formData.storyDescription || !formData.deadline) {
      alert('Please fill in all required fields!');
      return;
    }

    if (addedItems.length === 0) {
      alert('Please add at least one item to your post!');
      return;
    }

    try {
      setLoading(true);
      
      const postData = {
        headline: formData.headline,
        storyDescription: formData.storyDescription,
        deadline: formData.deadline,
        items: addedItems,
        image: selectedImage,
        author: user?.name || 'Anonymous',
        location: 'Singapore',
        charityId: user?.id,
        charityName: user?.name
      };

      // Call your API to create the post
      const response = await createPost(postData);
      
      if (response.success) {
        // Create new post for dashboard with uploaded image
        const newPost = {
          id: response.post.id,
          name: formData.headline,
          vendor: user?.name,
          description: formData.storyDescription,
          expiry: formData.deadline,
          image: response.post.imageUrl || selectedImage,
          items: addedItems,
          isUserPost: true // Mark as user post for delete button
        };
        
        // Add to the top of ongoing drives
        setOngoingDrives([newPost, ...ongoingDrives]);

        // Reset form data
        setFormData({
          headline: '',
          storyDescription: '',
          deadline: ''
        });
        setAddedItems([]);
        setSelectedImage(null);
        
        // Navigate to success page
        setCurrentPage('success');
      } else {
        throw new Error(response.error || 'Failed to create post');
      }
      
    } catch (error) {
      console.error('Error creating post:', error);
      alert(`Failed to create post: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle impact post creation (Firebase for text, local for images)
  const handleImpactPost = async (postData) => {
    try {
      setLoading(true);
      
      const impactData = {
        images: postData.images || [],
        caption: postData.caption || '',
        drive: postData.drive || '',
        location: postData.location || '',
        charityId: user?.id,
        charityName: user?.name
      };
      
      // Always save text to Firebase and images locally (due to CORS issues)
      const response = await createImpactPost(impactData);
      
      if (response.success) {
        // Firebase text save successful - combine with local images
        const newImpactPost = {
          ...response.impact,
          author: user?.name || 'Anonymous',
          timestamp: response.impact.createdAt,
          images: postData.images?.map(img => img.url) || [], // Always use local images
          syncedToFirebase: true
        };
        
        setImpactPosts([newImpactPost, ...impactPosts]);
        console.log('✅ Impact post text saved to Firebase, images stored locally');
        
      } else {
        // Firebase save failed - complete local fallback
        console.log('⚠️ Firebase save failed, using complete local fallback');
        const localImpactPost = {
          id: Date.now(),
          caption: postData.caption || '',
          drive: postData.drive || '',
          location: postData.location || '',
          author: user?.name || 'Anonymous',
          timestamp: new Date().toISOString(),
          images: postData.images?.map(img => img.url) || [],
          localOnly: true // Mark as completely local-only
        };
        
        setImpactPosts([localImpactPost, ...impactPosts]);
        console.log('✅ Impact post saved completely locally');
      }
      
      // Navigate to success page
      setCurrentPage('success');
      
    } catch (error) {
      console.error('Error creating impact post:', error);
      
      // Complete fallback - save everything locally
      const fallbackPost = {
        id: Date.now(),
        caption: postData.caption || '',
        drive: postData.drive || '',
        location: postData.location || '',
        author: user?.name || 'Anonymous',
        timestamp: new Date().toISOString(),
        images: postData.images?.map(img => img.url) || [],
        localOnly: true
      };
      
      setImpactPosts([fallbackPost, ...impactPosts]);
      setCurrentPage('success');
      console.log('✅ Impact post saved locally (complete fallback)');
    } finally {
      setLoading(false);
    }
  };

  // AI Analysis Functions
  const analyzeArticle = async () => {
    if (!articleText.trim()) {
      alert('Please enter article text first!');
      return;
    }

    try {
      setAiAnalysis({ loading: true });

      const response = await fetch('http://localhost:5001/api/ai-recommendation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: articleText,
          headline: 'Article Analysis',
          location: 'From article'
        })
      });

      const data = await response.json();

      if (data.success && data.analysis.recommended_items) {
        setAiAnalysis(data.analysis);
        setGeneratedItems(data.analysis.recommended_items);
      } else {
        throw new Error(data.error || 'Failed to analyze article');
      }

    } catch (error) {
      console.error('❌ Analysis Error:', error);
      setAiAnalysis({
        error: `Failed to analyze article: ${error.message}`
      });
    }
  };

  const useGeneratedItems = () => {
    const convertedItems = generatedItems.map((item, index) => {
      let quantityNumber = 1;
      
      if (typeof item.quantity === 'string') {
        const match = item.quantity.match(/\d+/);
        quantityNumber = match ? parseInt(match[0]) : 1;
      } else if (typeof item.quantity === 'number') {
        quantityNumber = item.quantity;
      }

      return {
        id: Date.now() + index,
        category: 'AI Generated',
        name: item.item,
        quantity: quantityNumber
      };
    });

    setAddedItems([...addedItems, ...convertedItems]);
    setCurrentPage('RequestHelp');

    // Reset AI state
    setArticleText('');
    setAiAnalysis(null);
    setGeneratedItems([]);
  };

  const handleDriveClick = (drive) => {
    setSelectedDrive(drive);
    setCurrentPage('driveDetails');
  };

  const handleImpactPostClick = (post) => {
    setSelectedImpactPost(post);
    setCurrentPage('impactGallery');
  };

  const handleDeleteDrive = async (drive) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${drive.name}"?\n\nThis action cannot be undone.`
    );
    
    if (!confirmDelete) return;
    
    try {
      setLoading(true);
      
      await deletePost(user.id, drive.id);
      
      // Remove from local state
      setOngoingDrives(prev => prev.filter(d => d.id !== drive.id));
      
      alert('Drive deleted successfully!');
      
    } catch (error) {
      console.error('Error deleting drive:', error);
      alert(`Failed to delete drive: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Logout Icon Component
  const LogoutIcon = () => (
    <button
      onClick={handleLogout}
      className="absolute top-6 right-4 flex items-center gap-1 text-sm text-gray-500 hover:text-red-600 transition-colors"
      aria-label="Log out"
      title="Logout"
    >
      <LogOut className="w-5 h-5" />
    </button>
  );

  return (
    <>
      {/* Logout Icon - Always visible */}
      <LogoutIcon />
      
      {currentPage === 'driveDetails' && (
        <DriveDetailsPage
          drive={selectedDrive}
          onBack={() => setCurrentPage('dashboard')}
        />
      )}

      {currentPage === 'success' && (
        <SuccessPage onNavigate={() => setCurrentPage('dashboard')} />
      )}
      
      {currentPage === 'profile' && (
        <ProfilePage 
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          onLogout={onLogout}
          user={user}
          onUserUpdate={onUserUpdate}
        />
      )}
      
{currentPage === 'aiAnalysis' && (
        <AIAnalysisPage
          articleText={articleText}
          setArticleText={setArticleText}
          aiAnalysis={aiAnalysis}
          generatedItems={generatedItems}
          setGeneratedItems={setGeneratedItems}
          onBack={() => setCurrentPage('RequestHelp')}
          onAnalyze={analyzeArticle}
          onUseItems={useGeneratedItems}
        />
      )}

      {currentPage === 'selectPostType' && (
        <SelectPostType
          setCurrentPage={setCurrentPage}
          onBack={() => setCurrentPage('dashboard')}
        />
      )}

      {currentPage === 'ImpactPostDrafting' && (
        <ImpactPostDrafting
          onBack={() => setCurrentPage('selectPostType')}
          onShare={handleImpactPost}
          availableDrives={ongoingDrives.map(drive => drive.name)}
        />
      )}

      {currentPage === 'impactGallery' && (
        <ImpactGallery
          impactPosts={impactPosts}
          selectedPost={selectedImpactPost}
          onBack={() => {
            setSelectedImpactPost(null);
            setCurrentPage('dashboard');
          }}
        />
      )}
      
      {currentPage === 'addItems' && (
        <AddItemsPage
          selectedItemCategory={selectedItemCategory}
          setSelectedItemCategory={setSelectedItemCategory}
          itemName={itemName}
          setItemName={setItemName}
          quantity={quantity}
          setQuantity={setQuantity}
          onBack={() => setCurrentPage('RequestHelp')}
          onAddItem={handleAddItem}
          onPostNeed={handlePostNeed}
          itemCategories={itemCategories}
        />
      )}
      
      {currentPage === 'RequestHelp' && (
        <CreatePostPage
          selectedImage={selectedImage}
          setSelectedImage={setSelectedImage}
          formData={formData}
          setFormData={setFormData}
          addedItems={addedItems}
          setAddedItems={setAddedItems}
          onBack={() => setCurrentPage('selectPostType')}
          onAddItems={() => setCurrentPage('addItems')}
          onPostNeed={handlePostNeed}
          onAIRecommendation={() => setCurrentPage('aiAnalysis')}
          onImageUpload={handleImageUpload}
        />
      )}
      
      {currentPage === 'dashboard' && (
        <Dashboard
          showMore={showMore}
          setShowMore={setShowMore}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          ongoingDrives={ongoingDrives}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          onDriveClick={handleDriveClick}
          onDeleteDrive={handleDeleteDrive}
          user={user}
          loadingPosts={loadingPosts}
          impactPosts={impactPosts}
          onImpactPostClick={handleImpactPostClick}
        />
      )}
    </>
  );
};

export default CharityDashboard;