import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [selectedCharity, setSelectedCharity] = useState(null);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('rippleCart');
    if (savedCart) {
      try {
        const cartData = JSON.parse(savedCart);
        setCartItems(cartData.items || []);
        setSelectedCharity(cartData.charity || null);
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    const cartData = {
      items: cartItems,
      charity: selectedCharity
    };
    localStorage.setItem('rippleCart', JSON.stringify(cartData));
  }, [cartItems, selectedCharity]);

  const addToCart = (product, quantity = 1) => {
    for (let i = 0; i < quantity; i++) {
      setCartItems(prev => [...prev, { 
        ...product, 
        uniqueId: `${product.id}-${Date.now()}-${Math.random()}`,
        addedAt: new Date().toISOString()
      }]);
    }
  };

  const removeFromCart = (uniqueId) => {
    setCartItems(prev => prev.filter(item => item.uniqueId !== uniqueId));
  };

  const updateCartItemQuantity = (uniqueId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(uniqueId);
      return;
    }
    
    setCartItems(prev => 
      prev.map(item => 
        item.uniqueId === uniqueId 
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
    setSelectedCharity(null);
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.price * (item.quantity || 1)), 0);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + (item.quantity || 1), 0);
  };

  const getUniqueProducts = () => {
    const productMap = new Map();
    
    cartItems.forEach(item => {
      if (productMap.has(item.id)) {
        productMap.set(item.id, {
          ...productMap.get(item.id),
          quantity: productMap.get(item.id).quantity + (item.quantity || 1)
        });
      } else {
        productMap.set(item.id, {
          ...item,
          quantity: item.quantity || 1
        });
      }
    });
    
    return Array.from(productMap.values());
  };

  const setCharity = (charity) => {
    setSelectedCharity(charity);
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      selectedCharity,
      addToCart,
      removeFromCart,
      updateCartItemQuantity,
      clearCart,
      getTotalPrice,
      getTotalItems,
      getUniqueProducts,
      setCharity
    }}>
      {children}
    </CartContext.Provider>
  );
};