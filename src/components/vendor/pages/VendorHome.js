import React from 'react';
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

const VendorHome = ({
  onNavigateToAdd,
  onNavigateToOrders,
  onNavigateToWallet,
  onNavigateToListings,
  onLogout,
  onNavigateToHome,
  onNavigateToProfile,
}) => {
  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to log out?");
    if (confirmLogout) {
      onLogout();
    }
  };

  return (
    <div className="max-w-sm mx-auto min-h-screen bg-gray-50 relative">
      {/* Status Bar */}
      <div className="flex justify-between items-center px-4 py-2 bg-white text-sm font-medium">
        <span>9:30</span>
        <div className="flex gap-1">
          <div className="w-4 h-2 bg-black rounded-sm"></div>
          <div className="w-4 h-2 bg-black rounded-sm"></div>
        </div>
      </div>

      {/* Header */}
      <div className="relative bg-white px-4 py-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-gray-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900">Freshmart</h1>
              <CheckCircle2 className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-sm text-gray-500">Verified Vendor</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="absolute top-6 right-4 text-gray-500 hover:text-red-600 transition-colors"
          aria-label="Log out"
          title="Logout"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>

      {/* Menu Options */}
      <div className="px-4 py-6 space-y-4 pb-24">
        <button
          onClick={onNavigateToListings}
          className="w-full flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:bg-gray-100 transition-colors"
        >
          <PackagePlus className="w-6 h-6 text-blue-600" />
          <div className="text-left">
            <h2 className="text-md font-semibold text-gray-900">View Products</h2>
            <p className="text-sm text-gray-500">View and list new items to reduce waste</p>
          </div>
        </button>

        <button
          onClick={onNavigateToOrders}
          className="w-full flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:bg-gray-100 transition-colors"
        >
          <ClipboardList className="w-6 h-6 text-green-600" />
          <div className="text-left">
            <h2 className="text-md font-semibold text-gray-900">View Orders</h2>
            <p className="text-sm text-gray-500">Manage shipping and status</p>
          </div>
        </button>

        <button
          onClick={onNavigateToWallet}
          className="w-full flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:bg-gray-100 transition-colors"
        >
          <Wallet className="w-6 h-6 text-yellow-600" />
          <div className="text-left">
            <h2 className="text-md font-semibold text-gray-900">Wallet</h2>
            <p className="text-sm text-gray-500">Check your balance and earnings</p>
          </div>
        </button>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-sm bg-white border-t border-gray-200">
        <div className="flex justify-around py-3">
          {/* Home */}
          <button onClick={onNavigateToHome} className="flex flex-col items-center gap-1">
            <Home className="w-6 h-6 text-gray-900" />
            <span className="text-xs text-gray-900 font-medium">Home</span>
          </button>

          {/* Add Listing */}
          <button
            onClick={() => onNavigateToAdd('home')} // 👈 Pass 'home' to go back to home later
            className="flex flex-col items-center gap-1"
          >
            <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center">
              <Plus className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-medium text-gray-600">Add Listing</span>
          </button>

          {/* Profile */}
          <button onClick={onNavigateToProfile} className="flex flex-col items-center gap-1">
            <User className="w-6 h-6 text-gray-400" />
            <span className="text-xs text-gray-400">Profile</span>
          </button>
        </div>
      </div>

      {/* Padding to avoid overlap */}
      <div className="h-20" />
    </div>
  );
};

export default VendorHome;
