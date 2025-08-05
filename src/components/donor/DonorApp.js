import React, { useState } from 'react';
import DonorHome from './DonorHome';
import CategoryFeed from './CategoryFeed';
import CharityPost from './CharityPost';
import CharityProfile from './CharityProfile';
import AvailableVendors from './AvailableVendors';
import VendorProducts from './VendorProducts';
import ShoppingCart from './Donorcomponents/ShoppingCart';
import Checkout from './Donorcomponents/Checkout';
import DonorProfile from './DonorProfile';
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
  const [selectedItemFilter, setSelectedItemFilter] = useState(null);
  const [previousView, setPreviousView] = useState('home');
  const [selectedPostData, setSelectedPostData] = useState(null);
  const [originalPostForCheckout, setOriginalPostForCheckout] = useState(null);
  const [charityPostRefresh, setCharityPostRefresh] = useState(null);

  const { setCharity, clearCart, getTotalItems, getUniqueProducts } = useCart();

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
    setOriginalPostForCheckout(null);
  };


  const handleBackFromPost = () => {
    // Always go back to home from post to ensure consistent navigation
    // This prevents getting stuck due to corrupted previousView state
    setCurrentView('home');
    setSelectedPost(null);
    setSelectedCharity(null);
    setSelectedVendor(null);
    setPreviousView('home');
    setOriginalPostForCheckout(null);
  };

  const handleSelectPost = (postId) => {
    setSelectedPost(postId);
    setPreviousView(currentView); // Remember where we came from
    setCurrentView('post');
  };

  const handleCharitySelect = (charity) => {
    setSelectedCharity(charity);
    setCharity(charity);
    setSelectedItemFilter(charity.selectedItem || null);
    setPreviousView(currentView);
    
    // Store refresh function for later use after checkout
    if (charity.refreshPostData) {
      setCharityPostRefresh(() => charity.refreshPostData);
    }
    
    // Preserve the original post for checkout return navigation
    if (currentView === 'post' && selectedPost) {
      setOriginalPostForCheckout(selectedPost);
    }
    
    setCurrentView('shop');
  };


  const handleVendorProfile = (vendor) => {
    setSelectedVendor(vendor);
    setPreviousView(currentView);
    setCurrentView('vendorProfile');
  };

  const handleBackToVendors = () => {
    setCurrentView('shop');
    setSelectedVendor(null);
  };

  const handleBackFromVendors = () => {
    // Go back to the post that started the shopping journey
    const postToReturn = originalPostForCheckout || selectedPost;
    if (postToReturn) {
      setSelectedPost(postToReturn);
      setCurrentView('post');
      setPreviousView('home'); // Ensure post can go back to home
    } else {
      // Fallback to home if no post is available
      setCurrentView('home');
    }
    setSelectedVendor(null);
    setSelectedItemFilter(null);
  };

  const handleGoToCart = () => {
    if (getTotalItems() === 0) {
      alert('Your cart is empty. Add some items first!');
      return;
    }
    setPreviousView(currentView);
    setCurrentView('cart');
  };

  const handleBackFromCart = () => {
    // Go back to previous view, defaulting to home if not set
    const viewToReturn = previousView || 'home';
    setCurrentView(viewToReturn);
    
    // Clean up navigation state
    if (viewToReturn === 'home') {
      setSelectedPost(null);
      setSelectedCharity(null);
      setSelectedVendor(null);
      setPreviousView('home');
    }
  };

  const handleGoToCheckout = () => {
    setPreviousView('cart');
    setCurrentView('checkout');
  };

  const handleBackFromCheckout = () => {
    setCurrentView('cart');
  };

  const handleCheckoutSuccess = (data = {}) => {
    // After successful checkout, return to charity post if we have one preserved
    const postToReturn = originalPostForCheckout || selectedPost;
    if (postToReturn) {
      setSelectedPost(postToReturn);
      setCurrentView('post');
      // Ensure clean navigation state for reliable back button behavior
      setPreviousView('home');
      setSelectedCharity(null);
      setSelectedVendor(null);
      setSelectedItemFilter(null);
      // Clear the preserved post after using it
      setOriginalPostForCheckout(null);
      
      // Refresh charity post data to show updated progress
      if (data.refreshData && charityPostRefresh) {
        console.log('🔄 Triggering charity post refresh after checkout...');
        setTimeout(() => {
          console.log('🔄 Executing charity post refresh now...');
          charityPostRefresh();
          setCharityPostRefresh(null); // Clear after use
        }, 2000); // Longer delay to ensure Firestore writes complete
      }
    } else {
      // Fallback to home if no post is selected
      handleBackToHome(); // Use existing home handler for clean state
    }
  };

  const handleLogout = () => {
    clearCart();
    onLogout();
  };

  // Function to handle profile navigation
  const handleGoToProfile = () => {
    setPreviousView(currentView);
    setCurrentView('profile');
  };

  // Function to handle going back from profile
  const handleBackFromProfile = () => {
    setCurrentView(previousView || 'home');
  };

  const handleViewDonors = (postId) => {
    setSelectedPost(postId);
    setCurrentView('donorsAndMessages');
  };

  const handleViewStory = (postId, postData) => {
    setSelectedPost(postId);
    setSelectedPostData(postData);
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
          onSelectPost={(id) => handleSelectPost(id, 'home')}
          onCharitySelect={handleCharitySelect}
          onGoToCart={handleGoToCart}
          onGoToProfile={handleGoToProfile}
          onLogout={handleLogout}
        />
      )}

      {currentView === 'category' && (
        <CategoryFeed
          categoryName={selectedCategory}
          onBack={handleBackToHome}
          onSelectPost={(id) => handleSelectPost(id, 'category')}
        />
      )}

      {currentView === 'post' && (
        <CharityPost
          postId={selectedPost}
          onBack={handleBackFromPost}
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
          onGoToCart={handleGoToCart}
        />
      )}

      {currentView === 'vendor' && (
        <VendorProducts
          vendor={selectedVendor}
          charity={selectedCharity}
          onBack={handleBackToVendors}
          onSelectVendor={handleVendorProfile}
          onGoToCart={handleGoToCart}
        />
      )}

      {currentView === 'vendorProfile' && (
        <VendorProducts
          vendor={selectedVendor}
          charity={selectedCharity}
          onBack={() => setCurrentView(previousView || 'shop')}
          onSelectVendor={handleVendorProfile}
          onGoToCart={handleGoToCart}
          isProfile={true}
        />
      )}

      {currentView === 'cart' && (
        <ShoppingCart
          onGoBack={handleBackFromCart}
          onGoToCheckout={handleGoToCheckout}
          onCheckoutSuccess={handleCheckoutSuccess}
        />
      )}

      {currentView === 'checkout' && (
        <Checkout
          onGoBack={handleBackFromCheckout}
          onCheckoutSuccess={handleCheckoutSuccess}
          selectedCharity={selectedCharity}
          cartItems={getUniqueProducts()}
          user={user}
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
          postData={selectedPostData}
          onBack={() => setCurrentView('post')} 
        />
      )}

      {currentView === 'impactGallery' && (
        <ImpactGallery 
          postId={selectedPost} 
          onBack={() => setCurrentView('post')} 
        />
      )}

      {currentView === 'profile' && (
        <DonorProfile
          onBack={handleBackFromProfile}
          onLogout={handleLogout}
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