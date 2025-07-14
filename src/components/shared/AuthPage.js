import React, { useState } from 'react';
import { ArrowLeft, Apple, Heart, Package, FileText } from 'lucide-react';

const AuthPage = ({ onLogin, userType: selectedUserType, onBack }) => {
  const [isSignIn, setIsSignIn] = useState(true);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    socials: '',
    location: '',
    queries: ''
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = () => {
    // Create user data based on selected user type from landing page
    const userData = {
      id: Date.now(),
      type: selectedUserType,
      email: formData.email,
      name: formData.fullName || 'User',
      phone: formData.phone,
      location: formData.location,
      socials: formData.socials,
      isSignIn: isSignIn
    };
    
    console.log(`${isSignIn ? 'Sign in' : 'Sign up'} attempt:`, userData);
    
    // Call the onLogin function to navigate to appropriate dashboard
    onLogin(userData);
  };

  const handleBackClick = () => {
    if (!isSignIn) {
      setIsSignIn(true);
      setFormData({
        fullName: '',
        email: '',
        password: '',
        phone: '',
        socials: '',
        location: '',
        queries: ''
      });
    } else {
      // Navigate back to landing page
      onBack();
    }
  };

  const toggleAuthMode = () => {
    setIsSignIn(!isSignIn);
    setFormData({
      fullName: '',
      email: '',
      password: '',
      phone: '',
      socials: '',
      location: '',
      queries: ''
    });
  };

  // Dynamic content based on selected user type
  const getUserTypeContent = () => {
    switch (selectedUserType) {
      case 'charity':
        return {
          signInWelcome: "Welcome back! Ready to make a difference in the world?",
          signUpDescription: "Join our platform to connect with donors and get the support your cause needs.",
          submitText: isSignIn ? 'SIGN IN' : 'SUBMIT FOR VERIFICATION'
        };
      case 'donor':
        return {
          signInWelcome: "Welcome back! Ready to support amazing causes?",
          signUpDescription: "Join our community of donors and help make a positive impact on the world.",
          submitText: isSignIn ? 'SIGN IN' : 'CREATE ACCOUNT'
        };
      case 'vendor':
        return {
          signInWelcome: "Welcome back! Ready to serve relief organizations?",
          signUpDescription: "Partner with us to provide essential supplies and services to relief organizations.",
          submitText: isSignIn ? 'SIGN IN' : 'SUBMIT FOR VERIFICATION'
        };
      default:
        return {
          signInWelcome: "A very heartwarming welcoming sentence here",
          signUpDescription: "Join our platform to make a difference.",
          submitText: isSignIn ? 'SIGN IN' : 'SUBMIT FORM'
        };
    }
  };

  const content = getUserTypeContent();

  return (
    <div className="max-w-sm mx-auto bg-gray-50 min-h-screen">
      <div className="bg-white w-full p-8 relative min-h-screen">
        <button 
          onClick={handleBackClick}
          className="absolute top-6 left-6 p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>

        <div className="text-center mb-8 pt-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isSignIn ? 'Sign In' : 'Sign Up'}
          </h1>
          <p className="text-gray-600">
            {isSignIn ? content.signInWelcome : content.signUpDescription}
          </p>
        </div>

        <div className="space-y-6">
          {/* User Type Display - Show selected type */}
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
              {selectedUserType === 'charity' && <FileText className="w-4 h-4" />}
              {selectedUserType === 'donor' && <Heart className="w-4 h-4" />}
              {selectedUserType === 'vendor' && <Package className="w-4 h-4" />}
              Signing in as {selectedUserType}
            </div>
          </div>

          {/* Full Name - Show for sign up */}
          {!isSignIn && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {selectedUserType === 'charity' ? 'Organization Name' : 
                 selectedUserType === 'vendor' ? 'Company Name' : 'Full Name'}
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder={
                  selectedUserType === 'charity' ? 'Your Organization Name' :
                  selectedUserType === 'vendor' ? 'Your Company Name' : 'Your Full Name'
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent outline-none transition-all"
                required={!isSignIn}
              />
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="your.email@example.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent outline-none transition-all"
              required
            />
          </div>

          {/* Password - Show for sign in */}
          {isSignIn && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="****************"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent outline-none transition-all"
                required
              />
              <div className="text-right mt-2">
                <button
                  type="button"
                  className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Reset Password?
                </button>
              </div>
            </div>
          )}

          {/* Additional fields for sign up */}
          {!isSignIn && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Insert Number Here with Country Code"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent outline-none transition-all"
                  required={!isSignIn}
                />
              </div>

              {/* Show socials for charity and vendor */}
              {(selectedUserType === 'charity' || selectedUserType === 'vendor') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {selectedUserType === 'charity' ? 'Social Media / Website' : 'Company Website'}
                  </label>
                  <input
                    type="text"
                    name="socials"
                    value={formData.socials}
                    onChange={handleInputChange}
                    placeholder={
                      selectedUserType === 'charity' ? 'Website or social media links' : 'Company website URL'
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {selectedUserType === 'donor' ? 'City/Region' : 'Full Address'}
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder={
                    selectedUserType === 'donor' ? 'Your city or region' : 'Insert Full Address Here'
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent outline-none transition-all"
                  required={!isSignIn}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {selectedUserType === 'charity' ? 'Tell us about your cause' :
                   selectedUserType === 'vendor' ? 'Services/Products you offer' :
                   'Additional Information'} (Optional)
                </label>
                <textarea
                  name="queries"
                  value={formData.queries}
                  onChange={handleInputChange}
                  placeholder={
                    selectedUserType === 'charity' ? 'Describe your mission and the communities you serve' :
                    selectedUserType === 'vendor' ? 'What products or services do you provide?' :
                    'Any additional information you\'d like to share'
                  }
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent outline-none transition-all resize-none"
                />
              </div>
            </>
          )}

          {/* Submit Button */}
          <button
            type="button"
            onClick={handleSubmit}
            className="w-full bg-gray-800 text-white py-3 px-4 rounded-lg hover:bg-gray-900 transition-colors font-medium"
          >
            {content.submitText}
          </button>

          {/* Social login - only for sign in */}
          {isSignIn && (
            <>
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">Or Sign in with</span>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  type="button"
                  className="w-full bg-gray-800 text-white py-3 px-4 rounded-lg hover:bg-gray-900 transition-colors flex items-center justify-center gap-3"
                >
                  <Apple className="w-5 h-5" />
                  Sign in with Apple
                </button>

                <button
                  type="button"
                  className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-3"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Sign in with Google
                </button>
              </div>
            </>
          )}

          {/* Toggle between sign in/up */}
          <div className="text-center mt-6">
            {isSignIn ? (
              <p className="text-gray-600">
                Don't Have an Account?{' '}
                <button
                  type="button"
                  onClick={toggleAuthMode}
                  className="text-gray-900 font-medium hover:underline"
                >
                  Sign Up Here
                </button>
              </p>
            ) : (
              <p className="text-gray-600">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={toggleAuthMode}
                  className="text-gray-900 font-medium hover:underline"
                >
                  Sign In Here
                </button>
              </p>
            )}
          </div>

          {/* Verification note for charity/vendor signup */}
          {!isSignIn && (selectedUserType === 'charity' || selectedUserType === 'vendor') && (
            <p className="text-xs text-gray-500 text-center mt-4">
              By submitting the form, Ripple will contact you for further verification check.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;