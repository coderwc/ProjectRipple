import React from 'react';
import { ArrowLeft } from 'lucide-react';

const Wallet = ({ 
  onNavigateToHome, 
  vendorName = 'Freshmart', 
  balance = 250.0, 
  onWithdraw, 
  history = [] 
}) => {
  const handleWithdraw = () => {
    const amountStr = prompt('Enter amount to withdraw:');
    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid amount.');
    } else if (!onWithdraw(amount)) {
      alert('Withdrawal failed. Check your balance.');
    }
  };

  return (
    <div className="max-w-sm mx-auto min-h-screen bg-gray-50 relative">
      {/* Top status bar */}
      <div className="flex justify-between items-center px-4 py-2 bg-white text-sm font-medium">
        <span>9:30</span>
        <div className="flex gap-1">
          <div className="w-4 h-2 bg-black rounded-sm"></div>
          <div className="w-4 h-2 bg-black rounded-sm"></div>
        </div>
      </div>

      {/* Header */}
      <div className="relative bg-white px-4 py-6 border-b border-gray-100">
        <button onClick={onNavigateToHome} className="absolute left-4 top-6 text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-center text-lg font-semibold text-gray-900">My Balance</h1>
      </div>

      {/* Wallet card */}
      <div className="px-4 py-6">
        <div className="bg-white border rounded-xl shadow p-6 text-center">
          <div className="h-24 w-24 mx-auto rounded-full bg-gray-100 mb-4" />
          <h2 className="text-lg font-semibold text-gray-900">{vendorName}</h2>
          <p className="text-sm text-gray-500 mb-4">Your Wallet</p>
          <p className="text-3xl font-bold text-gray-800 mb-6">SGD {balance.toFixed(2)}</p>
          <button
            onClick={handleWithdraw}
            className="w-full bg-blue-600 text-white font-medium py-2 rounded-xl hover:bg-blue-700 transition-colors"
          >
            WITHDRAW
          </button>
        </div>
      </div>

      {/* Withdrawal history */}
      <div className="px-4 pb-8">
        <h3 className="text-md font-semibold text-gray-800 mb-2">Withdrawal History</h3>
        {history.length === 0 ? (
          <p className="text-sm text-gray-500">No withdrawals yet.</p>
        ) : (
          <ul className="space-y-2">
            {history.map((entry, index) => (
              <li key={index} className="text-sm text-gray-700 flex justify-between border-b pb-1">
                <span>{new Date(entry.date).toLocaleString()}</span>
                <span className="text-red-600">- SGD {entry.amount.toFixed(2)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Wallet;