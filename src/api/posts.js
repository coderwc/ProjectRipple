// src/api/posts.js - Updated to use Firebase
import { createPost as createPostFirebase, getPosts, getPostsByCharity, getCharityProfile as getCharityProfileFirebase } from '../firebase/posts';
import { createDonation, getDonationsByPost } from '../firebase/donations';

const API_BASE_URL = 'http://localhost:5001/api';

// Create a new post - now uses Firebase
export const createPost = async (postData) => {
  try {
    // Use Firebase function instead of API call
    const result = await createPostFirebase(postData);
    return result;
  } catch (error) {
    console.error('Error creating post:', error);
    throw error;
  }
};

// Get posts - uses Firebase
export const getPostsAPI = async (filters = {}) => {
  try {
    const posts = await getPosts(filters);
    return { success: true, posts };
  } catch (error) {
    console.error('Error fetching posts:', error);
    return { success: false, error: error.message };
  }
};

// Get posts by charity - uses Firebase
export const getCharityPosts = async (charityId) => {
  try {
    const posts = await getPostsByCharity(charityId);
    return { success: true, posts };
  } catch (error) {
    console.error('Error fetching charity posts:', error);
    return { success: false, error: error.message };
  }
};

// Create donation - uses Firebase
export const createDonationAPI = async (donationData) => {
  try {
    const donation = await createDonation(donationData);
    return { success: true, donation };
  } catch (error) {
    console.error('Error creating donation:', error);
    return { success: false, error: error.message };
  }
};

// Get donations for a post - uses Firebase
export const getPostDonations = async (postId) => {
  try {
    const donations = await getDonationsByPost(postId);
    return { success: true, donations };
  } catch (error) {
    console.error('Error fetching donations:', error);
    return { success: false, error: error.message };
  }
};

// Get AI recommendations - still uses your backend server
export const getAIRecommendations = async (description, headline, location) => {
  try {
    const response = await fetch(`${API_BASE_URL}/ai-recommendation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ description, headline, location })
    });
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error getting AI recommendations:', error);
    throw error;
  }
};

// Get public charity profile by ID - uses Firebase
export const getCharityProfile = async (charityId) => {
  try {
    console.log('🔍 Fetching charity profile from Firebase for ID:', charityId);
    const result = await getCharityProfileFirebase(charityId);
    
    console.log('✅ Firebase Response data:', result);
    return result;
  } catch (error) {
    console.error('❌ Error fetching charity profile:', error);
    return { success: false, error: error.message };
  }
};

// Get post details by ID
export const getPostDetails = async (postId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/donor/posts/${postId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch post details');
    }
    
    const result = await response.json();
    return { success: true, post: result };
  } catch (error) {
    console.error('Error fetching post details:', error);
    return { success: false, error: error.message };
  }
};

// User registration - now handled by Firebase Auth (you can remove these if using Firebase auth completely)
export const registerUser = async (userData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData)
    });
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

// User login - now handled by Firebase Auth (you can remove these if using Firebase auth completely)
export const loginUser = async (email) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    
      body: JSON.stringify({ email })
    });
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error logging in user:', error);
    throw error;
  }
};