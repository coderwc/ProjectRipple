import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';

const DonationCheckout = ({ onGoBack }) => {
  const [email, setEmail] = useState('example@gmail.com');
  const [emailConsent, setEmailConsent] = useState(false);
  const [prayerMessage, setPrayerMessage] = useState('');

  // Sample data from the cart - in a real app this would be passed as props
  const donationItems = [
    { name: "Dasani Water (2L)", quantity: 10, total: 20.00 },
    { name: "Cotton Blankets", quantity: 8, total: 44.00 },
    { name: "Purified Water", quantity: 25, total: 20.00 }
  ];

  const subtotal = donationItems.reduce((sum, item) => sum + item.total, 0);
  const deliveryFee = 14.00;
  const finalAmount = subtotal + deliveryFee;

  return (
    <div className="max-w-sm mx-auto bg-gray-50 min-h-screen">
      {/* Status Bar */}
      <div className="bg-white px-4 py-2 flex justify-between items-center text-sm text-gray-600">
        <span>9:30</span>
        <div className="flex items-center gap-1">
          <div className="w-4 h-2 bg-black rounded-sm"></div>
          <div className="w-1 h-1 bg-black rounded-full"></div>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white px-4 py-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <button 
            onClick={onGoBack}
            className="p-1"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="text-lg font-medium text-gray-900">
            Donation
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6 space-y-6">
        {/* Order Summary */}
        <div>
          <h2 className="text-base font-medium text-gray-900 mb-4">Your Summary:</h2>
          <div className="space-y-2">
            {donationItems.map((item, index) => (
              <div key={index} className="flex justify-between items-center text-sm">
                <span className="text-gray-700">
                  {item.quantity}x {item.name}
                </span>
                <span className="font-medium text-gray-900">
                  SGD ${item.total.toFixed(0)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Email Section */}
        <div>
          <label className="block text-base font-medium text-gray-900 mb-3">
            Your Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-3 border border-gray-300 rounded-lg text-base placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="example@gmail.com"
          />
          
          <div className="flex items-start space-x-2 mt-3">
            <input
              type="checkbox"
              id="emailConsent"
              checked={emailConsent}
              onChange={(e) => setEmailConsent(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded border-gray-300 mt-0.5"
            />
            <label htmlFor="emailConsent" className="text-xs text-gray-600 leading-relaxed">
              By Checking This Box, I Ensure That This Email I Provided Is Accurate
            </label>
          </div>
        </div>

        {/* Prayer Message Section */}
        <div>
          <label className="block text-base font-medium text-gray-900 mb-3">
            Leave A Prayer (Optional)
          </label>
          <textarea
            value={prayerMessage}
            onChange={(e) => setPrayerMessage(e.target.value)}
            placeholder="Write Down Your Message To The Charity"
            className="w-full px-3 py-3 border border-gray-300 rounded-lg text-base placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            rows={4}
          />
        </div>

        {/* Cost Breakdown */}
        <div className="space-y-2 pt-4">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-700">Delivery Fee:</span>
            <span className="font-medium text-gray-900">$14</span>
          </div>
          <div className="text-xs text-gray-500">
            Deliver To: XXXXXX
          </div>
          
          <div className="flex justify-between items-center text-lg font-semibold text-gray-900 pt-2 border-t border-gray-200">
            <span>Final Amount:</span>
            <span>${finalAmount.toFixed(0)}</span>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Button */}
      <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-sm bg-white px-4 py-4">
        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-lg font-semibold text-base transition-colors">
          CONTINUE
        </button>
      </div>
    </div>
  );
};

export default DonationCheckout;