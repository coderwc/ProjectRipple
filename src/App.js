import React, { useState, useEffect } from 'react';
import LandingPage from './components/shared/LandingPage';
import AuthPage from './components/shared/AuthPage';
import CharityApp from './components/charity/pages/CharityDashboard';
import VendorApp from './components/vendor/VendorApp';

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
  };

  const handleBackToLanding = () => {
    setShowAuth(false);
    setUserType(null);
  };

  // Show auth page if user selected a type but isn't logged in
  if (!user && showAuth) {
    return (
      <AuthPage 
        onLogin={handleLogin} 
        userType={userType} 
        onBack={handleBackToLanding}
      />
    );
  }

  // Show appropriate app based on user type
  switch (userType) {
    case 'charity':
      return <CharityApp user={user} onLogout={handleLogout} />;
    case 'vendor':
      return <VendorApp user={user} onLogout={handleLogout} />;
    case 'donor':
      return (
        <div className="max-w-sm mx-auto bg-gray-50 min-h-screen p-4">
          <div className="bg-white rounded-lg p-6">
            <h1 className="text-2xl font-bold mb-4">Donor Dashboard</h1>
            <p className="text-gray-600 mb-4">Welcome, {user.name}!</p>
            <p className="text-sm text-gray-500 mb-6">
              Donor interface coming soon...
            </p>
            <button 
              onClick={handleLogout}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
      );
    default:
      return <LandingPage onSelectUserType={handleSelectUserType} />;
  }
}

export default App;