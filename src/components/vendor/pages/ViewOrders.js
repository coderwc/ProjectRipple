import React, { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';

const ViewOrders = ({ onNavigateToHome }) => {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('All');
  const [sortBy, setSortBy] = useState('Date'); // 'Date' or 'Status'

  useEffect(() => {
    const mockOrders = [
      { id: 'ORD001', customer: 'Jane Doe', item: 'Organic Apples', quantity: 3, status: 'Pending', date: '2025-07-13' },
      { id: 'ORD002', customer: 'John Smith', item: 'Wholegrain Bread', quantity: 2, status: 'Shipped', date: '2025-07-12' },
      { id: 'ORD003', customer: 'Ali Lim', item: 'Bananas', quantity: 6, status: 'Completed', date: '2025-07-10' },
    ];
    setOrders(mockOrders);
  }, []);

  const updateOrderStatus = (id, newStatus) => {
    setOrders((prev) =>
      prev.map((order) => (order.id === id ? { ...order, status: newStatus } : order))
    );
  };

  const statusOrder = {
    Pending: 1,
    Shipped: 2,
    Completed: 3,
    Cancelled: 4,
  };
  
  const filteredOrders = orders
    .filter((order) => (filter === 'All' ? true : order.status === filter))
    .sort((a, b) => {
      if (sortBy === 'Date') return new Date(b.date) - new Date(a.date);
      if (sortBy === 'Status') return statusOrder[a.status] - statusOrder[b.status];
      return 0;
    });
    
  return (
    <div className="max-w-sm mx-auto min-h-screen bg-gray-50">
      {/* Header */}
      <div className="relative bg-white px-4 py-6 border-b border-gray-100">
        <button onClick={onNavigateToHome} className="absolute left-4 top-6 text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-center text-lg font-semibold text-gray-900">View Orders</h1>
      </div>

      {/* Filters */}
      <div className="px-4 pt-4">
        <div className="flex flex-wrap gap-2">
        {['All', 'Pending', 'Shipped', 'Completed', 'Cancelled'].map((status) => (
            <button
              key={status}
              className={`px-3 py-1 text-sm rounded-full border ${
                filter === status ? 'bg-blue-600 text-white' : 'bg-white text-gray-600'
              }`}
              onClick={() => setFilter(status)}
            >
              {status}
            </button>
          ))}
        </div>

        <div className="mt-3">
          <label className="text-sm text-gray-600">Sort by: </label>
          <select
            className="ml-2 border text-sm px-2 py-1 rounded"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="Date">Date</option>
            <option value="Status">Status</option>
          </select>
        </div>
      </div>

      {/* Orders */}
      <div className="px-4 py-6 space-y-4">
        {filteredOrders.length === 0 ? (
          <p className="text-sm text-gray-500">No orders found.</p>
        ) : (
          filteredOrders.map((order) => (
            <div key={order.id} className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-800">#{order.id}</span>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    order.status === 'Pending'
                        ? 'bg-yellow-100 text-yellow-700'
                        : order.status === 'Shipped'
                        ? 'bg-blue-100 text-blue-700'
                        : order.status === 'Completed'
                        ? 'bg-green-100 text-green-700'
                        : order.status === 'Cancelled'
                        ? 'bg-red-100 text-red-700'
                        : ''
                }`}>
                    {order.status}
                </span>
              </div>
              <p className="text-sm text-gray-600"><strong>Item:</strong> {order.item}</p>
              <p className="text-sm text-gray-600"><strong>Qty:</strong> {order.quantity}</p>
              <p className="text-sm text-gray-600"><strong>Customer:</strong> {order.customer}</p>
              <p className="text-xs text-gray-400 text-right">{order.date}</p>

              {/* Action buttons */}
              {order.status === 'Pending' && (
                <div className="mt-2 flex gap-2">
                  <button
                    className="text-xs px-2 py-1 bg-blue-500 text-white rounded"
                    onClick={() => updateOrderStatus(order.id, 'Shipped')}
                  >
                    Mark as Shipped
                  </button>
                  <button
                    className="text-xs px-2 py-1 bg-red-500 text-white rounded"
                    onClick={() => updateOrderStatus(order.id, 'Cancelled')}
                  >
                    Cancel Order
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ViewOrders;
