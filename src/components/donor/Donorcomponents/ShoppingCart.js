import React, { useState, useEffect } from 'react';
import { ArrowLeft, Minus, Plus, Trash2 } from 'lucide-react';
import {
  getUserCartItems,
  updateCartItemQuantity,
  updateCartItemSelection,
  deleteCartItem,
  createOrdersFromCart // ✅ Checkout logic
} from '../../../firebase/cart';
import { useCart } from '../../shared/CartContext';

// Replace mock data with real data from firestore
const ShoppingCart = ({ onGoBack }) => {
  const { removeFromCart } = useCart();
  const [cartItems, setCartItems] = useState([]); // ← real data will load here
  const [selectAll, setSelectAll] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const items = await getUserCartItems(); // from Firestore
        setCartItems(items);
      } catch (err) {
        console.error('❌ Error loading cart:', err.message);
      }
    };

    fetchCart();
  }, []);
 
//Update cart Quantity from firebae
const updateQuantity = async (id, change) => {
  const item = cartItems.find(i => i.id === id);
  if (!item) return;

  const newQty = Math.max(1, item.quantity + change);
  setCartItems(items =>
    items.map(i => i.id === id ? { ...i, quantity: newQty } : i)
  );

  try {
    await updateCartItemQuantity(id, newQty);
  } catch (err) {
    console.error('❌ Failed to update quantity in Firestore:', err.message);
  }
};

//Update cart Item selection from Firebasw
const toggleItemSelection = async (id) => {
  const updatedItems = cartItems.map(item =>
    item.id === id ? { ...item, selected: !item.selected } : item
  );
  setCartItems(updatedItems);

  const item = updatedItems.find(i => i.id === id);
  try {
    await updateCartItemSelection(id, item.selected);
  } catch (err) {
    console.error('❌ Failed to update selection in Firestore:', err.message);
  }
};

// Delete cart item from Firebase and update both local and context state
const deleteItem = async (id) => {
  try {
    // Remove from Firestore and context
    await removeFromCart(id);
    
    // Remove from local state
    setCartItems(items => items.filter(item => item.id !== id));
    
    console.log('✅ Item deleted successfully');
  } catch (err) {
    console.error('❌ Failed to delete item:', err.message);
    alert('Failed to delete item. Please try again.');
  }
};

