import React, { useState } from 'react';
import { LogOut } from 'lucide-react';
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

  // Logout handler with confirmation
  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to log out?");
    if (confirmLogout) {
      onLogout();
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