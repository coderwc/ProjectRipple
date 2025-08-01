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
  getDoc,
  getDocs
} from 'firebase/firestore';

const ViewOrders = ({ onNavigateToHome }) => {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('All');
  const [sortBy, setSortBy] = useState('Date');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [charities, setCharities] = useState({}); // Cache for charity names

  // Function to generate nice order ID
  const generateOrderDisplayId = (orderId, index) => {
    // Create a consistent order number based on the document ID
    const orderNumber = (index + 1).toString().padStart(4, '0');
    return `ORDER${orderNumber}`;
  };

  // Function to fetch charity name
  const fetchCharityName = async (charityId) => {
    if (charities[charityId]) {
      return charities[charityId];
    }

    // Quick fix: Handle numeric charity IDs with hardcoded mapping
    const quickCharityMap = {
      '1': 'Hope Foundation',
      '2': 'Food Bank Network',
      '3': 'Animal Rescue Center',
      '4': 'Children Education Fund',
      '5': 'Community Health Initiative'
    };

    if (quickCharityMap[charityId]) {
      const charityName = quickCharityMap[charityId];
      setCharities(prev => ({ ...prev, [charityId]: charityName }));
      return charityName;
    }

    try {
      console.log('🔍 Fetching charity with ID:', charityId);
      
      // Method 1: Direct document lookup (if charityId is a Firebase document ID)
      if (typeof charityId === 'string' && charityId.length > 10) {
        const charityDoc = await getDoc(doc(db, 'charities', charityId));
        if (charityDoc.exists()) {
          const charityData = charityDoc.data();
          console.log('📄 Found charity document:', charityData);
          
          const charityName = charityData.charityName || 
                             charityData.name || 
                             charityData.title || 
                             charityData.headline ||
                             'Unknown Charity';
          
          console.log('✅ Found charity by document ID:', charityName);
          setCharities(prev => ({ ...prev, [charityId]: charityName }));
          return charityName;
        }
      }

      // Method 2: Check users collection for charity accounts (proper way)
      const usersRef = collection(db, 'users');
      const charityQuery = query(usersRef, 
        where('type', '==', 'charity'),
        where('uid', '==', charityId)
      );
      const charitySnapshot = await getDocs(charityQuery);
      
      if (!charitySnapshot.empty) {
        const charityData = charitySnapshot.docs[0].data();
        const charityName = charityData.name || 'Unknown Charity';
        console.log('✅ Found charity in users collection:', charityName);
        setCharities(prev => ({ ...prev, [charityId]: charityName }));
        return charityName;
      }

      console.log('❌ No charity found for ID:', charityId);
      
    } catch (error) {
      console.error('💥 Error fetching charity:', error);
    }
    
    return `Charity #${charityId}`;
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
        // Get vendor information from vendors collection
        const vendorDoc = await getDoc(doc(db, 'vendors', user.uid));
        if (!vendorDoc.exists()) {
          setError('Vendor profile not found');
          setLoading(false);
          return;
        }

        const vendorData = vendorDoc.data();
        const vendorName = vendorData.name;

        // Query orders where vendorId matches the vendor's name
        const ordersRef = collection(db, 'orders');
        const q = query(
          ordersRef,
          where('vendorId', '==', vendorName)
        );

        // Set up real-time listener for live updates
        const unsubscribe = onSnapshot(q, 
          async (snapshot) => {
            const ordersData = await Promise.all(
              snapshot.docs.map(async (doc, index) => {
                const data = doc.data();
                
                // Fetch charity name
                const charityName = await fetchCharityName(data.charityId);
                
                return {
                  id: doc.id,
                  ...data,
                  // Generate nice order display ID
                  displayId: generateOrderDisplayId(doc.id, index),
                  // Add charity name
                  charityName: charityName,
                  // Convert Firestore timestamp to readable date
                  date: data.createdAt?.toDate().toISOString().split('T')[0] || 'N/A',
                  // Store the actual timestamp for sorting
                  timestamp: data.createdAt?.toDate() || new Date(0),
                  // Calculate total items and get first item name for display
                  totalItems: data.items?.reduce((sum, item) => sum + item.quantity, 0) || 0,
                  firstItemName: data.items?.[0]?.name || 'Unknown Item',
                  itemCount: data.items?.length || 0
                };
              })
            );
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
    fetchVendorDataAndOrders().then(unsub => {
      unsubscribe = unsub;
    });

    // Cleanup listener on unmount
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status: newStatus,
        updatedAt: serverTimestamp()
      });
      // Order will automatically update via the real-time listener
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status');
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
      if (sortBy === 'Date') return b.timestamp - a.timestamp; // Use timestamp for proper sorting
      if (sortBy === 'Status') return statusOrder[a.status] - statusOrder[b.status];
      return 0;
    });

  if (loading) {
    return (
      <div className="max-w-sm mx-auto min-h-screen bg-gradient-to-b from-blue-200 via-blue-100 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-blue-700">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-sm mx-auto min-h-screen bg-gradient-to-b from-blue-200 via-blue-100 to-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-red-600 mb-2">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="text-sm text-blue-600 underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-sm mx-auto min-h-screen bg-gradient-to-b from-blue-200 via-blue-100 to-white">

      {/* Status Bar */}
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
          <h1 className="text-xl font-bold text-blue-800">
            View Orders 
            <span className="text-sm font-normal text-blue-600 ml-2">
              ({filteredOrders.length} {filteredOrders.length === 1 ? 'order' : 'orders'})
            </span>
          </h1>
        </div>
      </div>

      {/* Filters */}
      <div className="px-4 pt-6">
        <div className="flex flex-wrap gap-2">
        {['All', 'Pending', 'Shipped', 'Completed', 'Cancelled'].map((status) => (
            <button
              key={status}
              className={`px-3 py-1 text-sm rounded-full border ${
                filter === status 
                  ? 'bg-blue-600 text-white border-blue-600' 
                  : 'bg-white text-blue-700 border-blue-300 hover:bg-blue-50'
              }`}
              onClick={() => setFilter(status)}
            >
              {status}
            </button>
          ))}
        </div>

        <div className="mt-3">
          <label className="text-sm text-blue-700">Sort by: </label>
          <select
            className="ml-2 border border-blue-300 text-sm px-2 py-1 rounded bg-white text-blue-700 focus:border-blue-500 focus:outline-none"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="Date">Date</option>
            <option value="Status">Status</option>
          </select>
        </div>
      </div>

      {/* Orders */}
      <div className="px-4 py-6 space-y-4 pb-24">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="w-8 h-8 bg-blue-400 rounded-full"></div>
            </div>
            <h3 className="text-lg font-medium text-blue-800 mb-2">No orders found</h3>
            <p className="text-sm text-blue-600">
              {filter === 'All' ? 'No orders yet. Orders will appear here once customers place them.' : `No ${filter.toLowerCase()} orders found.`}
            </p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div key={order.id} className="bg-white rounded-xl p-4 shadow-sm border border-blue-200">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-semibold text-blue-800">#{order.displayId}</span>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                    order.status === 'Pending'
                        ? 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                        : order.status === 'Shipped'
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : order.status === 'Completed'
                        ? 'bg-green-100 text-green-700 border border-green-200'
                        : order.status === 'Cancelled'
                        ? 'bg-red-100 text-red-700 border border-red-200'
                        : 'bg-gray-100 text-gray-700 border border-gray-200'
                }`}>
                    {order.status}
                </span>
              </div>

              {/* Order Items */}
              <div className="space-y-2 mb-3">
                {order.items && order.items.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm bg-blue-50 px-3 py-2 rounded-lg">
                    <span className="text-blue-800 font-medium">{item.name}</span>
                    <span className="text-blue-600">×{item.quantity}</span>
                  </div>
                ))}
              </div>

              <div className="text-xs text-blue-600 space-y-1 bg-blue-50 p-3 rounded-lg">
                <p><strong className="text-blue-800">Total Items:</strong> {order.totalItems}</p>
                <p><strong className="text-blue-800">Charity:</strong> {order.charityName}</p>
                <p><strong className="text-blue-800">Order Date:</strong> {order.date}</p>
              </div>

              {/* Action buttons */}
              {order.status === 'Pending' && (
                <div className="mt-4 flex gap-2">
                  <button
                    className="flex-1 text-sm px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    onClick={() => updateOrderStatus(order.id, 'Shipped')}
                  >
                    Mark as Shipped
                  </button>
                  <button
                    className="flex-1 text-sm px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
                    onClick={() => updateOrderStatus(order.id, 'Cancelled')}
                  >
                    Cancel Order
                  </button>
                </div>
              )}

              {order.status === 'Shipped' && (
                <div className="mt-4">
                  <button
                    className="w-full text-sm px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
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