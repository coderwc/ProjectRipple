import React, { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { db, auth } from '../../../firebase/config';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion
} from 'firebase/firestore';

const WALLET_COLLECTION = 'wallets';

const Wallet = ({ onNavigateToHome }) => {
  const [balance, setBalance] = useState(0);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [vendorName, setVendorName] = useState('Vendor');
  const [vendorImage, setVendorImage] = useState(null);

  useEffect(() => {
    const fetchWalletAndProcessOrders = async () => {
      const user = auth.currentUser;
      if (!user) return alert("Not logged in");

      try {
        // Get vendor name and image from profile
        const vendorRef = doc(db, 'vendors', user.uid);
        const vendorSnap = await getDoc(vendorRef);
        if (vendorSnap.exists()) {
          const vendorData = vendorSnap.data();
          setVendorName(vendorData.name || 'Vendor');
          setVendorImage(vendorData.imageUrl || null);
          console.log('🖼️ Vendor profile data:', { name: vendorData.name, imageUrl: vendorData.imageUrl });
        }

        // Note: Orders are now processed when vendor marks them as shipped

        // Then fetch updated wallet data
        const ref = doc(db, WALLET_COLLECTION, user.uid);
        const snap = await getDoc(ref);

        if (!snap.exists()) {
          await setDoc(ref, { balance: 0, history: [] });
          setBalance(0);
          setHistory([]);
        } else {
          const data = snap.data();
          setBalance(data.balance || 0);
          setHistory(data.history || []);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error loading wallet:', error);
        setLoading(false);
      }
    };

    fetchWalletAndProcessOrders();
  }, []);

  const handleWithdraw = async () => {
    const amountStr = prompt('Enter amount to withdraw:');
    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid amount.');
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      alert("Not logged in");
      return;
    }

    const ref = doc(db, WALLET_COLLECTION, user.uid);
    const snap = await getDoc(ref);
    const data = snap.data();

    if (!data || data.balance < amount) {
      alert('Withdrawal failed. Check your balance.');
      return;
    }

    // Update the database
    await updateDoc(ref, {
      balance: data.balance - amount,
      history: arrayUnion({
        date: new Date().toISOString(),
        amount: amount,
        type: 'withdrawal',
        description: 'Wallet withdrawal'
      })
    });

    // Refetch the wallet data to get the updated history (no duplicates)
    const updatedSnap = await getDoc(ref);
    const updatedData = updatedSnap.data();
    setBalance(updatedData.balance || 0);
    setHistory(updatedData.history || []);
  };

  if (loading) {
    return (
      <div className="max-w-sm mx-auto min-h-screen bg-gradient-to-b from-blue-200 via-blue-100 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-blue-700">Loading wallet...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-sm mx-auto min-h-screen bg-gradient-to-b from-blue-200 via-blue-100 to-white relative">
      {/* Top status bar */}
      <div className="flex justify-between items-center px-4 py-2 bg-white text-sm font-medium text-gray-700">
        <span>9:30</span>
        <div className="flex gap-1">
          <div className="w-4 h-2 bg-black rounded-sm"></div>
          <div className="w-4 h-2 bg-black rounded-sm"></div>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white px-4 py-4 border-b border-gray-100 shadow-md">
        <div className="flex items-center gap-3">
          <button onClick={onNavigateToHome}>
            <ArrowLeft className="w-6 h-6 text-blue-700" />
          </button>
          <h1 className="text-xl font-bold text-blue-800">My Balance</h1>
        </div>
      </div>

      {/* Wallet card */}
      <div className="px-4 py-6">
        <div className="bg-white border border-blue-200 rounded-xl shadow-lg p-6 text-center">
          <div className="h-24 w-24 mx-auto rounded-full mb-4 overflow-hidden border-2 border-blue-200">
            {vendorImage ? (
              <img 
                src={vendorImage} 
                alt={`${vendorName} profile`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div 
              className={`w-full h-full bg-blue-100 flex items-center justify-center ${vendorImage ? 'hidden' : 'flex'}`}
            >
              <div className="text-2xl text-blue-600">💼</div>
            </div>
          </div>
          <h2 className="text-lg font-semibold text-blue-800">{vendorName}</h2>
          <p className="text-sm text-blue-600 mb-4">Your Wallet</p>
          <p className="text-3xl font-bold text-blue-900 mb-6">SGD {balance.toFixed(2)}</p>
          <button
            onClick={handleWithdraw}
            className="w-full bg-blue-600 text-white font-medium py-2 rounded-xl hover:bg-blue-700 transition-colors"
          >
            WITHDRAW
          </button>
        </div>
      </div>

      {/* Transaction history */}
      <div className="px-4 pb-8">
        <h3 className="text-md font-semibold text-blue-800 mb-2">Transaction History</h3>
        {history.length === 0 ? (
          <p className="text-sm text-blue-600">No transactions yet.</p>
        ) : (
          <div className="bg-white rounded-xl border border-blue-200 shadow-lg p-4">
            <ul className="space-y-3">
              {history.map((entry, index) => (
                <li key={index} className="text-sm text-blue-700 flex justify-between border-b border-blue-100 pb-2">
                  <div>
                    <div className="font-medium">{new Date(entry.date).toLocaleString()}</div>
                    <div className="text-xs text-blue-500">{entry.description || (entry.type === 'withdrawal' ? 'Withdrawal' : 'Credit')}</div>
                  </div>
                  <span className={entry.type === 'credit' ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                    {entry.type === 'credit' ? '+' : '-'} SGD {entry.amount.toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wallet;