import React, { useState, useEffect } from 'react';
import LandingPage from './components/shared/LandingPage';
import AuthPage from './components/shared/AuthPage';
import CharityApp from './components/charity/pages/CharityDashboard';
import VendorApp from './components/vendor/VendorApp';
import DonorApp from './components/donor/DonorApp';
import { CartProvider } from './components/shared/CartContext';

function App() {
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('rippleUser');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      setUserType(userData.type);
    }
  }, []);

  const handleSelectUserType = (type) => {
    setUserType(type);
    setShowAuth(true);
  };

  const handleLogin = (userData) => {
    setUser(userData);
    setUserType(userData.type);
    localStorage.setItem('rippleUser', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    setUserType(null);
    setShowAuth(false);
    localStorage.removeItem('rippleUser');
    // Clear cart on logout
    localStorage.removeItem('rippleCart');
  };

  const handleBackToLanding = () => {
    setShowAuth(false);
    setUserType(null);
  };

  // Show auth page if user selected a type but isn't logged in
  if (!user && showAuth) {
    return (
      <CartProvider>
        <AuthPage 
          onLogin={handleLogin} 
          userType={userType} 
          onBack={handleBackToLanding}
        />
      </CartProvider>
    );
  }

  // Wrap the entire app with CartProvider for cart functionality
  return (
    <CartProvider>
      {(() => {
        switch (userType) {
          case 'charity':
            return <CharityApp user={user} onLogout={handleLogout} />;
          case 'vendor':
            return <VendorApp user={user} onLogout={handleLogout} />;
          case 'donor':
            return <DonorApp user={user} onLogout={handleLogout} />;
          default:
            return <LandingPage onSelectUserType={handleSelectUserType} />;
        }
      })()}
    </CartProvider>
  );
}

export default App;