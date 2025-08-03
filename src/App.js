import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase/config';
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
  const [loading, setLoading] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser && !isAuthenticating) {
        try {
          // Check vendors first
          const vendorDoc = await getDoc(doc(db, 'vendors', firebaseUser.uid));
          if (vendorDoc.exists()) {
            const userData = vendorDoc.data();
            const userObj = {
              id: firebaseUser.uid,
              email: firebaseUser.email,
              name: userData.name || firebaseUser.displayName,
              type: 'vendor',
              phone: userData.phone || '',
              location: userData.location || '',
              socials: userData.socials || '',
              queries: userData.queries || '',
              isVerified: userData.isVerified || false
            };
            setUser(userObj);
            setUserType('vendor');
          } else {
            // Check users collection
            const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              const userObj = {
                id: firebaseUser.uid,
                email: firebaseUser.email,
                name: userData.name || firebaseUser.displayName,
                type: userData.type,
                phone: userData.phone || '',
                location: userData.location || '',
                socials: userData.socials || '',
                queries: userData.queries || '',
                isVerified: userData.isVerified || false
              };
              setUser(userObj);
              setUserType(userData.type);
            } else {
              console.log('No user document found');
              setUser(null);
              setUserType(null);
            }
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setUser(null);
          setUserType(null);
        }
      } else {
        setUser(null);
        // Don't clear userType if we're showing the auth page - preserve user's selection
        if (!showAuth) {
          setUserType(null);
        }
        console.log('Auth state changed to null, showAuth:', showAuth, 'preserving userType:', userType);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isAuthenticating]);

  const handleSelectUserType = (type) => {
    setUserType(type);
    setShowAuth(true);
  };

  const handleLogin = (userData) => {
    setUser(userData);
    setUserType(userData.type);
    setShowAuth(false);
  };

 const handleUserUpdate = (updatedUserData) => {
  setUser(updatedUserData);
};

const handleLogout = async () => {
  try {
    await auth.signOut();
    setUser(null);
    setUserType(null);
    setShowAuth(false);
    // Clear localStorage (from main branch)
    localStorage.removeItem('rippleUser');
    localStorage.removeItem('rippleCart');
  } catch (error) {
    console.error('Logout error:', error);
  }
};


  const handleBackToLanding = () => {
    setShowAuth(false);
    setUserType(null);
  };

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // Show auth page if user selected a type but isn't logged in
  if (!user && showAuth) {
    console.log('Rendering AuthPage with userType:', userType, 'showAuth:', showAuth);
    return (
      <CartProvider>
        <AuthPage 
          onLogin={handleLogin} 
          userType={userType} 
          onBack={handleBackToLanding}
          setIsAuthenticating={setIsAuthenticating}
        />
      </CartProvider>
    );
  }

return (
  <CartProvider>
    {(() => {
      switch (userType) {
        case 'charity':
          return <CharityApp user={user} onLogout={handleLogout} onUserUpdate={handleUserUpdate} />;
        case 'vendor':
          return <VendorApp user={user} onLogout={handleLogout} onUserUpdate={handleUserUpdate} />;
        case 'donor':
          return <DonorApp user={user} onLogout={handleLogout} onUserUpdate={handleUserUpdate} />;
        default:
          return <LandingPage onSelectUserType={handleSelectUserType} />;
      }
    })()}
  </CartProvider>
);

}

export default App;