import React, { useState } from 'react';
import { LogOut } from 'lucide-react';
import Dashboard from './Dashboard';
import RequestHelp from './RequestHelp'; // ✅ Updated import name
import AddItemsPage from './AddItemsPage';
import SuccessPage from './SuccessPage';
import AIAnalysisPage from './AIAnalysisPage';
import ProfilePage from './ProfilePage';
import DriveDetailsPage from './DriveDetailsPage';
import SelectPostType from './SelectPostType';
import { createPost } from '../../../api/posts';
import { itemCategories } from '../constants/categories';
import ImpactPostDrafting from './ImpactPostDrafting.js';


const CharityDashboard = ({ user, onLogout }) => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [selectedPostType, setSelectedPostType] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [formData, setFormData] = useState({
    headline: '',
    storyDescription: '',
    deadline: ''
  });
  const [addedItems, setAddedItems] = useState([]);
  const [selectedItemCategory, setSelectedItemCategory] = useState('');
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState(0);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [articleText, setArticleText] = useState('');
  const [generatedItems, setGeneratedItems] = useState([]);
  const [showMore, setShowMore] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Natural Disasters');
  const [selectedDrive, setSelectedDrive] = useState(null);
  const [ongoingDrives, setOngoingDrives] = useState([
    {
      id: 1,
      name: "Emergency Food Relief",
      vendor: "Local Food Bank",
      description: "Providing essential food supplies to families affected by recent flooding",
      expiry: "2 Months",
      image: "/api/placeholder/120/100",
      items: [
        { name: "Canned Food", quantity: 100 },
        { name: "Rice Bags", quantity: 50 },
        { name: "Water Bottles", quantity: 200 }
      ]
    }
  ]);

  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to log out?");
    if (confirmLogout) onLogout();
  };

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
    setSelectedItemCategory('');
    setItemName('');
    setQuantity(0);
    setCurrentPage('createPost');
  };

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
        charityId: user?.id || Date.now(),
        charityName: user?.name || 'Test Charity'
      };

      const response = await createPost(postData);

      if (response.success) {
        const newPost = {
          id: Date.now(),
          name: formData.headline,
          vendor: user?.name || 'Hope Foundation',
          description: formData.storyDescription,
          expiry: formData.deadline,
          image: selectedImage || "/api/placeholder/120/100",
          items: addedItems
        };

        setOngoingDrives([newPost, ...ongoingDrives]);
        setFormData({ headline: '', storyDescription: '', deadline: '' });
        setAddedItems([]);
        setSelectedImage(null);
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
      setAiAnalysis({ error: `Failed to analyze article: ${error.message}` });
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
    setArticleText('');
    setAiAnalysis(null);
    setGeneratedItems([]);
    setCurrentPage('createPost');
  };

  const handleDriveClick = (drive) => {
    setSelectedDrive(drive);
    setCurrentPage('driveDetails');
  };

  const handlePostTypeSelect = (type) => {
    setSelectedPostType(type);
    setCurrentPage('createPost');
  };

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
      <LogoutIcon />

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

      {currentPage === 'selectPostType' && (
        <SelectPostType
          onSelect={handlePostTypeSelect}
          setCurrentPage={setCurrentPage}
          onBack={() => setCurrentPage('dashboard')}
        />
      )}

      {currentPage === 'RequestHelp' && (
        <RequestHelp
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

      {currentPage === 'aiAnalysis' && (
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
      )}

      {currentPage === 'success' && (
        <SuccessPage onNavigate={() => setCurrentPage('dashboard')} />
      )}

      {currentPage === 'driveDetails' && (
        <DriveDetailsPage
          drive={selectedDrive}
          onBack={() => setCurrentPage('dashboard')}
        />
      )}

      {currentPage === 'profile' && (
        <ProfilePage
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          onLogout={onLogout}
        />
      )}

    {currentPage === 'ImpactPostDrafting' && (
      <ImpactPostDrafting
        onBack={() => setCurrentPage('selectPostType')}
        onShare={() => setCurrentPage('success')} // or another page if needed (TO BE MADE)
  />
)}

    </>
  );
};

export default CharityDashboard;
