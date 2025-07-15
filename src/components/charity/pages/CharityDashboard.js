import React, { useState } from 'react';
import Dashboard from './Dashboard';
import CreatePostPage from './CreatePostPage';
import AddItemsPage from './AddItemsPage';
import SuccessPage from './SuccessPage';
import AIAnalysisPage from './AIAnalysisPage';
import ProfilePage from './ProfilePage';
import DriveDetailsPage from './DriveDetailsPage';
import { createPost, getAIRecommendations } from '../../../api/posts';
import { itemCategories } from '../constants/categories';

const CharityDashboard = ({ user, onLogout }) => {
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
  const [ongoingDrives, setOngoingDrives] = useState([
    {
      id: 1,
      name: "Emergency Food Relief",
      vendor: "Local Food Bank",
      description: "Providing essential food supplies to families affected by recent flooding",
      price: "SGD $15,500",
      expiry: "2 Months",
      image: "/api/placeholder/120/100"
    },
    {
      id: 2,
      name: "Winter Clothing Drive",
      vendor: "Community Center",
      description: "Collecting warm clothing for homeless individuals during winter season",
      price: "SGD $8,200",
      expiry: "3 Months",
      image: "/api/placeholder/120/100"
    },
    {
      id: 3,
      name: "School Supplies Support",
      vendor: "Education Foundation",
      description: "Supporting underprivileged students with essential school materials",
      price: "SGD $12,750",
      expiry: "1 Month",
      image: "/api/placeholder/120/100"
    }
  ]);

  // Handle post creation
  const handlePostNeed = async () => {
  console.log('🚀 handlePostNeed called!');
  console.log('📝 Form data:', formData);
  console.log('📦 Added items:', addedItems);

  if (!formData.headline || !formData.storyDescription) {
    alert('Please fill in all required fields');
    return;
  }

  setLoading(true);
  try {
    const postData = {
      charityId: user.id || user._id || 'temp-id',
      charityName: user.name || 'Test Charity',
      headline: formData.headline,
      storyDescription: formData.storyDescription,
      deadline: formData.deadline,
      items: addedItems,
      imageBase64: selectedImage
    };

    console.log('📤 Sending post data:', postData);

    const result = await createPost(postData);
    
    console.log('📥 Server response:', result);

    if (result.success) {
      console.log('🎉 Post successful! Adding to dashboard and navigating to success...');
      
      // Add the new post to dashboard
      const newDrive = {
        id: Date.now(),
        name: formData.headline,
        vendor: user.name || 'Your Organization',
        description: formData.storyDescription,
        price: "Seeking donations",
        expiry: formData.deadline || "Open-ended",
        image: selectedImage || "/api/placeholder/120/100",
        items: addedItems
      };
      
      setOngoingDrives([newDrive, ...ongoingDrives]);
      
      // Reset form
      setFormData({ headline: '', storyDescription: '', deadline: '' });
      setAddedItems([]);
      setSelectedImage(null);
      
      // Navigate to success page (with timeout)
      setCurrentPage('success');
    } else {
      throw new Error(result.error || 'Failed to create post');
    }

  } catch (error) {
    console.error('❌ Error creating post:', error);
    alert('Error creating post. Please try again.');
  } finally {
    setLoading(false);
  }
};

  // Handle AI recommendations
  const handleAIRecommendation = async () => {
    if (!formData.storyDescription) {
      alert('Please enter a story description first');
      return;
    }

    try {
      setLoading(true);
      const result = await getAIRecommendations(
        formData.storyDescription,
        formData.headline,
        user.location || 'Not specified'
      );

      if (result.success && result.analysis.recommended_items) {
        const recommendedItems = result.analysis.recommended_items.map((item, index) => ({
          id: Date.now() + index,
          name: item.item,
          category: 'AI Recommended',
          quantity: parseInt(item.quantity) || 1
        }));

        setAddedItems([...addedItems, ...recommendedItems]);
        alert(`Added ${recommendedItems.length} AI-recommended items!`);
      }
    } catch (error) {
      console.error('Error getting AI recommendations:', error);
      alert('Error getting recommendations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle adding items
  const handleAddItem = () => {
    if (selectedItemCategory && itemName && quantity > 0) {
      const newItem = {
        id: Date.now(),
        category: selectedItemCategory,
        name: itemName,
        quantity: quantity
      };
      setAddedItems([...addedItems, newItem]);
      
      // Reset add item form
      setSelectedItemCategory('');
      setItemName('');
      setQuantity(0);
      
      // Go back to create post
      setCurrentPage('createPost');
    }
  };

  // AI Analysis functions
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
    setCurrentPage('createPost');

    // Reset AI state
    setArticleText('');
    setAiAnalysis(null);
    setGeneratedItems([]);
  };

  const handleDriveClick = (drive) => {
    setSelectedDrive(drive);
    setCurrentPage('driveDetails');
  };

  // Render the appropriate page
  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <Dashboard
            showMore={showMore}
            setShowMore={setShowMore}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            ongoingDrives={ongoingDrives}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            onDriveClick={handleDriveClick}
          />
        );

      case 'createPost':
        return (
          <CreatePostPage
            selectedImage={selectedImage}
            setSelectedImage={setSelectedImage}
            formData={formData}
            setFormData={setFormData}
            addedItems={addedItems}
            setAddedItems={setAddedItems}
            onBack={() => setCurrentPage('dashboard')}
            onAddItems={() => setCurrentPage('addItems')}
            onPostNeed={handlePostNeed}
            onAIRecommendation={() => setCurrentPage('aiAnalysis')}
          />
        );

      case 'addItems':
        return (
          <AddItemsPage
            selectedItemCategory={selectedItemCategory}
            setSelectedItemCategory={setSelectedItemCategory}
            itemName={itemName}
            setItemName={setItemName}
            quantity={quantity}
            setQuantity={setQuantity}
            onBack={() => setCurrentPage('createPost')}
            onAddItem={handleAddItem}
            onPostNeed={handlePostNeed}
            itemCategories={itemCategories}
          />
        );

      case 'success':
        return (
          <SuccessPage onNavigate={setCurrentPage} />
        );

      case 'aiAnalysis':
        return (
          <AIAnalysisPage
            articleText={articleText}
            setArticleText={setArticleText}
            aiAnalysis={aiAnalysis}
            generatedItems={generatedItems}
            setGeneratedItems={setGeneratedItems}
            onBack={() => setCurrentPage('createPost')}
            onAnalyze={analyzeArticle}
            onUseItems={useGeneratedItems}
          />
        );

      case 'profile':
        return (
          <ProfilePage
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            onLogout={onLogout}
          />
        );

      case 'driveDetails':
        return (
          <DriveDetailsPage
            drive={selectedDrive}
            onBack={() => setCurrentPage('dashboard')}
          />
        );

      default:
        return (
          <Dashboard
            showMore={showMore}
            setShowMore={setShowMore}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            ongoingDrives={ongoingDrives}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            onDriveClick={handleDriveClick}
          />
        );
    }
  };

  return (
    <>
      {renderPage()}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg">
            <p className="text-gray-700">Creating post...</p>
          </div>
        </div>
      )}
    </>
  );
};

export default CharityDashboard;