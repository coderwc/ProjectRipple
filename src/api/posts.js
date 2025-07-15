// src/api/posts.js
const API_BASE_URL = 'http://localhost:5001/api';

// Create a new post
export const createPost = async (postData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/posts/base64`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postData)
    });
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error creating post:', error);
    throw error;
  }
};

// Get AI recommendations
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

// Register user
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

// Login user
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