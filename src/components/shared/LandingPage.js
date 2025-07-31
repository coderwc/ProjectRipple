import React from 'react';
import { Heart, Package, FileText } from 'lucide-react';

const LandingPage = ({ onSelectUserType }) => {
  return (
    <div className="max-w-sm mx-auto min-h-screen flex flex-col items-center justify-center px-8"
      style={{ background: 'linear-gradient(135deg, #4F46E5 0%, #3B82F6 100%)' }}
    >
      {/* Inspirational Text */}
      <div className="text-center mb-16">
        <h1 className="text-white text-2xl font-light mb-2 tracking-wide">
          Individually, we are one drop.
        </h1>
        <h2 className="text-white text-2xl font-light tracking-wide opacity-90">
          Together, we are an ocean.
        </h2>
      </div>

      {/* User Type Selection */}
      <div className="w-full space-y-4 mb-8">
        <h3 className="text-white text-xl font-medium mb-6 text-center">Sign in as:</h3>
        
        {/* Donor Button */}
        <button
          onClick={() => onSelectUserType('donor')}
          className="w-full bg-white/20 backdrop-blur-xl text-white py-4 px-6 rounded-2xl font-medium text-lg flex items-center justify-center gap-3 hover:bg-white/30 transition-all duration-300 shadow-lg border border-white/30"
        >
          <Heart className="w-6 h-6" />
          I am a donor
        </button>

        {/* Vendor Button */}
        <button
          onClick={() => onSelectUserType('vendor')}
          className="w-full bg-white/20 backdrop-blur-xl text-white py-4 px-6 rounded-2xl font-medium text-lg flex items-center justify-center gap-3 hover:bg-white/30 transition-all duration-300 shadow-lg border border-white/30"
        >
          <Package className="w-6 h-6" />
          I am a vendor
        </button>

        {/* Charity Button */}
        <button
          onClick={() => onSelectUserType('charity')}
          className="w-full bg-white/20 backdrop-blur-xl text-white py-4 px-6 rounded-2xl font-medium text-lg flex items-center justify-center gap-3 hover:bg-white/30 transition-all duration-300 shadow-lg border border-white/30"
        >
          <FileText className="w-6 h-6" />
          I am a charity
        </button>
      </div>

      {/* Sign Up Link */}
      <div className="text-center">
        <p className="text-white opacity-80 text-sm">
          Don't Have an Account?{' '}
          <button className="font-medium underline hover:opacity-100 transition-opacity">
            Sign Up Here
          </button>
        </p>
      </div>
    </div>
  );
};

export default LandingPage;
