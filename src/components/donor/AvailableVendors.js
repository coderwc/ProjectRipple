import React, { useState, useEffect } from 'react';
import { ArrowLeft, ShoppingCart, Plus, ChevronDown, Filter, X, Minus } from 'lucide-react';
import { useCart } from '../shared/CartContext';
import { saveCartItem } from '../../firebase/cart';
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  collectionGroup 
} from 'firebase/firestore';
import { db } from '../../firebase/config';

const AvailableVendors = ({ charity, itemFilter, onBack, onSelectVendor, onGoToCart }) => {
  const { addToCart, getTotalItems, reloadCart } = useCart();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [priceFilter, setPriceFilter] = useState('');
  const [conditionFilter, setConditionFilter] = useState('');

  // Fetch listings from all vendor subcollections
  useEffect(() => {
    const fetchListings = async () => {
      try {
        console.log('AvailableVendors - Fetching from vendor subcollections...');
        
        console.log('AvailableVendors - Starting to fetch vendor listings...');
        
        // Try direct query to your specific vendor first
        console.log('🔍 Testing direct query to your vendor...');
        const yourVendorQuery = query(
          collection(db, 'vendors', 'KzfgytI8wSWYsN4l0rgZyOYBVi93', 'listings')
        );
        
        const yourVendorSnapshot = await getDocs(yourVendorQuery);
        console.log('🎯 Direct query to your vendor found:', yourVendorSnapshot.docs.length, 'listings');
        yourVendorSnapshot.docs.forEach(doc => {
          console.log('📋 Your direct listing:', {
            id: doc.id,
            data: doc.data()
          });
        });
        
        // Also try the collectionGroup query
        console.log('🔍 AvailableVendors - Starting Firestore collectionGroup query...');
        const q = query(
          collectionGroup(db, 'listings')
          // Removed where and orderBy to avoid index requirement - will filter in code
        );
        console.log('📋 AvailableVendors - Query will fetch ALL active listings from ALL vendors');
        console.log('📋 AvailableVendors - Query created, attaching listener...');
        
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          console.log('AvailableVendors - Found', querySnapshot.docs.length, 'total listings from vendors');
          console.log('🔍 Raw Firestore documents:', querySnapshot.docs.map(doc => ({
            id: doc.id,
            path: doc.ref.path,
            data: doc.data()
          })));
          
          // Specifically look for your vendor's listings
          const yourVendorListings = querySnapshot.docs.filter(doc => 
            doc.ref.path.includes('KzfgytI8wSWYsN4l0rgZyOYBVi93')
          );
          console.log('🎯 Your vendor listings found:', yourVendorListings.length);
          yourVendorListings.forEach(doc => {
            console.log('📋 Your listing:', {
              id: doc.id,
              path: doc.ref.path,
              data: doc.data()
            });
          });
          const allListings = querySnapshot.docs.map(doc => {
            const data = { id: doc.id, ...doc.data() };
            
            console.log('📄 Listing found:', { 
              id: data.id, 
              name: data.name, 
              vendorName: data.vendorName, 
              vendorId: data.vendorId,
              status: data.status
            });
            
            // Ensure vendorName fallback if still missing (should be rare now with server fix)
            if (!data.vendorName || data.vendorName === '') {
              data.vendorName = data.vendor || 'Unknown Vendor';
            }
            
            return data;
          });
          
          // Show all listings - don't filter by status
          const listingsData = allListings;
          console.log('🎯 Active listings after filtering:', listingsData.length);
          console.log('🔍 Looking for "water very yummy" from "Gomgom"...');
          const gomgomListing = listingsData.find(listing => 
            listing.name && listing.name.toLowerCase().includes('water very yummy')
          );
          if (gomgomListing) {
            console.log('✅ Found Gomgom listing:', gomgomListing);
          } else {
            console.log('❌ Gomgom listing not found in active listings');
            console.log('📋 All active listing names:');
            listingsData.forEach((listing, index) => {
              console.log(`${index + 1}. Name: "${listing.name}" | Vendor: "${listing.vendorName}" | Status: "${listing.status}"`);
            });
          }
          
          // Additional debug info
          if (listingsData.length === 0) {
            console.log('❌ No vendor listings found in Firestore. Using mock data.');
          } else {
            console.log('✅ Using real vendor listings from Firestore.');
          }
          
          setListings(listingsData);
          setLoading(false);
        }, (error) => {
          console.error('🚨 AvailableVendors - Firestore query error:', error);
          console.log('❌ Falling back to mock data due to error');
          setLoading(false);
        });

        return () => unsubscribe();
      } catch (error) {
        console.error('Error fetching listings:', error);
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  // Mock fallback data for development
  const mockProducts = [
    {
      id: 1,
      name: "Dasani Water (2L)",
      price: 2.00,
      vendor: "YpRd698LE0aZyBEHRqEM8tFZvlQ2", //temporary for testing, linked to tionghuiyigmail
      vendorName: "Tiong Bakery",
      stock: 200,
      images: [null, null, null],
      image: null
    },
    {
      id: 2,
      name: "Mineral Water",
      price: 1.50,
      vendor: "Abc Mart",
      stock: 150,
      images: [null, null, null],
      image: null
    },
    {
      id: 3,
      name: "Evian Water",
      price: 1.70,
      vendor: "Speedmart",
      stock: 75,
      images: [null, null, null],
      image: null
    },
    {
      id: 4,
      name: "Fiji Water",
      price: 1.50,
      vendor: "Philippines Mart",
      stock: 120,
      images: [null, null, null],
      image: null
    },
    {
      id: 5,
      name: "Purified Water",
      price: 0.80,
      vendor: "Fairprice",
      stock: 300,
      images: [null, null, null],
      image: null
    },
    {
      id: 6,
      name: "VOSS Bottle",
      price: 3.00,
      vendor: "Premium Mart",
      stock: 50,
      images: [null, null, null],
      image: null
    }
  ];

  // Filter products based on itemFilter if provided
  const filterProducts = (products, filter) => {
    if (!filter) return products;
    
    return products.filter(product => {
      const productName = product.name?.toLowerCase() || '';
      const productCategory = product.category?.toLowerCase() || '';
      const filterLower = filter.toLowerCase();
      
      // First check if the product category directly matches the filter
      const categoryMappings = {
        'water bottles': ['water', 'drinks', 'beverages'],
        'blankets': ['blankets', 'bedding'],
        'first aid kits': ['medical', 'health', 'first aid'],
        'clothing': ['clothing', 'clothes', 'apparel']
      };
      
      const categoryTerms = categoryMappings[filterLower] || [];
      const categoryMatch = categoryTerms.some(term => productCategory.includes(term));
      
      // If category matches, return true immediately
      if (categoryMatch) return true;
      
      // Otherwise, fall back to name-based filtering
      const nameSearchTerms = {
        'water bottles': ['water', 'bottle', 'drink', 'beverage', 'dasani', 'evian', 'fiji', 'mineral', 'purified'],
        'blankets': ['blanket', 'cover', 'bedding', 'warm'],
        'first aid kits': ['first aid', 'medical', 'kit', 'bandage', 'medicine', 'health'],
        'clothing': ['clothes', 'shirt', 'pants', 'jacket', 'apparel', 'wear', 'socks', 'sock', 'underwear', 'dress', 'skirt', 'shorts', 'sweater', 'hoodie', 'jeans']
      };
      
      const searchTerms = nameSearchTerms[filterLower] || [filterLower];
      
      return searchTerms.some(term => productName.includes(term));
    });
  };

  // Apply additional filters (price and condition)
  const applyAdditionalFilters = (products, priceFilter, conditionFilter) => {
    let filtered = [...products];

    // Apply price filter
    if (priceFilter === 'low') {
      filtered = filtered.filter(product => parseFloat(product.price || 0) <= 5.00);
    } else if (priceFilter === 'high') {
      filtered = filtered.filter(product => parseFloat(product.price || 0) > 5.00);
    }

    // Apply condition filter
    if (conditionFilter) {
      filtered = filtered.filter(product => 
        product.condition?.toLowerCase() === conditionFilter.toLowerCase()
      );
    }

    return filtered;
  };

  // Always use real listings from Firestore - no fallback to mock data
  const baseProducts = filterProducts(listings, itemFilter);
  const products = applyAdditionalFilters(baseProducts, priceFilter, conditionFilter);
  
  console.log('🛍️ AvailableVendors - Total products to display:', products.length);
  console.log('📦 AvailableVendors - Products:', products.map(p => ({ id: p.id, name: p.name, vendor: p.vendorName || p.vendor })));
  
  if (products.length === 0) {
    console.log('❌ No real listings found - check Firestore data');
  }


  const openProductModal = (product) => {
    setSelectedProduct(product);
    setQuantity(1);
  };

  const closeProductModal = () => {
    setSelectedProduct(null);
    setQuantity(1);
  };

// Mich, 27/7 ADD TO CART replace 

const addToCartHandler = async (product, qty = 1) => {
  try {
    // Save to Firestore
    await saveCartItem(product, qty, charity?.id, charity?.name || 'Unknown Charity');
    
    // Reload cart from Firestore to ensure accurate count
    await reloadCart();
    
    closeProductModal();                                 // Close modal after success
  } catch (err) {
    console.error('❌ Failed to add to cart:', err.message);
    alert(`Something went wrong: ${err.message}`);
  }
};

//end

  const updateQuantity = (change) => {
    setQuantity(prev => Math.max(1, prev + change));
  };

  // Handle keyboard events for modal and close dropdown on outside click
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && selectedProduct) {
        closeProductModal();
      }
      if (event.key === 'Escape' && showFilterDropdown) {
        setShowFilterDropdown(false);
      }
    };

    const handleClickOutside = (event) => {
      if (showFilterDropdown && !event.target.closest('.filter-dropdown-container')) {
        setShowFilterDropdown(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [selectedProduct, showFilterDropdown]);

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
      {/* Product Image */}
      <div className="w-full h-32 bg-gray-300 rounded-lg mb-3 overflow-hidden">
        {product.image ? (
          <img 
            src={product.image} 
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-300"></div>
        )}
      </div>
      
      {/* Product Info */}
      <div className="space-y-2">
        <h3 className="font-medium text-gray-900 text-sm leading-tight">
          {product.name}
        </h3>
        <p className="text-lg font-semibold text-gray-900">
          ${parseFloat(product.price || 0).toFixed(2)}
        </p>
        
        {/* Vendor and Add Button Row */}
        <div className="flex items-center justify-between">
          <button 
            onClick={() => {
              console.log('AvailableVendors - Product clicked:', product);
              const vendorData = {
                id: product.vendorId,
                name: product.vendorName || product.vendor,
                vendorId: product.vendorId,
                vendorName: product.vendorName || product.vendor
              };
              console.log('AvailableVendors - Vendor data passed:', vendorData);
              onSelectVendor && onSelectVendor(vendorData);
            }}
            className="flex items-center space-x-1 hover:bg-gray-50 rounded px-1 py-1 transition-colors"
          >
            <div className="w-4 h-4 bg-gray-400 rounded-full"></div>
            <span className="text-xs text-gray-600 truncate max-w-[100px]">
              {product.vendorName || product.vendor || 'Unknown Vendor'}
            </span>
          </button>
          <button
            onClick={() => openProductModal(product)}
            className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors"
          >
            <Plus className="w-4 h-4 text-white" />
          </button>
        </div>
        {/* Additional product info */}
        {product.quantity && (
          <p className="text-xs text-gray-500">Stock: {product.quantity}</p>
        )}
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
        <div className="bg-white rounded-2xl w-full max-w-md mx-auto relative" onClick={(e) => e.stopPropagation()}>
          {/* Close Button */}
          <button
            onClick={closeProductModal}
            className="absolute top-4 right-4 z-10 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>

          {/* Product Image Carousel */}
          <div className="relative">
            <div className="w-full h-64 bg-gray-300 rounded-t-2xl overflow-hidden">
              {selectedProduct.image ? (
                <img 
                  src={selectedProduct.image} 
                  alt={selectedProduct.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-300"></div>
              )}
            </div>
            
            {/* Image Dots */}
            {selectedProduct.images && selectedProduct.images.length > 0 && (
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
            )}
          </div>

          {/* Product Details */}
          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {selectedProduct.name}
              </h2>
              <p className="text-3xl font-bold text-gray-900 mb-2">
                ${parseFloat(selectedProduct.price || 0).toFixed(2)}
              </p>
              <p className="text-gray-500 mb-2">
                Stock: {selectedProduct.quantity || selectedProduct.stock || 'N/A'}
              </p>
              {selectedProduct.condition && (
                <p className="text-gray-500 mb-2">
                  Condition: {selectedProduct.condition}
                </p>
              )}
              {selectedProduct.category && (
                <p className="text-gray-500 mb-4">
                  Category: {selectedProduct.category}
                </p>
              )}
              {selectedProduct.description && (
                <p className="text-gray-600 mb-4 text-sm">
                  {selectedProduct.description}
                </p>
              )}
              
              {/* Vendor - Now Clickable */}
              <button 
                onClick={() => {
                  closeProductModal();
                  const vendorData = {
                    id: selectedProduct.vendorId,
                    name: selectedProduct.vendorName || selectedProduct.vendor,
                    vendorId: selectedProduct.vendorId,
                    vendorName: selectedProduct.vendorName || selectedProduct.vendor
                  };
                  console.log('AvailableVendors Modal - Vendor data passed:', vendorData);
                  onSelectVendor && onSelectVendor(vendorData);
                }}
                className="flex items-center space-x-2 mb-6 hover:bg-gray-50 rounded-lg p-2 -m-2 transition-colors"
              >
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <div className="w-4 h-4 bg-gray-500 rounded-full"></div>
                </div>
                <span className="text-gray-600 font-medium underline">
                  {selectedProduct.vendorName || selectedProduct.vendor || 'Unknown Vendor'}
                </span>
              </button>
            </div>

            {/* Quantity and Add to Cart */}
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
                    disabled={quantity >= (selectedProduct.quantity || selectedProduct.stock || 999)}
                  >
                    <Plus className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>

            {/* Add to Cart Button */}
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
              <div className="flex items-center space-x-1">
                <span className="text-lg font-medium text-gray-900">
                  {charity?.name || 'Charity Name'}
                </span>
                <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
          <button className="p-1 relative" onClick={onGoToCart}>
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
        {/* Shop from available vendors title */}
        <h2 className="text-xl font-medium text-gray-900 mb-4">
          {itemFilter ? `Shop for ${itemFilter}:` : 'Shop from available vendors:'}
        </h2>
        
        {/* Filter indicator */}
        {itemFilter && (
          <div className="bg-blue-100 border border-blue-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-blue-800">
              <span className="font-medium">Filtering by:</span> {itemFilter}
            </p>
            <p className="text-xs text-blue-600 mt-1">
              Showing products that match your selection from the charity post
            </p>
          </div>
        )}

        {/* Filter */}
        <div className="flex justify-end items-center mb-6 relative filter-dropdown-container z-10">
          <button
            onClick={() => setShowFilterDropdown(!showFilterDropdown)}
            className="flex items-center gap-1 text-gray-600 text-sm hover:text-gray-800 border rounded px-2 py-1 bg-white"
          >
            <Filter className="w-4 h-4" />
            Filter
          </button>
          {showFilterDropdown && (
            <div className="absolute top-8 right-0 bg-white border border-gray-200 rounded shadow-md text-sm text-gray-700 w-[280px]">
              <div className="p-4">
                {/* Filter Options */}
                <div className="flex gap-4 mb-4">
                  {/* Price Filter Section */}
                  <div className="flex flex-col gap-2" style={{width: '120px'}}>
                    <div className="font-semibold mb-1">Price</div>
                    <button 
                      onClick={() => setPriceFilter('')}
                      className={`text-left px-3 py-1 rounded hover:bg-gray-100 whitespace-nowrap ${priceFilter === '' ? 'bg-blue-50 text-blue-600' : ''}`}
                    >
                      All
                    </button>
                    <button 
                      onClick={() => setPriceFilter('low')}
                      className={`text-left px-3 py-1 rounded hover:bg-gray-100 whitespace-nowrap ${priceFilter === 'low' ? 'bg-blue-50 text-blue-600' : ''}`}
                    >
                      Low (≤$5)
                    </button>
                    <button 
                      onClick={() => setPriceFilter('high')}
                      className={`text-left px-3 py-1 rounded hover:bg-gray-100 whitespace-nowrap ${priceFilter === 'high' ? 'bg-blue-50 text-blue-600' : ''}`}
                    >
                      High (>$5)
                    </button>
                  </div>
                  
                  {/* Condition Filter Section */}
                  <div className="flex flex-col gap-2" style={{width: '120px'}}>
                    <div className="font-semibold mb-1">Condition</div>
                    <button 
                      onClick={() => setConditionFilter('')}
                      className={`text-left px-3 py-1 rounded hover:bg-gray-100 whitespace-nowrap ${conditionFilter === '' ? 'bg-blue-50 text-blue-600' : ''}`}
                    >
                      All
                    </button>
                    <button 
                      onClick={() => setConditionFilter('used')}
                      className={`text-left px-3 py-1 rounded hover:bg-gray-100 whitespace-nowrap ${conditionFilter === 'used' ? 'bg-blue-50 text-blue-600' : ''}`}
                    >
                      Used
                    </button>
                    <button 
                      onClick={() => setConditionFilter('defect')}
                      className={`text-left px-3 py-1 rounded hover:bg-gray-100 whitespace-nowrap ${conditionFilter === 'defect' ? 'bg-blue-50 text-blue-600' : ''}`}
                    >
                      Defect
                    </button>
                    <button 
                      onClick={() => setConditionFilter('new')}
                      className={`text-left px-3 py-1 rounded hover:bg-gray-100 whitespace-nowrap ${conditionFilter === 'new' ? 'bg-blue-50 text-blue-600' : ''}`}
                    >
                      New
                    </button>
                  </div>
                </div>
                
                {/* Clear Filter Button */}
                <div className="border-t border-gray-200 pt-3">
                  <button 
                    onClick={() => {
                      setPriceFilter('');
                      setConditionFilter('');
                      setShowFilterDropdown(false);
                    }}
                    className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded text-center font-medium"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-8">
            <p className="text-gray-500">Loading available products...</p>
          </div>
        )}

        {/* Products Grid */}
        {!loading && (
          <div className="grid grid-cols-2 gap-4 mb-8">
            {products.map((product, index) => (
              <ProductCard key={`${product.id}-${index}`} product={product} />
            ))}
          </div>
        )}

        {/* No Products Message */}
        {!loading && products.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">
              {itemFilter 
                ? `No ${itemFilter.toLowerCase()} available at the moment.`
                : 'No products available at the moment.'
              }
            </p>
            {itemFilter && (
              <p className="text-sm text-gray-400 mt-2">
                Try browsing all products by going back and shopping without a filter.
              </p>
            )}
          </div>
        )}

      </div>

      {/* Product Detail Modal */}
      <ProductModal />
    </div>
  );
};

export default AvailableVendors;