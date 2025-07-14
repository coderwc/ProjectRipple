import React from 'react';
import { PackagePlus, ClipboardList, Wallet, LogOut } from 'lucide-react';

const VendorHome = ({
  onNavigateToAdd,
  onNavigateToOrders,
  onNavigateToWallet,
  onNavigateToListings,
  onLogout,
}) => {
  // Handle logout with confirmation
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
        <h1 className="text-xl font-bold text-gray-900">Welcome, Vendor 👋</h1>
        <p className="text-sm text-gray-500 mt-1">What would you like to do today?</p>

        {/* 🔓 Logout with icon and label */}
        <button
          onClick={handleLogout}
          className="absolute top-6 right-4 flex items-center gap-1 text-sm text-gray-500 hover:text-red-600 transition-colors"
          aria-label="Log out"
          title="Logout"
        >
          <LogOut className="w-5 h-5" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>

      {/* Menu Options */}
      <div className="px-4 py-6 space-y-4">
        <button
          onClick={onNavigateToListings}
          className="w-full flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:bg-gray-100 transition-colors"
        >
          <PackagePlus className="w-6 h-6 text-blue-600" />
          <div className="text-left">
            <h2 className="text-md font-semibold text-gray-900">Upload Product</h2>
            <p className="text-sm text-gray-500">List new items to reduce waste</p>
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
    </div>
  );
};

export default VendorHome;