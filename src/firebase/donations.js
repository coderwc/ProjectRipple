// src/firebase/donations.js
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './config';
import { updatePostStats } from './posts';

// Record a new donation
export const createDonation = async (donationData) => {
  try {
    const newDonation = {
      postId: donationData.postId,
      donorId: donationData.donorId,
      donorName: donationData.donorName,
      amount: donationData.amount || 0,
      items: donationData.items || [],
      message: donationData.message || '',
      createdAt: serverTimestamp()
    };
    
    // Add donation to Firestore
    const docRef = await addDoc(collection(db, 'donations'), newDonation);
    
    // Update post statistics
    await updatePostStats(donationData.postId, donationData.amount || 0);
    
    console.log('✅ Donation recorded with ID:', docRef.id);
    
    return {
      id: docRef.id,
      ...newDonation,
      createdAt: new Date().toISOString() // For immediate return
    };
  } catch (error) {
    console.error('❌ Donation creation error:', error);
    throw new Error('Failed to record donation');
  }
};

// Get donations for a specific post
export const getDonationsByPost = async (postId) => {
  try {
    const q = query(
      collection(db, 'donations'),
      where('postId', '==', postId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const donations = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      donations.push({
        id: doc.id,
        ...data,
        // Convert timestamp to ISO string for consistency
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt
      });
    });
    
    console.log(`✅ Retrieved ${donations.length} donations for post:`, postId);
    return donations;
  } catch (error) {
    console.error('❌ Donations fetch error:', error);
    throw new Error('Failed to fetch donations');
  }
};

// Get donations by donor
export const getDonationsByDonor = async (donorId) => {
  try {
    const q = query(
      collection(db, 'donations'),
      where('donorId', '==', donorId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const donations = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      donations.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt
      });
    });
    
    console.log(`✅ Retrieved ${donations.length} donations by donor:`, donorId);
    return donations;
  } catch (error) {
    console.error('❌ Donor donations fetch error:', error);
    throw new Error('Failed to fetch donor donations');
  }
};