import React, { useState, useEffect } from 'react';
import { ArrowLeft, ShoppingCart, Plus, Filter, X, Minus } from 'lucide-react';
import { useCart } from '../shared/CartContext';

const VendorProducts = ({ vendor, onBack, onSelectVendor }) => {
  const { addToCart, getTotalItems } = useCart();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);

  // Mock vendor-specific products
  const getVendorProducts = (vendorName) => {
    const productsByVendor = {
      'Freshmart': [
        {
          id: 1,
          name: "Dasani Water (2L)",
          price: 2.00,
          vendor: "Freshmart",
          stock: 200,
          images: [null, null, null],
        },
        {
          id: 7,
          name: "Cotton Blankets",
          price: 5.50,
          vendor: "Freshmart",
          stock: 45,
          images: [null, null, null],
        },
        {
          id: 8,
          name: "Canned Tuna",
          price: 3.00,
          vendor: "Freshmart",
          stock: 150,
          images: [null, null, null],
        },
        {
          id: 9,
          name: "Canned Beans",
          price: 2.80,
          vendor: "Freshmart",
          stock: 120,
          images: [null, null, null],
        },
        {
          id: 10,
          name: "Corn",
          price: 0.50,
          vendor: "Freshmart",
          stock: 300,
          images: [null, null, null],
        }
      ],
      'Abc Mart': [
        {
          id: 2,
          name: "Mineral Water",
          price: 1.50,
          vendor: "Abc Mart",
          stock: 150,
          images: [null, null, null],
        },
        {
          id: 11,
          name: "Rice Bags (5kg)",
          price: 8.00,
          vendor: "Abc Mart",
          stock: 80,
          images: [null, null, null],
        }
      ],
      'Speedmart': [
        {
          id: 3,
          name: "Evian Water",
          price: 1.70,
          vendor: "Speedmart",
          stock: 75,
          images: [null, null, null],
        }
      ],
      'Philippines Mart': [
        {
          id: 4,
          name: "Fiji Water",
          price: 1.50,
          vendor: "Philippines Mart",
          stock: 120,
          images: [null, null, null],
        }
      ],
      'Fairprice': [
        {
          id: 5,
          name: "Purified Water",
          price: 0.80,
          vendor: "Fairprice",
          stock: 300,
          images: [null, null, null],
        }
      ],
      'Premium Mart': [
        {
          id: 6,
          name: "VOSS Bottle",
          price: 3.00,
          vendor: "Premium Mart",
          stock: 50,
          images: [null, null, null],
        }
      ]
    };

    return productsByVendor[vendorName] || [];
  };

  const products = getVendorProducts(vendor?.name || vendor);

  const openProductModal = (product) => {
    setSelectedProduct(product);
    setQuantity(1);
  };

  const closeProductModal = () => {
    setSelectedProduct(null);
    setQuantity(1);
  };

  const addToCartHandler = (product, qty = 1) => {
    addToCart(product, qty);
    closeProductModal();
  };

  const updateQuantity = (change) => {
    setQuantity(prev => Math.max(1, prev + change));
  };

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && selectedProduct) {
        closeProductModal();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedProduct]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (selectedProduct) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedProduct]);

  const ProductCard = ({ product }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
      <div className="w-full h-32 bg-gray-300 rounded-lg mb-3"></div>
      <div className="space-y-2">
        <h3 className="font-medium text-gray-900 text-sm leading-tight">
          {product.name}
        </h3>
        <p className="text-lg font-semibold text-gray-900">
          ${product.price.toFixed(2)}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <div className="w-4 h-4 bg-gray-400 rounded-full"></div>
            <span className="text-xs text-gray-600">{product.vendor}</span>
          </div>
          <button
            onClick={() => openProductModal(product)}
            className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors"
          >
            <Plus className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </div>
  );

  const ProductModal = () => {
    if (!selectedProduct) return null;

    return (
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            closeProductModal();
          }
        }}
      >
        <div className="bg-white rounded-2xl w-full max-w-md mx-auto relative">
          <button
            onClick={closeProductModal}
            className="absolute top-4 right-4 z-10 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>

          <div className="relative">
            <div className="w-full h-64 bg-gray-300 rounded-t-2xl"></div>
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {selectedProduct.images.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index === 0 ? 'bg-gray-800' : 'bg-gray-400'
                  }`}
                ></div>
              ))}
            </div>
          </div>

          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {selectedProduct.name}
              </h2>
              <p className="text-3xl font-bold text-gray-900 mb-2">
                ${selectedProduct.price.toFixed(2)}
              </p>
              <p className="text-gray-500 mb-4">
                Stock: {selectedProduct.stock}
              </p>
              
              {/* Vendor - Now Clickable */}
              <button 
                onClick={() => {
                  closeProductModal();
                  onSelectVendor && onSelectVendor(selectedProduct.vendor);
                }}
                className="flex items-center space-x-2 mb-6 hover:bg-gray-50 rounded-lg p-2 -m-2 transition-colors"
              >
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <div className="w-4 h-4 bg-gray-500 rounded-full"></div>
                </div>
                <span className="text-gray-600 font-medium underline">{selectedProduct.vendor}</span>
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-lg font-medium text-gray-700">Quantity</span>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => updateQuantity(-1)}
                    className="w-12 h-12 flex items-center justify-center hover:bg-gray-50 transition-colors"
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-4 h-4 text-gray-600" />
                  </button>
                  <span className="w-12 h-12 flex items-center justify-center bg-gray-50 text-lg font-medium">
                    {quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(1)}
                    className="w-12 h-12 flex items-center justify-center hover:bg-gray-50 transition-colors"
                    disabled={quantity >= selectedProduct.stock}
                  >
                    <Plus className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={() => addToCartHandler(selectedProduct, quantity)}
              className="w-full mt-6 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-4 px-6 rounded-xl transition-colors flex items-center justify-center space-x-2"
            >
              <ShoppingCart className="w-5 h-5" />
              <span>Add to Cart</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-sm mx-auto p-4 bg-gray-50 min-h-screen relative">
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
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button className="p-1" onClick={onBack}>
              <ArrowLeft className="w-6 h-6 text-gray-700" />
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <div className="w-4 h-4 bg-gray-500 rounded-full"></div>
              </div>
              <span className="text-lg font-medium text-gray-900">
                {vendor?.name || vendor}
              </span>
            </div>
          </div>
          <button className="p-1 relative">
            <ShoppingCart className="w-6 h-6 text-gray-700" />
            {getTotalItems() > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {getTotalItems()}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {/* Filter */}
        <div className="flex justify-end items-center mb-6">
          <button className="flex items-center space-x-1 text-gray-600">
            <Filter className="w-4 h-4" />
          </button>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Show message if no products */}
        {products.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No products available from this vendor.</p>
          </div>
        )}
      </div>

      {/* Product Detail Modal */}
      <ProductModal />
    </div>
  );
};

export default VendorProducts;