// Mich, 27/7 ADD TO CART 
import { db, auth } from './config';
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  doc,
  serverTimestamp,
  where
} from 'firebase/firestore';

// ✅ Save item to cart (new or update)
export const saveCartItem = async (product, quantity, charityId, charityName) => {
  const user = auth.currentUser;
  if (!user) throw new Error('User not signed in');

  if (!product || !product.id || !product.name || !charityId)
    throw new Error('Missing required fields');

  const cartRef = collection(db, 'cart');
  const q = query(
    cartRef,
    where('donorId', '==', user.uid),
    where('productId', '==', product.id),
    where('charityId', '==', charityId)
  );

  const snapshot = await getDocs(q);

  if (!snapshot.empty) {
    // Already exists → update quantity
    const existingDoc = snapshot.docs[0];
    await updateDoc(doc(db, 'cart', existingDoc.id), {
      quantity: existingDoc.data().quantity + quantity,
      updatedAt: serverTimestamp()
    });
  } else {
    // New cart item
    const cartData = {
      donorId: user.uid,
      productId: product.id,
      name: product.name,
      price: product.price || 0,
      image: product.image || null,
      vendor: product.vendor || product.vendorName || 'Unknown Vendor',
      charityId: charityId,
      charityName: charityName || product.charityName || 'Unknown Charity',
      quantity: quantity,
      selected: true,
      createdAt: serverTimestamp()
    };
    
    await addDoc(cartRef, cartData);
  }
};

// ✅ Fetch all cart items for current user
export const getUserCartItems = async () => {
  const user = auth.currentUser;
  if (!user) return [];

  const q = query(collection(db, 'cart'), where('donorId', '==', user.uid));
  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

// ✅ Update quantity for a specific cart item
export const updateCartItemQuantity = async (cartItemId, newQty) => {
  await updateDoc(doc(db, 'cart', cartItemId), {
    quantity: newQty,
    updatedAt: serverTimestamp()
  });
};

// ✅ Toggle selection for a specific cart item
export const updateCartItemSelection = async (cartItemId, isSelected) => {
  await updateDoc(doc(db, 'cart', cartItemId), {
    selected: isSelected,
    updatedAt: serverTimestamp()
  });
};

// ✅ Delete a specific cart item
export const deleteCartItem = async (cartItemId) => {
  await deleteDoc(doc(db, 'cart', cartItemId));
};

// ✅ Clear all cart items for current user
export const clearUserCart = async () => {
  const user = auth.currentUser;
  if (!user) return;

  const q = query(collection(db, 'cart'), where('donorId', '==', user.uid));
  const snapshot = await getDocs(q);

  const deletions = snapshot.docs.map(docSnap =>
    deleteDoc(doc(db, 'cart', docSnap.id))
  );

  await Promise.all(deletions);
};

// ✅ Create Orders on Checkout - donor creates order, vendor processing happens later
export const createOrdersFromCart = async () => {
  const user = auth.currentUser;
  if (!user) throw new Error("User not signed in");

  const q = query(collection(db, 'cart'), where('donorId', '==', user.uid), where('selected', '==', true));
  const snapshot = await getDocs(q);
  if (snapshot.empty) throw new Error("No selected items in cart");

  const grouped = {}; // { 'charity|vendor': [items] }

  snapshot.docs.forEach(docSnap => {
    const data = docSnap.data();
    const key = `${data.charityId}|${data.vendor}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push({ id: docSnap.id, ...data });
  });

  const ordersRef = collection(db, 'orders');

  const batchCreates = Object.entries(grouped).map(async ([key, items]) => {
    const [charityId, vendorName] = key.split('|');
    const charityName = items[0].charityName || 'Unknown Charity';
    const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const orderItems = items.map(item => ({
      productId: item.productId,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
    }));

    // ✅ Create order that vendor will process later
    // Note: vendorId in the order is actually the vendor's name (to match Firestore rules)
    return addDoc(ordersRef, {
      donorId: user.uid,
      charityId,
      charityName,
      vendorId: vendorName, // This is actually the vendor name (matches Firestore rules)
      items: orderItems,
      totalAmount,
      status: 'Pending',
      requiresProcessing: true,
      createdAt: serverTimestamp()
    });
  });

  await Promise.all(batchCreates);
  await clearUserCart();
};
