import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';

const DonorsAndMessages = ({ postId, onBack }) => {
  const [activeTab, setActiveTab] = useState('donors');

  // 🔁 Replace these with real API calls later
  const donors = [
    { name: 'Jane Doe', item: 'XX Water Bottles', time: '15 mins ago' },
    { name: 'John Smith', item: 'XX Soap Bars', time: '15 mins ago' },
    { name: 'Sarah Lee', item: 'XX Bags of Rice', time: '15 mins ago' },
  ];

  const messages = [
    { name: 'Jane Doe', message: 'Praying for your safety!', time: '15 mins ago' },
    { name: 'John Smith', message: 'Stay strong. We care deeply.', time: '15 mins ago' },
    { name: 'Sarah Lee', message: 'Sending love and help!', time: '15 mins ago' },
  ];

  return (
    <div className="max-w-sm mx-auto p-4 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white px-4 py-2 border-b border-gray-200 -mx-4 mb-4 flex items-center">
        <button onClick={onBack} className="p-1 hover:bg-gray-100 rounded mr-3">
          <ArrowLeft className="w-6 h-6 text-gray-700" />
        </button>
        <h1 className="text-lg font-medium text-gray-900">Donors & Messages</h1>
      </div>

      {/* Tabs */}
      <div className="flex mb-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('donors')}
          className={`flex-1 py-2 text-sm font-medium text-center ${
            activeTab === 'donors'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600'
          }`}
        >
          Donors
        </button>
        <button
          onClick={() => setActiveTab('messages')}
          className={`flex-1 py-2 text-sm font-medium text-center ${
            activeTab === 'messages'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600'
          }`}
        >
          Messages
        </button>
      </div>

      {/* List Content */}
      {activeTab === 'donors' ? (
        <div className="space-y-3">
          {donors.map((d, idx) => (
            <div key={idx} className="bg-white p-3 rounded shadow-sm">
              <p className="font-semibold text-gray-900">{d.name}</p>
              <p className="text-sm text-gray-700">Donated {d.item}</p>
              <p className="text-xs text-gray-400">{d.time}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((m, idx) => (
            <div key={idx} className="bg-white p-3 rounded shadow-sm">
              <p className="font-semibold text-gray-900">{m.name}</p>
              <p className="text-sm text-gray-700">{m.message}</p>
              <p className="text-xs text-gray-400">{m.time}</p>
            </div>
          ))}
        </div>
      )}

      {/* Donate Now Button */}
      <button className="mt-6 w-full py-3 text-white font-semibold bg-blue-600 rounded shadow hover:bg-blue-700">
        DONATE NOW
      </button>
    </div>
  );
};

export default DonorsAndMessages;
