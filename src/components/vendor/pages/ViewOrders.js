import React, { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { getVendorOrders, updateOrderStatus as updateOrderStatusInDB } from '../../../firebase/orders'; // 🔄 path may vary
import { creditVendorWallet } from '../../../firebase/wallet';

const ViewOrders = ({ onNavigateToHome }) => {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('All');
  const [sortBy, setSortBy] = useState('Date'); // 'Date' or 'Status'

  useEffect(() => {
  const fetchOrders = async () => {
    try {
      const fetched = await getVendorOrders();
      setOrders(fetched);
    } catch (err) {
      console.error("❌ Failed to fetch vendor orders:", err.message);
    }
  };

  fetchOrders();
}, []);

const updateOrderStatus = async (id, newStatus) => {
  try {
    const order = orders.find(o => o.id === id);
    if (!order) throw new Error("Order not found");

    // ✅ LOG before update
    console.log("Calling updateOrderStatusInDB with:", {
      id,
      newStatus,
      vendorId: order.vendorId
    });

    // ✅ Call update with vendorId
    await updateOrderStatusInDB(id, newStatus, order.vendorId);

    // 💸 Credit wallet if needed
    if (newStatus === 'Shipped' || newStatus === 'Completed') {
      const total = order.items.reduce(
        (sum, item) => sum + item.price * item.quantity, 0
      );
      await creditVendorWallet(order.vendorId, total);
    }

    // ✅ Update local state
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o))
    );
  } catch (err) {
    console.error(`❌ Failed to update order ${id}:`, err.message);
    alert("Failed to update order. Try again.");
  }
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

      {/* Status Bar */}
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
        <h1 className="text-left pl-12 text-lg font-bold text-gray-900">View Orders</h1>
      </div>

      {/* Filters */}
      <div className="px-4 pt-6">
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
              <p className="text-sm text-gray-600"><strong>Items:</strong></p>
<ul className="ml-4 list-disc text-sm text-gray-600">
  {order.items?.map((item, idx) => (
    <li key={idx}>{item.name} × {item.quantity}</li>
  ))}
</ul>
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

