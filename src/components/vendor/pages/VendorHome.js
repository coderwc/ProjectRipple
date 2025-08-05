import React, { useEffect, useState } from 'react';
import {
  PackagePlus,
  ClipboardList,
  Wallet,
  LogOut,
  Home,
  Plus,
  User,
  CheckCircle2,
} from 'lucide-react';
import { auth, db } from '../../../firebase/config';
import { doc, getDoc } from 'firebase/firestore';

const VendorHome = ({
  onNavigateToAdd,
  onNavigateToOrders,
  onNavigateToWallet,
  onNavigateToListings,
  onLogout,
  onNavigateToHome,
  onNavigateToProfile,
}) => {
  const [vendorData, setVendorData] = useState({ name: '', balance: 0, imageUrl: null });

  useEffect(() => {
    const fetchVendorData = async () => {
      try {
        // First get data from your API
        const token = await auth.currentUser.getIdToken();
        const res = await fetch("http://localhost:5001/api/vendor/profile", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!res.ok) throw new Error("Failed to fetch vendor profile");
        const apiData = await res.json();

        // Then get profile image from Firestore
        const user = auth.currentUser;
        if (user) {
          const docRef = doc(db, "vendors", user.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const firestoreData = docSnap.data();
            setVendorData({
              ...apiData,
              imageUrl: firestoreData.imageUrl || null
            });
          } else {
            setVendorData(apiData);
          }
        } else {
          setVendorData(apiData);
        }

        console.log('Vendor profile data:', apiData);
      } catch (err) {
        console.error("Error fetching vendor data:", err);
      }
    };

    fetchVendorData();
  }, []);

  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to log out?");
    if (confirmLogout) {
      onLogout();
    }
  };

  return (
    <div className="max-w-sm mx-auto min-h-screen bg-gradient-to-b from-blue-200 via-blue-100 to-white relative">

      {/* Header */}
      <div className="relative bg-white px-4 py-6 border-b border-gray-100 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center overflow-hidden">
            {vendorData.imageUrl ? (
              <img src={vendorData.imageUrl} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <User className="w-6 h-6 text-blue-700" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-blue-800">{vendorData.name || "Vendor"}</h1>
              <CheckCircle2 className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-sm text-gray-500">Verified Vendor</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="absolute top-6 right-4 text-gray-400 hover:text-red-500 transition-colors"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>

      {/* Menu Options */}
      <div className="px-4 py-6 space-y-4 pb-24">
        <button
          onClick={onNavigateToListings}
          className="w-full flex items-center gap-4 p-4 bg-white border border-blue-200 rounded-xl shadow hover:bg-blue-50 transition-colors"
        >
          <PackagePlus className="w-6 h-6 text-blue-600" />
          <div className="text-left">
            <h2 className="text-md font-semibold text-gray-900">My Products</h2>
            <p className="text-sm text-gray-500">View and list items to reduce waste</p>
          </div>
        </button>

        <button
          onClick={onNavigateToOrders}
          className="w-full flex items-center gap-4 p-4 bg-white border border-blue-200 rounded-xl shadow hover:bg-blue-50 transition-colors"
        >
          <ClipboardList className="w-6 h-6 text-blue-600" />
          <div className="text-left">
            <h2 className="text-md font-semibold text-gray-900">My Orders</h2>
            <p className="text-sm text-gray-500">Manage shipping and status</p>
          </div>
        </button>

        <button
          onClick={onNavigateToWallet}
          className="w-full flex items-center gap-4 p-4 bg-white border border-blue-200 rounded-xl shadow hover:bg-blue-50 transition-colors"
        >
          <Wallet className="w-6 h-6 text-blue-700" />
          <div className="text-left">
            <h2 className="text-md font-semibold text-gray-900">My Wallet</h2>
            <p className="text-sm text-gray-500">Check your balance and earnings</p>
          </div>
        </button>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-sm bg-white border-t border-gray-200 shadow-inner">
        <div className="flex justify-around py-3">
          <button onClick={onNavigateToHome} className="flex flex-col items-center gap-1">
            <Home className="w-6 h-6 text-blue-700" />
            <span className="text-xs text-blue-700 font-medium">Home</span>
          </button>

          <button
            onClick={() => onNavigateToAdd('home')}
            className="flex flex-col items-center gap-1"
          >
            <div className="w-8 h-8 rounded-full bg-blue-300 flex items-center justify-center">
              <Plus className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-medium text-blue-300">Add Listing</span>
          </button>

          <button onClick={onNavigateToProfile} className="flex flex-col items-center gap-1">
            <User className="w-6 h-6 text-blue-300" />
            <span className="text-xs text-blue-300">Profile</span>
          </button>
        </div>
      </div>

      <div className="h-20" />
    </div>
  );
};

export default VendorHome;