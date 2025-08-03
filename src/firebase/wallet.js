import { db, auth } from './config';
import {
  doc, getDoc, setDoc, updateDoc, arrayUnion
} from 'firebase/firestore';

const WALLET_COLLECTION = 'wallets';

// ✅ Get current vendor wallet
export const getVendorWallet = async () => {
  const user = auth.currentUser;
  if (!user) throw new Error("Not logged in");

  const ref = doc(db, WALLET_COLLECTION, user.uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    // Init wallet
    await setDoc(ref, {
      balance: 0,
      history: []
    });
    return { balance: 0, history: [] };
  }

  return snap.data();
};

// ✅ Withdraw amount from wallet
export const withdrawFromWallet = async (amount) => {
  const user = auth.currentUser;
  if (!user) throw new Error("Not logged in");

  const ref = doc(db, WALLET_COLLECTION, user.uid);
  const snap = await getDoc(ref);
  const data = snap.data();

  if (!data || data.balance < amount) return false;

  await updateDoc(ref, {
    balance: data.balance - amount,
    history: arrayUnion({
      date: new Date().toISOString(),
      amount: amount,
      type: 'withdrawal',
      description: 'Wallet withdrawal'
    })
  });

  return true;
};

// ✅ Credit vendor wallet with transaction history
export const creditVendorWallet = async (vendorId, amount) => {
  const ref = doc(db, WALLET_COLLECTION, vendorId);
  const snap = await getDoc(ref);

  const creditEntry = {
    date: new Date().toISOString(),
    amount: amount,
    type: 'credit',
    description: 'Order payment received'
  };

  if (!snap.exists()) {
    await setDoc(ref, {
      balance: amount,
      history: [creditEntry]
    });
  } else {
    const data = snap.data();
    await updateDoc(ref, {
      balance: data.balance + amount,
      history: arrayUnion(creditEntry)
    });
  }
};

// ✅ Process a single order when vendor marks it as shipped
export const processOrderOnShipped = async (orderId) => {
  const user = auth.currentUser;
  if (!user) throw new Error("Not logged in");

  try {
    // Get the order details
    const orderRef = doc(db, 'orders', orderId);
    const orderSnap = await getDoc(orderRef);
    
    if (!orderSnap.exists()) {
      throw new Error("Order not found");
    }
    
    const orderData = orderSnap.data();
    
    // Only process if it has requiresProcessing flag and hasn't been processed yet
    if (orderData.requiresProcessing) {
      // Update inventory for each item
      for (const item of orderData.items) {
        const listingRef = doc(db, 'vendors', user.uid, 'listings', item.productId);
        const listingSnap = await getDoc(listingRef);
        
        if (listingSnap.exists()) {
          const currentQty = listingSnap.data().quantity || 0;
          const newQty = Math.max(0, currentQty - item.quantity);
          await updateDoc(listingRef, { quantity: newQty });
          console.log(`📦 Updated stock for ${item.name}: ${currentQty} → ${newQty}`);
        }
      }
      
      // Credit vendor wallet (using actual user ID)
      await creditVendorWallet(user.uid, orderData.totalAmount);
      console.log(`💰 Credited wallet: SGD ${orderData.totalAmount}`);
      
      // Mark order as processed
      await updateDoc(orderRef, {
        requiresProcessing: false,
        processedAt: new Date().toISOString()
      });
      
      console.log(`✅ Order ${orderId} processed successfully`);
    }
    
  } catch (error) {
    console.error('❌ Error processing order on shipped:', orderId, error);
    throw error;
  }
};