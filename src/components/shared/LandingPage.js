import React, { useState } from 'react';
import { Heart, Package, FileText, ArrowRight, Users, Droplets, Sparkles } from 'lucide-react';

const LandingPage = ({ onSelectUserType }) => {
  const [hoveredButton, setHoveredButton] = useState(null);

  const logoSrc = '/ripplelogo.png'; // Image from public folder

  const userTypes = [
    {
      id: 'donor',
      title: 'I am a donor',
      subtitle: 'Make a difference with your contributions',
      icon: Heart,
      gradient: 'from-pink-500 to-rose-500',
      hoverGradient: 'from-pink-600 to-rose-600'
    },
    {
      id: 'vendor',
      title: 'I am a vendor',
      subtitle: 'Partner with us to create impact',
      icon: Package,
      gradient: 'from-emerald-500 to-teal-500',
      hoverGradient: 'from-emerald-600 to-teal-600'
    },
    {
      id: 'charity',
      title: 'I am a charity',
      subtitle: 'Connect with donors and resources',
      icon: FileText,
      gradient: 'from-violet-500 to-purple-500',
      hoverGradient: 'from-violet-600 to-purple-600'
    }
  ];

  return (
    <div className="max-w-md mx-auto bg-gradient-to-br from-blue-900 via-indigo-800 to-purple-900 min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden pt-12">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-10 w-24 h-24 bg-gradient-to-r from-indigo-400 to-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-25 animate-pulse delay-1000"></div>
        <div className="absolute bottom-32 left-20 w-28 h-28 bg-gradient-to-r from-purple-400 to-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-2000"></div>
        
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full animate-ping"
            style={{
              left: `${20 + i * 15}%`,
              top: `${30 + i * 10}%`,
              animationDelay: `${i * 1000}ms`,
              animationDuration: '3000ms'
            }}
          ></div>
        ))}
      
      </div>

      {/* Content Container */}
      <div className="relative z-10 w-full">
        {/* Logo/Brand Section */}
        <div className="text-center mb-12">
          <div className="mb-4">
            <img 
              src={logoSrc} 
              alt="Ripple Logo" 
              className="mx-auto w-96 object-contain filter brightness-0 invert"
            />
          </div>

          
        </div>

        {/* User Type Selection */}
        <div className="w-full space-y-4 mb-10">
          <h3 className="text-white text-xl font-semibold mb-8 text-center opacity-90">
            Choose your path
          </h3>
          
          {userTypes.map((userType) => {
            const IconComponent = userType.icon;
            const isHovered = hoveredButton === userType.id;
            
            return (
              <button
                key={userType.id}
                onClick={() => onSelectUserType(userType.id)}
                onMouseEnter={() => setHoveredButton(userType.id)}
                onMouseLeave={() => setHoveredButton(null)}
                className={`w-full group relative overflow-hidden backdrop-blur-md text-white py-5 px-6 rounded-2xl font-medium text-lg transition-all duration-500 shadow-xl border border-white border-opacity-10 transform hover:scale-105 hover:shadow-2xl ${
                  isHovered ? 'bg-white bg-opacity-20' : 'bg-indigo-400/10'
                }`}
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${isHovered ? userType.hoverGradient : userType.gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-300`}></div>
                
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`relative p-2 rounded-xl ${isHovered ? `bg-gradient-to-r ${userType.gradient}` : 'bg-white bg-opacity-20'} shadow-md transition-all duration-300`}>
                      <IconComponent className={`w-6 h-6 transition-colors duration-300 ${isHovered ? 'text-white' : 'text-gray-300'}`} />
                      {isHovered && (
                        <div className="absolute inset-0 rounded-xl border-2 border-white/40 animate-ping"></div>
                      )}
                    </div>

                    <div className="text-left text-white">
                      <div className="text-lg font-semibold">{userType.title}</div>
                      <div className="text-sm opacity-80 font-normal">{userType.subtitle}</div>
                    </div>
                  </div>
                  <ArrowRight className={`w-5 h-5 transition-transform duration-300 ${isHovered ? 'translate-x-1' : ''}`} />
                </div>
              </button>
            );
          })}
        </div>

        {/* Sign Up Section */}
        <div className="text-center">
          <p className="text-white opacity-80 text-sm">
            Don't Have an Account?{' '}
            <button
              onClick={() => onSelectUserType('donor')}
              className="font-medium underline hover:opacity-100 transition-opacity"
            >
              Sign Up Here
            </button>
          </p>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-white opacity-50 text-xs">
            Trusted by organizations worldwide
          </p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
