// src/api/posts.js - Updated to use Firebase
import { createPost as createPostFirebase, getPosts, getPostsByCharity, getPostByCharityAndItem } from '../firebase/posts';
import { createDonation, createItemDonation, getDonationsByPost } from '../firebase/donations';

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

// Get specific post by charity and item ID - uses Firebase
export const getPostByCharityAndItemAPI = async (charityId, itemId) => {
  try {
    const post = await getPostByCharityAndItem(charityId, itemId);
    return { success: true, post };
  } catch (error) {
    console.error('Error fetching post by charity and item:', error);
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

// Create item donation - uses Firebase
export const createItemDonationAPI = async (donationData) => {
  try {
    const result = await createItemDonation(donationData);
    return result;
  } catch (error) {
    console.error('Error creating item donation:', error);
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

// Get public charity profile by ID
export const getCharityProfile = async (charityId) => {
  try {
    console.log('🔍 Fetching charity profile from API for ID:', charityId);
    const response = await fetch(`${API_BASE_URL}/charity/public/${charityId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    console.log('📡 API Response status:', response.status);
    
    if (!response.ok) {
      throw new Error('Failed to fetch charity profile');
    }
    
    const result = await response.json();
    console.log('✅ API Response data:', result);
    return { success: true, charity: result };
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