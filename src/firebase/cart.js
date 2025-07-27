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
  where // ✅ THIS IS NEEDED HERE
} from 'firebase/firestore';

// ✅ Save item to cart (new or update)
export const saveCartItem = async (product, quantity, charityId) => {
  const user = auth.currentUser;
  if (!user) throw new Error('User not signed in');

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
    await addDoc(cartRef, {
      donorId: user.uid,
      productId: product.id,
      name: product.name,
      price: product.price,
      vendor: product.vendor,
      charityId: charityId,
      quantity: quantity,
      selected: true,
      createdAt: serverTimestamp()
    });
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

// ✅ Clear all cart items for current user (after checkout)
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

//----------------------------------------Checkout----------------------------------------

// ✅ Create Orders on Checkout
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
    const [charityId, vendorId] = key.split('|');
    const orderItems = items.map(item => ({
      productId: item.productId,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
    }));

    return addDoc(ordersRef, {
      donorId: user.uid,
      charityId,
      vendorId,
      items: orderItems,
      status: 'Pending',
      createdAt: serverTimestamp()
    });
  });

  await Promise.all(batchCreates);

  await clearUserCart(); // clear cart after checkout
};