// Toggle select all items to firebase
  const toggleSelectAll = async () => {
  const newSelectAll = !selectAll;
  setSelectAll(newSelectAll);

  const updatedItems = cartItems.map(item => ({
    ...item,
    selected: newSelectAll
  }));
  setCartItems(updatedItems);

  try {
    await Promise.all(
      updatedItems.map(item =>
        updateCartItemSelection(item.id, newSelectAll)
      )
    );
  } catch (err) {
    console.error('❌ Failed to update select-all in Firestore:', err.message);
  }
};

  const getTotal = () => {
    return cartItems
      .filter(item => item.selected)
      .reduce((total, item) => total + (item.price * item.quantity), 0)
      .toFixed(2);
  };

  const getSelectedCount = () => {
    return cartItems.filter(item => item.selected).length;
  };

  // Group items by vendor
  const groupedItems = cartItems.reduce((groups, item) => {
    const vendorName = item.vendor || item.vendorName || 'Unknown Vendor';
    if (!groups[vendorName]) {
      groups[vendorName] = [];
    }
    groups[vendorName].push(item);
    return groups;
  }, {});

  return (
    <div className="max-w-sm mx-auto bg-gray-50 min-h-screen relative">
      {/* Status Bar - matching AvailableVendors */}
      <div className="bg-white px-4 py-2 flex justify-between items-center text-sm text-gray-600 -mx-4">
        <span>9:30</span>
        <div className="flex items-center gap-1">
          <div className="w-4 h-2 bg-black rounded-sm"></div>
          <div className="w-1 h-1 bg-black rounded-full"></div>
        </div>
      </div>

      {/* Header - matching AvailableVendors structure */}
      <div className="bg-white px-4 py-4 border-b border-gray-200 -mx-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button 
              onClick={onGoBack}
              className="p-1"
            >
              <ArrowLeft className="w-6 h-6 text-gray-700" />
            </button>
            <h1 className="text-lg font-medium text-gray-900">
              Shopping Cart ({getSelectedCount()})
            </h1>
          </div>
        </div>
      </div>

      {/* Cart Content */}
      <div className="px-4 space-y-6 pb-32">
        {Object.entries(groupedItems).map(([vendorName, items]) => (
          <div key={vendorName} className="space-y-4">
            {/* Vendor Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={items.every(item => item.selected)}
                  onChange={() => {
                    const allSelected = items.every(item => item.selected);
                    setCartItems(cartItems =>
                      cartItems.map(item =>
                        items.includes(item) ? { ...item, selected: !allSelected } : item
                      )
                    );
                  }}
                  className="w-4 h-4 text-blue-600 rounded border-gray-300"
                />
                <span className="text-base font-medium text-gray-900">{vendorName}</span>
              </div>
              <button 
                onClick={() => setIsEditMode(!isEditMode)}
                className="text-blue-600 hover:text-blue-700 transition-colors text-sm"
              >
                {isEditMode ? 'Done' : 'Edit'}
              </button>
            </div>

            {/* Items from this vendor */}
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                  <div className="flex items-start space-x-3">
                    {!isEditMode && (
                      <input
                        type="checkbox"
                        checked={item.selected}
                        onChange={() => toggleItemSelection(item.id)}
                        className="w-4 h-4 text-blue-600 rounded border-gray-300 mt-2"
                      />
                    )}
                    
                    {isEditMode && (
                      <button
                        onClick={() => deleteItem(item.id)}
                        className="w-8 h-8 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white transition-colors mt-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    
                    {/* Product Image */}
                    <div className="w-20 h-20 bg-gray-300 rounded-lg flex-shrink-0 overflow-hidden">
                      {item.image ? (
                        <img 
                          src={item.image} 
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-300"></div>
                      )}
                    </div>
                    
                    {/* Product Details */}
                    <div className="flex-1 space-y-3">
                      <div>
                        <h3 className="text-base font-medium text-gray-900 leading-tight">
                          {item.name}
                        </h3>
                        <p className="text-lg font-semibold text-gray-900 mt-1">
                          ${item.price.toFixed(2)}
                        </p>
                      </div>
                      
                      {/* Quantity Controls */}
                      {!isEditMode && (
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center border border-gray-300 rounded-lg">
                            <button
                              onClick={() => updateQuantity(item.id, -1)}
                              className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 transition-colors rounded-l-lg"
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="w-4 h-4 text-gray-600" />
                            </button>
                            <span className="w-12 h-10 flex items-center justify-center bg-gray-50 text-base font-medium border-l border-r border-gray-300">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, 1)}
                              className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 transition-colors rounded-r-lg"
                            >
                              <Plus className="w-4 h-4 text-gray-600" />
                            </button>
                          </div>
                        </div>
                      )}
                      
                      {/* Display quantity when in edit mode */}
                      {isEditMode && (
                        <div className="text-gray-600 text-sm">
                          Quantity: {item.quantity}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Fixed Bottom Section - matching the image layout */}
      <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-sm bg-white border-t border-gray-200 px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={selectAll && cartItems.every(item => item.selected)}
              onChange={toggleSelectAll}
              className="w-4 h-4 text-blue-600 rounded border-gray-300"
            />
            <span className="text-base font-medium text-gray-900">All</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-lg font-semibold text-gray-900">
              Total: ${getTotal()}
            </span>
            <button // michk, 27/7, change checkout button
  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
  onClick={async () => {
    try {
      await createOrdersFromCart();
      alert('✅ Order placed successfully!');
      const items = await getUserCartItems();
      setCartItems(items); // reload cart
    } catch (err) {
      console.error('❌ Checkout error:', err.message);
      alert('Checkout failed. Please try again.');
    }
  }}
>
  CHECK OUT
</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShoppingCart;