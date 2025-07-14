import React, { useState } from 'react';
import DonorHome from './DonorHome';

const DonorApp = ({ user, onLogout }) => {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedPostId, setSelectedPostId] = useState(null);

  const goToCategory = (category) => {
    setSelectedCategory(category);
    setCurrentPage('category');
  };

  const goToPost = (postId) => {
    setSelectedPostId(postId);
    setCurrentPage('post');
  };

  return (
    <>
      {currentPage === 'home' && (
        <DonorHome
          user={user}
          onSelectCategory={goToCategory}
          onSelectPost={goToPost}
          onLogout={onLogout}
        />
      )}
    </>
  );
};

export default DonorApp;