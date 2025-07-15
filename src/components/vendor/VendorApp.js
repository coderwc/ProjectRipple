import React, { useState, useEffect } from 'react';
import VendorHome from './pages/VendorHome';
import MyListings from './pages/MyListings';
import AddListing from './pages/AddListing';
import ViewOrders from './pages/ViewOrders';
import Wallet from './pages/Wallet';
import ProfilePage from './pages/ProfilePage';

const VendorApp = ({ user, onLogout }) => {
  const [currentPage, setCurrentPage] = useState('home');
  const [editingId, setEditingId] = useState(null);
  const [previousPage, setPreviousPage] = useState('home'); // track where user came from

  const [listings, setListings] = useState(() => {
    const stored = localStorage.getItem(`vendorListings_${user.id}`);
    return stored ? JSON.parse(stored) : [];
  });

  const [balance, setBalance] = useState(() => {
    const stored = localStorage.getItem(`vendorBalance_${user.id}`);
    return stored ? parseFloat(stored) : 150.0;
  });

  const [withdrawalHistory, setWithdrawalHistory] = useState(() => {
    const stored = localStorage.getItem(`withdrawalHistory_${user.id}`);
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem(`vendorListings_${user.id}`, JSON.stringify(listings));
  }, [listings, user.id]);

  useEffect(() => {
    localStorage.setItem(`vendorBalance_${user.id}`, balance);
  }, [balance, user.id]);

  useEffect(() => {
    localStorage.setItem(`withdrawalHistory_${user.id}`, JSON.stringify(withdrawalHistory));
  }, [withdrawalHistory, user.id]);

  // Navigation
  const navigateToHome = () => setCurrentPage('home');
  const navigateToListings = () => {
    setEditingId(null);
    setCurrentPage('listings');
  };
  const navigateToAdd = () => {
    setPreviousPage(currentPage); // Save where the user was
    setEditingId(null);
    setCurrentPage('addListing');
  };
  const navigateToEdit = (id) => {
    setEditingId(id);
    setPreviousPage(currentPage);
    setCurrentPage('editListing');
  };
  const navigateToOrders = () => setCurrentPage('orders');
  const navigateToWallet = () => setCurrentPage('wallet');
  const navigateToProfile = () => setCurrentPage('profile');

  // Back from add/edit listing
  const handleBackFromAddOrEdit = () => {
    setCurrentPage(previousPage); // Go back to where user came from
  };

  const withdrawAmount = (amount) => {
    if (amount > 0 && amount <= balance) {
      const newBalance = balance - amount;
      setBalance(newBalance);
      setWithdrawalHistory((prev) => [
        ...prev,
        {
          amount,
          date: new Date().toISOString().split('T')[0],
        },
      ]);
      return true;
    }
    return false;
  };

  return (
    <>
      {currentPage === 'home' && (
        <VendorHome
          onNavigateToAdd={navigateToAdd}
          onNavigateToOrders={navigateToOrders}
          onNavigateToWallet={navigateToWallet}
          onNavigateToListings={navigateToListings}
          onNavigateToHome={navigateToHome}
          onNavigateToProfile={navigateToProfile}
          onLogout={() => {
            onLogout();
            setCurrentPage('landing');
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
          onNavigateToHome={navigateToHome}
        />
      )}

      {(currentPage === 'addListing' || currentPage === 'editListing') && (
        <AddListing
          listings={listings}
          setListings={setListings}
          user={user}
          editingId={editingId}
          isEditing={currentPage === 'editListing'}
          onBack={handleBackFromAddOrEdit} // NEW LOGIC
          onNavigateToHome={navigateToHome}
        />
      )}

      {currentPage === 'orders' && (
        <ViewOrders onNavigateToHome={navigateToHome} />
      )}

      {currentPage === 'wallet' && (
        <Wallet
          balance={balance}
          onNavigateToHome={navigateToHome}
          onWithdraw={withdrawAmount}
          history={withdrawalHistory}
        />
      )}

      {currentPage === 'profile' && (
        <ProfilePage
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          user={user}
          onLogout={() => {
            onLogout();
            setCurrentPage('landing');
          }}
        />
      )}
    </>
  );
};

export default VendorApp;
