import { db, auth } from './config';
import {
  doc, getDoc, setDoc, updateDoc, arrayUnion,
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
      amount
    })
  });

  return true;
};

// ✅ Update wallet (called when order is marked Completed)
export const creditVendorWallet = async (vendorId, amount) => {
  const ref = doc(db, WALLET_COLLECTION, vendorId);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    await setDoc(ref, {
      balance: amount,
      history: []
    });
  } else {
    const data = snap.data();
    await updateDoc(ref, {
      balance: data.balance + amount
    });
  }
};