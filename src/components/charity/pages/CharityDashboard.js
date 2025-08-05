import React, { useState } from 'react';
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
import { createPost, getCharityPosts } from '../../../api/posts';
import { deletePost, createImpactPost, getImpactPosts, deleteImpactPost, updateImpactPost } from '../../../firebase/posts';
import { itemCategories } from '../constants/categories';

const CharityDashboard = ({ user, onLogout, onUserUpdate }) => {
  // Page navigation
  const [currentPage, setCurrentPage] = useState('dashboard');

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
  const [selectedDrive, setSelectedDrive] = useState(null);

  // Impact posts state
  const [impactPosts, setImpactPosts] = useState([]);
  const [selectedImpactPost, setSelectedImpactPost] = useState(null);
  const [driveFilter, setDriveFilter] = useState(null); // For filtering impact posts by drive

  // State for real backend data only
  const [ongoingDrives, setOngoingDrives] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  // Load user's posts and impact posts on component mount
  React.useEffect(() => {
    const loadUserData = async () => {
      if (user?.id) {
        try {
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
              donationsReceived: post.donationsReceived || 0,
              donorCount: post.donorCount || 0,
              isUserPost: true
            }));
            
            console.log('✅ Formatted user posts:', formattedPosts);
            
            // Set only real backend data
            setOngoingDrives(formattedPosts);
          } else {
            console.log('📭 No user posts found');
            setOngoingDrives([]);
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
  }, [user?.id, user?.name]);

  // Image upload handler
  const handleImageUpload = (file) => {
    if (file) {
      setSelectedImage(URL.createObjectURL(file));
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
      
  const postData = {
  headline: formData.headline,
  storyDescription: formData.storyDescription,
  deadline: formData.deadline,
  category: formData.category, // ✅ ADD THIS LINE
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
    }
  };

  // Handle impact post creation (Firebase for text and images)
  const handleImpactPost = async (postData) => {
    try {
      
      const impactData = {
        images: postData.images || [],
        caption: postData.caption || '',
        drive: postData.drive || '',
        location: postData.location || '',
        charityId: user?.id,
        charityName: user?.name
      };
      
      // Save both text and images to Firebase
      const response = await createImpactPost(impactData);
      
      if (response.success) {
        // Firebase save successful
        const newImpactPost = {
          ...response.impact,
          author: user?.name || 'Anonymous',
          authorName: user?.name || 'Anonymous',
          timestamp: response.impact.createdAt,
          syncedToFirebase: true
        };
        
        setImpactPosts([newImpactPost, ...impactPosts]);
        console.log('✅ Impact post saved to Firebase (text and images)');
        
      } else {
        // Firebase save failed - local fallback with blob URLs
        console.log('⚠️ Firebase save failed, using local fallback');
        const localImpactPost = {
          id: Date.now(),
          caption: postData.caption || '',
          drive: postData.drive || '',
          location: postData.location || '',
          author: user?.name || 'Anonymous',
          authorName: user?.name || 'Anonymous',
          timestamp: new Date().toISOString(),
          images: postData.images?.map(img => img.url) || [],
          localOnly: true // Mark as completely local-only
        };
        
        setImpactPosts([localImpactPost, ...impactPosts]);
        console.log('✅ Impact post saved locally');
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
        authorName: user?.name || 'Anonymous',
        timestamp: new Date().toISOString(),
        images: postData.images?.map(img => img.url) || [],
        localOnly: true
      };
      
      setImpactPosts([fallbackPost, ...impactPosts]);
      setCurrentPage('success');
      console.log('✅ Impact post saved locally (complete fallback)');
    } finally {
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

      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5001/api'}/ai-recommendation`, {
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

  // Function to categorize AI generated items properly
  const categorizeItem = (itemName) => {
    const name = itemName.toLowerCase();
    
    // Food category
    if (name.includes('food') || name.includes('meal') || name.includes('ration') || 
        name.includes('nutrition') || name.includes('feed') || name.includes('cooking') ||
        name.includes('rice') || name.includes('bread') || name.includes('packages')) {
      return 'Food';
    }
    
    // Water category  
    if (name.includes('water') || name.includes('drink') || name.includes('hydration') ||
        name.includes('clean water') || name.includes('drinking')) {
      return 'Water';
    }
    
    // Shelter category
    if (name.includes('tent') || name.includes('shelter') || name.includes('blanket') || 
        name.includes('housing') || name.includes('mattress') || name.includes('sleeping') ||
        name.includes('emergency shelter') || name.includes('tarp') || name.includes('bedding')) {
      return 'Shelter';
    }
    
    // Medical Supplies category
    if (name.includes('medical') || name.includes('health') || name.includes('medicine') || 
        name.includes('first aid') || name.includes('bandage') || name.includes('kit') ||
        name.includes('hospital') || name.includes('treatment') || name.includes('care') ||
        (name.includes('supplies') && (name.includes('medical') || name.includes('health')))) {
      return 'Medical Supplies';
    }
    
    // Sanitation category
    if (name.includes('hygiene') || name.includes('sanitation') || name.includes('soap') || 
        name.includes('toilet') || name.includes('cleaning') || name.includes('waste') ||
        name.includes('personal care') || name.includes('toothbrush') || name.includes('shampoo')) {
      return 'Sanitation';
    }
    
    // Default to Others for anything else (tools, electronics, etc.)
    return 'Others';
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

      const category = categorizeItem(item.item);
      console.log(`🏷️ Categorizing "${item.item}" -> "${category}"`);
      
      return {
        id: Date.now() + index,
        category: category,
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
    setDriveFilter(null); // Show all impact posts
    setCurrentPage('impactGallery');
  };

  const handleDriveImpactClick = (driveName) => {
    setSelectedImpactPost(null);
    setDriveFilter(driveName); // Filter impact posts by drive name
    setCurrentPage('impactGallery');
  };

  const handleDeleteDrive = async (drive) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${drive.name}"?\n\nThis action cannot be undone.`
    );
    
    if (!confirmDelete) return;
    
    try {
      
      await deletePost(user.id, drive.id);
      
      // Remove from local state
      setOngoingDrives(prev => prev.filter(d => d.id !== drive.id));
      
      alert('Drive deleted successfully!');
      
    } catch (error) {
      console.error('Error deleting drive:', error);
      alert(`Failed to delete drive: ${error.message}`);
    } finally {
    }
  };

  const handleDeleteImpactPost = async (post) => {
    try {
      
      await deleteImpactPost(user.id, post.id);
      
      // Remove from local state
      setImpactPosts(prev => prev.filter(p => p.id !== post.id));
      
      console.log('✅ Impact post deleted successfully');
      
    } catch (error) {
      console.error('Error deleting impact post:', error);
      throw error;
    } finally {
    }
  };

  const handleUpdateImpactPost = async (postId, updateData) => {
    try {
      
      await updateImpactPost(postId, updateData);
      
      // Update local state
      setImpactPosts(prev => prev.map(post => 
        post.id === postId 
          ? { ...post, ...updateData, updatedAt: new Date().toISOString() }
          : post
      ));
      
      console.log('✅ Impact post updated successfully');
      
    } catch (error) {
      console.error('Error updating impact post:', error);
      throw error;
    } finally {
    }
  };

  return (
    <>
      
      {currentPage === 'driveDetails' && (
        <DriveDetailsPage
          drive={selectedDrive}
          onBack={() => setCurrentPage('dashboard')}
          user={user}
          onDriveImpactClick={handleDriveImpactClick}
          impactPosts={impactPosts}
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
          driveFilter={driveFilter}
          onBack={() => {
            setSelectedImpactPost(null);
            setDriveFilter(null);
            setCurrentPage('dashboard');
          }}
          onDeletePost={handleDeleteImpactPost}
          onUpdatePost={handleUpdateImpactPost}
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