import React, { useState } from 'react';
import DonorHome from './DonorHome';
import CategoryFeed from './CategoryFeed';
import CharityPost from './CharityPost';

function App() {
  const [currentView, setCurrentView] = useState('home');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedPost, setSelectedPost] = useState(null);
  
  // Mock user data
  const user = {
    name: 'John Doe'
  };

  const handleSelectCategory = (categoryName) => {
    setSelectedCategory(categoryName);
    setCurrentView('category');
  };

  const handleBackToHome = () => {
    setCurrentView('home');
    setSelectedCategory('');
    setSelectedPost(null);
  };

  const handleBackToCategory = () => {
    setCurrentView('category');
    setSelectedPost(null);
  };

  const handleSelectPost = (postId) => {
    setSelectedPost(postId);
    setCurrentView('post');
  };

  const handleLogout = () => {
    console.log('User logged out');
    // Add logout logic here
  };

  return (
    <div className="App">
      {currentView === 'home' && (
        <DonorHome
          user={user}
          onSelectCategory={handleSelectCategory}
          onSelectPost={handleSelectPost}
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
        />
      )}
    </div>
  );
}

export default App;