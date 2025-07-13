import React, { useState, useEffect } from 'react';
import MyListings from './pages/MyListings';
import AddListing from './pages/AddListing';

const VendorApp = ({ user, onLogout }) => {
  const [currentPage, setCurrentPage] = useState('listings'); // 'listings', 'addListing', 'editListing'
  const [editingId, setEditingId] = useState(null);
  
  // Load listings from localStorage with user-specific key
  const [listings, setListings] = useState(() => {
    const stored = localStorage.getItem(`vendorListings_${user.id}`);
    return stored ? JSON.parse(stored) : [];
  });

  // Save listings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(`vendorListings_${user.id}`, JSON.stringify(listings));
  }, [listings, user.id]);

  const navigateToAdd = () => {
    setEditingId(null);
    setCurrentPage('addListing');
  };

  const navigateToEdit = (id) => {
    setEditingId(id);
    setCurrentPage('editListing');
  };

  const navigateToListings = () => {
    setCurrentPage('listings');
    setEditingId(null);
  };

  return (
    <>
      {currentPage === 'listings' && (
        <MyListings
          listings={listings}
          setListings={setListings}
          user={user}
          onLogout={onLogout}
          onNavigateToAdd={navigateToAdd}
          onNavigateToEdit={navigateToEdit}
        />
      )}
      
      {(currentPage === 'addListing' || currentPage === 'editListing') && (
        <AddListing
          listings={listings}
          setListings={setListings}
          user={user}
          editingId={editingId}
          isEditing={currentPage === 'editListing'}
          onBack={navigateToListings}
        />
      )}
    </>
  );
};

export default VendorApp;