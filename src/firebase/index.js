// src/firebase/index.js
// Centralized Firebase exports for clean imports

// Config and app
export { auth, db, storage } from './config';

// Authentication functions
export {
  signUpUser,
  signInUser,
  signInWithGoogle
} from './auth';

// Posts functions
export {
  createPost,
  getPosts,
  getPostsByCharity,
  updatePostStats,
  incrementPostViews,
  updatePostStatus
} from './posts';

// Donations functions
export {
  createDonation,
  getDonationsByPost,
  getDonationsByDonor
} from './donations';