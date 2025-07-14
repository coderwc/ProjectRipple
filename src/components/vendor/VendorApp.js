import React, { useState, useEffect } from 'react';
import VendorHome from './pages/VendorHome';
import MyListings from './pages/MyListings';
import AddListing from './pages/AddListing';
import ViewOrders from './pages/ViewOrders';

const VendorApp = ({ user, onLogout }) => {
  const [currentPage, setCurrentPage] = useState('home'); // home page
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

  const navigateToHome = () => setCurrentPage('home');
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

  const navigateToOrders = () => {
    setCurrentPage('orders');
  };
  const navigateToWallet = () => {
    setCurrentPage('wallet');
  };

  return (
    <>
      {currentPage === 'home' && (
        <VendorHome
          onNavigateToOrders={navigateToOrders}
          onNavigateToWallet={navigateToWallet}
          onNavigateToListings={navigateToListings}
          onLogout={() => {
            onLogout(); // or clearToken(), navigate to login, etc.
            setCurrentPage('landing'); // or wherever your login screen is
          }}
        />
      )}

      {currentPage === 'listings' && (
        <MyListings
          listings={listings}
          setListings={setListings}
          user={user}
          onLogout={onLogout}
          onNavigateToAdd={navigateToAdd}
          onNavigateToEdit={navigateToEdit}
          onNavigateToHome={navigateToHome} //
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
          onNavigateToHome={navigateToHome}
        />
      )}

      {/* Placeholder: These pages will be created next */}
      {currentPage === 'orders' && (
        <ViewOrders onNavigateToHome={navigateToHome} />
    )}
      {currentPage === 'wallet' && <div>Wallet Page Coming Soon</div>}
    </>
  );
};

export default VendorApp;