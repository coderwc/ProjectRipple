import React, { useState } from 'react';
import DonorHome from './DonorHome';
import CategoryFeed from './CategoryFeed';
import CharityPost from './CharityPost';
import AvailableVendors from './AvailableVendors';
import VendorProducts from './VendorProducts';
import { useCart } from '../shared/CartContext';

function DonorApp({ user, onLogout }) {
  const [currentView, setCurrentView] = useState('home');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedPost, setSelectedPost] = useState(null);
  const [selectedCharity, setSelectedCharity] = useState(null);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const { setCharity, clearCart } = useCart();

  const handleSelectCategory = (categoryName) => {
    setSelectedCategory(categoryName);
    setCurrentView('category');
  };

  const handleBackToHome = () => {
    setCurrentView('home');
    setSelectedCategory('');
    setSelectedPost(null);
    setSelectedCharity(null);
    setSelectedVendor(null);
  };

  const handleBackToCategory = () => {
    setCurrentView('category');
    setSelectedPost(null);
  };

  const handleSelectPost = (postId) => {
    setSelectedPost(postId);
    setCurrentView('post');
  };

  // New function to handle charity selection for shopping
  const handleCharitySelect = (charity) => {
    setSelectedCharity(charity);
    setCharity(charity); // Set charity in cart context
    setCurrentView('shop');
  };

  // New function to handle vendor selection
  const handleVendorSelect = (vendor) => {
    setSelectedVendor(vendor);
    setCurrentView('vendor');
  };

  // New function to go back to available vendors
  const handleBackToVendors = () => {
    setCurrentView('shop');
    setSelectedVendor(null);
  };

  // New function to go to cart/shopping
  const handleGoToCart = () => {
    // If no charity selected, you might want to show a charity selection first
    if (!selectedCharity) {
      // You could show a charity selection modal or navigate to a charity list
      alert('Please select a charity first to start shopping');
      return;
    }
    setCurrentView('shop');
  };

  const handleLogout = () => {
    clearCart(); // Clear cart on logout
    onLogout(); // Call the parent logout function
  };

  return (
    <div className="App">
      {currentView === 'home' && (
        <DonorHome
          user={user}
          onSelectCategory={handleSelectCategory}
          onSelectPost={handleSelectPost}
          onCharitySelect={handleCharitySelect}
          onGoToCart={handleGoToCart}
          onLogout={handleLogout}
        />
      )}
      
      {currentView === 'category' && (
        <CategoryFeed
          categoryName={selectedCategory}
          onBack={handleBackToHome}
          onSelectPost={handleSelectPost}
        />
      )}
      
      {currentView === 'post' && (
        <CharityPost
          postId={selectedPost}
          onBack={handleBackToCategory}
          onCharitySelect={handleCharitySelect} // Add this to allow shopping from charity posts
        />
      )}

      {currentView === 'shop' && (
        <AvailableVendors
          charity={selectedCharity}
          onBack={handleBackToHome}
          onSelectVendor={handleVendorSelect}
        />
      )}

      {currentView === 'vendor' && (
        <VendorProducts
          vendor={selectedVendor}
          onBack={handleBackToVendors}
          onSelectVendor={handleVendorSelect}
        />
      )}
    </div>
  );
}

export default DonorApp;