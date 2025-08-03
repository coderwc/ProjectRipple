import React from 'react';
import { ArrowLeft } from 'lucide-react';

const ImpactGallery = ({ onBack, postId }) => {
  // Placeholder gallery data
  const deliveries = [
    {
      id: 1,
      date: '3 Days Ago',
      deliveredOn: 'DD/MM/YYYY',
      summary: [
        { item: '20 Litre Of Water', cost: 35 },
        { item: '30 Bags Of Rice', cost: 125 }
      ],
      message: 'Lorem Ipsum Dolor Sit Amet Consectetur. Lectus Viverra Sed Aliquamquis Enim Leo.',
      image: '/images/impact1.png' // Replace with real path
    },
    {
      id: 2,
      date: '3 Days Ago',
      deliveredOn: 'DD/MM/YYYY',
      summary: [{ item: 'Instant Noodles', cost: 35 }],
      message: 'Lorem Ipsum Dolor Sit Amet Consectetur.',
      image: '/images/impact2.png'
    }
  ];

  return (
    <div className="max-w-sm mx-auto p-4 bg-gray-50 min-h-screen">
      {/* Status Bar */}
      <div className="bg-white px-4 py-2 flex justify-between items-center text-sm text-gray-600 -mx-4">
        <span>9:30</span>
        <div className="flex items-center gap-1">
          <div className="w-4 h-2 bg-black rounded-sm"></div>
          <div className="w-1 h-1 bg-black rounded-full"></div>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white px-4 py-4 border-b border-gray-200 -mx-4 mb-4">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-1 hover:bg-gray-100 rounded">
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <span className="text-lg font-medium text-gray-900">Impact Gallery</span>
        </div>
      </div>

      {/* Delivery Cards */}
      <div className="space-y-6">
        {deliveries.map((delivery) => (
          <div key={delivery.id} className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-xs text-gray-400 mb-2">{delivery.date}</p>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
              <div>
                <p className="text-sm font-semibold text-gray-800">Charity Name</p>
                <p className="text-xs text-gray-500">Verified Identification</p>
              </div>
            </div>

            <p className="text-sm text-gray-700 mb-1">
              <span className="font-semibold">Delivered on:</span> {delivery.deliveredOn}
            </p>

            <p className="text-sm font-semibold mt-2 mb-1">Summary:</p>
            <ul className="text-sm text-gray-800 mb-2">
              {delivery.summary.map((item, index) => (
                <li key={index} className="flex justify-between">
                  <span>{item.item}</span>
                  <span className="font-semibold">SGD ${item.cost}</span>
                </li>
              ))}
            </ul>

            <div className="bg-gray-100 rounded-md p-3 text-sm text-gray-700 mb-3">
              <p className="text-xs text-gray-500 mb-1">Message From Charity:</p>
              <p>{delivery.message}</p>
            </div>

            <img
              src={delivery.image}
              alt="Delivery Impact"
              className="w-full rounded-lg object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImpactGallery;