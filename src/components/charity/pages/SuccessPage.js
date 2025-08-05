import React, { useEffect } from 'react';
import { CheckCircle2, X } from 'lucide-react';

const SuccessPage = ({ onNavigate }) => {
  // Auto-navigate back to dashboard after 3 seconds (like your original)
  useEffect(() => {
    const timer = setTimeout(() => {
      onNavigate('dashboard');
    }, 3000); // 3 second timeout

    return () => clearTimeout(timer);
  }, [onNavigate]);

  return (
    <div className="max-w-sm mx-auto bg-gradient-to-b from-blue-200 via-blue-100 to-white min-h-screen flex flex-col">
      {/* Status Bar */}
      <div className="flex justify-between items-center px-4 py-2 bg-white text-sm font-medium">
        <span>9:30</span>
        <div className="flex gap-1">
          <div className="w-4 h-2 bg-black rounded-sm"></div>
          <div className="w-4 h-2 bg-black rounded-sm"></div>
        </div>
      </div>

      {/* Close Button */}
      <div className="flex justify-end px-4 py-2">
        <button onClick={() => onNavigate('dashboard')} className="p-1 hover:bg-white/20 rounded">
          <X className="w-6 h-6 text-gray-600" />
        </button>
      </div>

      {/* Success Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-20">
        {/* Success Icon */}
        <div className="w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center mb-8 shadow-lg">
          <CheckCircle2 className="w-12 h-12 text-white" />
        </div>

        {/* Success Message */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Your Post</h1>
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Is Published!</h2>

        {/* Quote */}
        <div className="text-center px-4 mb-8 bg-white/60 backdrop-blur-sm rounded-lg p-6 border border-gray-200">
          <p className="text-gray-700 mb-2 font-medium">Individually We Are One Drop, Together We Are An Ocean</p>
          <p className="text-gray-500 text-sm">-Ryunosuke Satoro</p>
        </div>

    
      </div>
    </div>
  );
};

export default SuccessPage;