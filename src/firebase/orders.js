import { db, auth } from './config';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';

// ✅ Get all orders for current vendor
export const getVendorOrders = async () => {
  const user = auth.currentUser;
  if (!user) throw new Error("Vendor not signed in");

  const q = query(collection(db, 'orders'), where('vendorId', '==', user.uid));
  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

// ✅ Update status of a specific order
export const updateOrderStatus = async (orderId, newStatus, vendorId) => {
  await updateDoc(doc(db, 'orders', orderId), {
    status: newStatus,
    vendorId, // 🔑 required for Firestore rule to pass
    updatedAt: serverTimestamp()
  });
};