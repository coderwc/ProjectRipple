import React, { useState } from 'react';
import Dashboard from './Dashboard';
import CreatePostPage from './CreatePostPage';
import AddItemsPage from './AddItemsPage';
import SuccessPage from './SuccessPage';
import AIAnalysisPage from './AIAnalysisPage'; // Import your existing AI page
import { itemCategories } from '../constants/categories';
import ProfilePage from './ProfilePage';
import DriveDetailsPage from './DriveDetailsPage';

const CharityDashboard = ({ user, onLogout }) => {
  const [showMore, setShowMore] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedCategory, setSelectedCategory] = useState('Natural Disasters');
  const [selectedItemCategory, setSelectedItemCategory] = useState('');
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState(0);
  const [selectedImage, setSelectedImage] = useState(null);
  const [addedItems, setAddedItems] = useState([]);
  
  // AI Analysis State
  const [aiAnalysis, setAiAnalysis] = useState(null);

  const [articleText, setArticleText] = useState('');
  const [generatedItems, setGeneratedItems] = useState([]);
  const [selectedDrive, setSelectedDrive] = useState(null);
  
  const [formData, setFormData] = useState({
    headline: '',
    storyDescription: '',
    deadline: ''
  });
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

  // AI Analysis Functions
  const analyzeArticle = async () => {
    if (!articleText.trim()) {
      alert('Please enter article text first!');
      return;
    }

    try {
      setAiAnalysis({ loading: true });
      
      console.log('🌐 Calling AI API with article text...');
      
      const response = await fetch('http://localhost:5001/api/ai-recommendation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: articleText,
          headline: 'Article Analysis',
          location: 'From article'
        })
      });
      
      const data = await response.json();
      console.log('📊 AI Response:', data);
      
      if (data.success && data.analysis.recommended_items) {
        setAiAnalysis(data.analysis);
        setGeneratedItems(data.analysis.recommended_items);
      } else {
        throw new Error(data.error || 'Failed to analyze article');
      }
      
    } catch (error) {
      console.error('❌ Analysis Error:', error);
      setAiAnalysis({
        error: `Failed to analyze article: ${error.message}. Make sure your backend server is running.`
      });
    }
  };

  const useGeneratedItems = () => {
    // Convert AI generated items to your addedItems format
    const convertedItems = generatedItems.map((item, index) => {
      // Handle different data types for quantity
      let quantityNumber = 1; // Default fallback
      
      if (typeof item.quantity === 'string') {
        // Extract number from string like "100 units" or "500 packages"
        const match = item.quantity.match(/\d+/);
        quantityNumber = match ? parseInt(match[0]) : 1;
      } else if (typeof item.quantity === 'number') {
        // If it's already a number
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

  // Handle posting with success page
  const handlePostNeed = () => {
    if (formData.headline && formData.storyDescription && addedItems.length > 0) {
      const newDrive = {
        id: Date.now(),
        name: formData.headline,
        vendor: "Hope Foundation",
        description: formData.storyDescription,
        price: "SGD $0",
        expiry: formData.deadline || "TBD",
        image: selectedImage || "/api/placeholder/120/100"
      };
      
      setOngoingDrives(prev => [newDrive, ...prev]);
      setCurrentPage('success');
      
      setTimeout(() => {
        setCurrentPage('dashboard');
      }, 3000);
      
      setFormData({ headline: '', storyDescription: '', deadline: '' });
      setAddedItems([]);
      setSelectedImage(null);
    }
  };

  const handleAddItem = () => {
    if (selectedItemCategory && itemName && quantity > 0) {
      const newItem = {
        id: Date.now(),
        category: selectedItemCategory,
        name: itemName,
        quantity: quantity
      };
      setAddedItems([...addedItems, newItem]);
      setSelectedItemCategory('');
      setItemName('');
      setQuantity(0);
      setCurrentPage('createPost');
    }
  };

  
  const handleDriveClick = (drive) => {
    setSelectedDrive(drive);
    setCurrentPage('driveDetails');
  };

  return (
    <>
      {currentPage === 'driveDetails' && (
        <DriveDetailsPage
          drive={selectedDrive}
          onBack={() => setCurrentPage('dashboard')}
        />
      )}

      {currentPage === 'success' && (
        <SuccessPage onClose={() => setCurrentPage('dashboard')} />
      )}
      
      {currentPage === 'profile' && (
        <ProfilePage 
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          onLogout={onLogout}
        />
      )}
      
      {currentPage === 'aiAnalysis' && (
        <AIAnalysisPage
          articleText={articleText}
          setArticleText={setArticleText}
          aiAnalysis={aiAnalysis}
          generatedItems={generatedItems}
          setGeneratedItems={setGeneratedItems}  // ← Make sure this is included
          onBack={() => setCurrentPage('createPost')}
          onAnalyze={analyzeArticle}
          onUseItems={useGeneratedItems}
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
          onBack={() => setCurrentPage('createPost')}
          onAddItem={handleAddItem}
          onPostNeed={handlePostNeed}
          itemCategories={itemCategories}
        />
      )}
      
      {currentPage === 'createPost' && (
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
          onAIRecommendation={() => setCurrentPage('aiAnalysis')} // NEW: AI button function
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
        />
      )}
    </>
  );
};

export default CharityDashboard;