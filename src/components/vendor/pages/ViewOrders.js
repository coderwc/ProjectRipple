// src/components/vendor/frontend/ViewOrders.js
import React, { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { db, auth } from '../../../firebase/config';
import {
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc,
  serverTimestamp,
  getDoc
} from 'firebase/firestore';

const ViewOrders = ({ onNavigateToHome }) => {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('All');
  const [sortBy, setSortBy] = useState('Date');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const generateOrderDisplayId = (orderId, index) => {
    const orderNumber = (index + 1).toString().padStart(4, '0');
    return `ORDER${orderNumber}`;
  };

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setError('User not authenticated');
      setLoading(false);
      return;
    }

    const fetchVendorDataAndOrders = async () => {
      try {
        const vendorDoc = await getDoc(doc(db, 'vendors', user.uid));
        if (!vendorDoc.exists()) {
          setError('Vendor profile not found');
          setLoading(false);
          return;
        }

        const vendorData = vendorDoc.data();
        const vendorName = vendorData.name;

        const ordersRef = collection(db, 'orders');
        const q = query(ordersRef, where('vendorId', '==', vendorName));

        const unsubscribe = onSnapshot(
          q,
          async (snapshot) => {
            const ordersData = snapshot.docs.map((doc, index) => {
              const data = doc.data();
              return {
                id: doc.id,
                ...data,
                displayId: generateOrderDisplayId(doc.id, index),
                charityName: data.charityName || 'Unknown Charity',
                vendorId: data.vendorId || '',
                date: data.createdAt?.toDate().toISOString().split('T')[0] || 'N/A',
                timestamp: data.createdAt?.toDate() || new Date(0),
                totalItems: data.items?.reduce((sum, item) => sum + item.quantity, 0) || 0,
                firstItemName: data.items?.[0]?.name || 'Unknown Item',
                itemCount: data.items?.length || 0
              };
            });

            setOrders(ordersData);
            setLoading(false);
          },
          (err) => {
            console.error('Error fetching orders:', err);
            setError('Failed to load orders');
            setLoading(false);
          }
        );

        return unsubscribe;
      } catch (error) {
        console.error('Error setting up orders listener:', error);
        setError('Failed to initialize orders');
        setLoading(false);
      }
    };

    let unsubscribe;
    fetchVendorDataAndOrders().then((unsub) => {
      unsubscribe = unsub;
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const updateOrderStatus = async (orderId, newStatus, items, vendorId) => {
    try {
      if (newStatus === 'Shipped') {
        for (const item of items) {
          const listingRef = doc(db, 'vendors', vendorId, 'listings', item.productId);
          const listingSnap = await getDoc(listingRef);
          if (listingSnap.exists()) {
            const currentQty = listingSnap.data().quantity || 0;
            const newQty = Math.max(0, currentQty - item.quantity);
            await updateDoc(listingRef, { quantity: newQty });
          }
        }
      }

      await updateDoc(doc(db, 'orders', orderId), {
        status: newStatus,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status');
    }
  };

  const statusOrder = {
    Pending: 1,
    Shipped: 2,
    Completed: 3,
    Cancelled: 4
  };

  const filteredOrders = orders
    .filter((order) => (filter === 'All' ? true : order.status === filter))
    .sort((a, b) => {
      if (sortBy === 'Date') return b.timestamp - a.timestamp;
      if (sortBy === 'Status') return statusOrder[a.status] - statusOrder[b.status];
      return 0;
    });

  return (
    <div className="max-w-sm mx-auto min-h-screen bg-gray-50">
      <div className="flex justify-between items-center px-4 py-2 bg-white text-sm font-medium">
        <span>9:30</span>
        <div className="flex gap-1">
          <div className="w-4 h-2 bg-black rounded-sm"></div>
          <div className="w-4 h-2 bg-black rounded-sm"></div>
        </div>
      </div>

      <div className="relative bg-white px-4 py-6 border-b border-gray-100">
        <button onClick={onNavigateToHome} className="absolute left-4 top-6 text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-left pl-12 text-lg font-bold text-gray-900">
          View Orders
          <span className="text-sm font-normal text-gray-500 ml-2">
            ({filteredOrders.length} {filteredOrders.length === 1 ? 'order' : 'orders'})
          </span>
        </h1>
      </div>

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

      <div className="px-4 py-6 space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-gray-500">
              {filter === 'All' ? 'No orders found.' : `No ${filter.toLowerCase()} orders found.`}
            </p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div key={order.id} className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-800">#{order.displayId}</span>
                <span
                  className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    order.status === 'Pending'
                      ? 'bg-yellow-100 text-yellow-700'
                      : order.status === 'Shipped'
                      ? 'bg-blue-100 text-blue-700'
                      : order.status === 'Completed'
                      ? 'bg-green-100 text-green-700'
                      : order.status === 'Cancelled'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {order.status}
                </span>
              </div>

              <div className="space-y-1 mb-2">
                {order.items?.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-gray-700">{item.name}</span>
                    <span className="text-gray-600">×{item.quantity}</span>
                  </div>
                ))}
              </div>

              <div className="text-xs text-gray-500 space-y-1">
                <p><strong>Total Items:</strong> {order.totalItems}</p>
                <p><strong>Charity:</strong> {order.charityName}</p>
                <p><strong>Order Date:</strong> {order.date}</p>
              </div>

              {order.status === 'Pending' && (
                <div className="mt-3 flex gap-2">
                  <button
                    className="text-xs px-3 py-1.5 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                    onClick={() => updateOrderStatus(order.id, 'Shipped', order.items, order.vendorId)}
                  >
                    Mark as Shipped
                  </button>
                  <button
                    className="text-xs px-3 py-1.5 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                    onClick={() => updateOrderStatus(order.id, 'Cancelled')}
                  >
                    Cancel Order
                  </button>
                </div>
              )}

              {order.status === 'Shipped' && (
                <div className="mt-3">
                  <button
                    className="text-xs px-3 py-1.5 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                    onClick={() => updateOrderStatus(order.id, 'Completed')}
                  >
                    Mark as Completed
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
