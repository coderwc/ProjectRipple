import React, { useState } from 'react';
import DonorHome from './DonorHome';
import CategoryFeed from './CategoryFeed';
import CharityPost from './CharityPost';
import CharityProfile from './CharityProfile';
import AvailableVendors from './AvailableVendors';
import VendorProducts from './VendorProducts';
import ShoppingCart from './Donorcomponents/ShoppingCart';
import Checkout from './Donorcomponents/Checkout';
import { useCart } from '../shared/CartContext';
import DonorsAndMessages from './DonorsAndMessages';
import Story from './Story'; 
import ImpactGallery from './ImpactGallery';

function DonorApp({ user, onLogout }) {
  const [currentView, setCurrentView] = useState('home');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedPost, setSelectedPost] = useState(null);
  const [selectedCharity, setSelectedCharity] = useState(null);
  const [selectedCharityId, setSelectedCharityId] = useState(null);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [selectedPostData, setSelectedPostData] = useState(null);
  const [selectedItemFilter, setSelectedItemFilter] = useState(null); // Track selected item for filtering
  const [previousView, setPreviousView] = useState('home'); // Track previous view for cart navigation
  const { setCharity, clearCart, getTotalItems } = useCart();

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
    setPreviousView('home');
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
    setSelectedItemFilter(charity.selectedItem || null); // Store the selected item filter
    setPreviousView(currentView); // Remember where we came from
    setCurrentView('shop');
  };

  // New function to handle vendor selection
  const handleVendorSelect = (vendor) => {
    setSelectedVendor(vendor);
    setPreviousView(currentView); // Remember where we came from
    setCurrentView('vendor');
  };

  // Function to handle vendor profile navigation (shows all vendor's listings)
  const handleVendorProfile = (vendor) => {
    setSelectedVendor(vendor);
    setPreviousView(currentView);
    setCurrentView('vendorProfile');
  };

  // New function to go back to available vendors
  const handleBackToVendors = () => {
    setCurrentView('shop');
    setSelectedVendor(null);
  };

  // New function to go back from available vendors to previous view
  const handleBackFromVendors = () => {
    setCurrentView(previousView || 'home');
    setSelectedVendor(null);
    setSelectedItemFilter(null); // Clear filter when going back
  };

  // Updated function to go to cart/shopping
  const handleGoToCart = () => {
    // Check if there are items in cart
    if (getTotalItems() === 0) {
      alert('Your cart is empty. Add some items first!');
      return;
    }
    
    setPreviousView(currentView); // Remember where we came from
    setCurrentView('cart');
  };

  // New function to go back from cart
  const handleBackFromCart = () => {
    // Go back to the previous view or home if no previous view
    setCurrentView(previousView || 'home');
  };

  // New function to go to checkout from cart
  const handleGoToCheckout = () => {
    setPreviousView('cart'); // Remember we came from cart
    setCurrentView('checkout');
  };

  // New function to go back from checkout to cart
  const handleBackFromCheckout = () => {
    setCurrentView('cart');
  };

  const handleLogout = () => {
    clearCart(); // Clear cart on logout
    onLogout(); // Call the parent logout function
  };

  const handleViewDonors = (postId) => {
  setSelectedPost(postId);
  setCurrentView('donorsAndMessages');
};

  const handleViewStory = (postId) => {
  setSelectedPost(postId);
  setCurrentView('story');
};

const handleViewImpactGallery = (postId) => {
  setSelectedPost(postId);
  setCurrentView('impactGallery');
};

const handleViewCharityProfile = (charityId) => {
  setSelectedCharityId(charityId);
  setPreviousView(currentView);
  setCurrentView('charityProfile');
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
  onCharitySelect={handleCharitySelect}
  onViewDonors={handleViewDonors}
  onViewStory={handleViewStory}
  onViewImpactGallery={handleViewImpactGallery}
  onViewCharityProfile={handleViewCharityProfile}
/>
)}

      {currentView === 'shop' && (
        <AvailableVendors
          charity={selectedCharity}
          itemFilter={selectedItemFilter}
          onBack={handleBackFromVendors}
          onSelectVendor={handleVendorProfile}
        />
      )}

      {currentView === 'vendor' && (
        <VendorProducts
          vendor={selectedVendor}
          onBack={handleBackToVendors}
          onSelectVendor={handleVendorProfile}
        />
      )}

      {currentView === 'vendorProfile' && (
        <VendorProducts
          vendor={selectedVendor}
          onBack={() => setCurrentView(previousView || 'shop')}
          onSelectVendor={handleVendorProfile}
          isProfile={true}
        />
      )}

      {currentView === 'cart' && (
        <ShoppingCart
          onGoBack={handleBackFromCart}
          onGoToCheckout={handleGoToCheckout}
        />
      )}

      {currentView === 'checkout' && (
        <Checkout
          onGoBack={handleBackFromCheckout}
        />
      )}
      
      {currentView === 'donorsAndMessages' && (
  <DonorsAndMessages
    postId={selectedPost}
    onBack={() => setCurrentView('post')}
  />
)}

{currentView === 'story' && (
  <Story 
    postId={selectedPost} 
    onBack={() => setCurrentView('post')} 
  />
)}

{currentView === 'impactGallery' && (
  <ImpactGallery 
    postId={selectedPost} 
    onBack={() => setCurrentView('post')} 
  />
)}

{currentView === 'charityProfile' && (
  <CharityProfile 
    charityId={selectedCharityId} 
    onBack={() => setCurrentView(previousView || 'post')} 
  />
)}

    </div>
  );
}

export default DonorApp;