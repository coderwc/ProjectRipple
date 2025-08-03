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
import { updatePostStats, recordItemDonations } from './posts';

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
    
    // If items were donated, record the item donations
    if (donationData.items && donationData.items.length > 0) {
      await recordItemDonations(
        donationData.postId, 
        donationData.items, 
        donationData.donorId, 
        donationData.donorName
      );
      console.log('✅ Item donations recorded for post:', donationData.postId);
    }
    
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

// Create item donation specifically (when donors buy items for charity)
export const createItemDonation = async (donationData) => {
  try {
    console.log('🎁 Creating item donation:', donationData);
    
    const newDonation = {
      postId: donationData.postId,
      donorId: donationData.donorId,
      donorName: donationData.donorName,
      donorEmail: donationData.donorEmail,
      items: donationData.items || [], // Array of {itemName, quantity, itemId}
      message: donationData.message || '',
      donationType: 'items', // Mark as item donation
      createdAt: serverTimestamp()
    };
    
    // Add donation record to Firestore
    const docRef = await addDoc(collection(db, 'donations'), newDonation);
    
    // Record the charity post's item donations
    await recordItemDonations(
      donationData.postId, 
      donationData.items, 
      donationData.donorId, 
      donationData.donorName
    );
    
    console.log('✅ Item donation recorded with ID:', docRef.id);
    
    return {
      success: true,
      donation: {
        id: docRef.id,
        ...newDonation,
        createdAt: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error('❌ Item donation creation error:', error);
    return {
      success: false,
      error: `Failed to record item donation: ${error.message}`
    };
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