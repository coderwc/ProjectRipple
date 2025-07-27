// src/firebase/auth.js
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from './config';

// Create user account and store additional data
export const signUpUser = async (userData, userType) => {
  try {
    // Create user with email and password
    const userCredential = await createUserWithEmailAndPassword(
      auth, 
      userData.email, 
      userData.password
    );
    
    const user = userCredential.user;
    
    // Update display name
    await updateProfile(user, {
      displayName: userData.fullName
    });
    
    // Store user data in appropriate collection based on type
    if (userType === 'charity') {
      // Store charity data with all form fields
      const charityDocData = {
        uid: user.uid,
        email: user.email,
        name: userData.fullName,
        type: 'charity',
        phone: userData.phone || '',
        location: userData.location || '',
        socials: userData.socials || '',
        queries: userData.queries || '',
        tagline: '',
        aboutUs: '',
        focusAreas: [],
        createdAt: new Date().toISOString(),
        isVerified: false, // Charities need verification
      };
      
      await setDoc(doc(db, 'users', user.uid), charityDocData);
    } else {
      // Store other user types (donors, vendors) in users collection
      const userDocData = {
        uid: user.uid,
        email: user.email,
        name: userData.fullName,
        type: userType,
        phone: userData.phone || '',
        location: userData.location || '',
        socials: userData.socials || '',
        queries: userData.queries || '',
        createdAt: new Date().toISOString(),
        isVerified: userType === 'donor',
      };
      
      await setDoc(doc(db, 'users', user.uid), userDocData);
    }
    
    return {
      id: user.uid,
      email: user.email,
      name: userData.fullName,
      type: userType,
      phone: userData.phone || '',
      location: userData.location || '',
      socials: userData.socials || '',
      queries: userData.queries || '',
      tagline: userType === 'charity' ? '' : undefined,
      aboutUs: userType === 'charity' ? '' : undefined,
      focusAreas: userType === 'charity' ? [] : undefined,
      isVerified: userType === 'donor'
    };
  } catch (error) {
    console.error('Sign up error:', error);
    throw error;
  }
};

// Sign in user and get their data
export const signInUser = async (email, password) => {
  try {
    console.log('Attempting to sign in with:', email, 'password length:', password?.length);
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log('Sign in successful for user:', user.uid);
    
    // Get additional user data from Firestore
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      return {
        id: user.uid,
        email: user.email,
        name: userData.name || user.displayName,
        type: userData.type,
        phone: userData.phone || '',
        location: userData.location || '',
        socials: userData.socials || '',
        queries: userData.queries || '',
        tagline: userData.tagline || '',
        aboutUs: userData.aboutUs || '',
        focusAreas: userData.focusAreas || [],
        isVerified: userData.isVerified || false
      };
    } else {
      // If no Firestore document exists, create basic user data
      return {
        id: user.uid,
        email: user.email,
        name: user.displayName || 'User',
        type: 'donor', // Default type
        phone: '',
        location: '',
        socials: '',
        queries: '',
        isVerified: false
      };
    }
  } catch (error) {
    console.error('Sign in error:', error);
    throw error;
  }
};

// Google sign in
export const signInWithGoogle = async (userType) => {
  try {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    const user = userCredential.user;
    
    // Check if user document exists
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    
    if (!userDoc.exists()) {
      // Create new user document for Google sign-in
      const userDocData = {
        uid: user.uid,
        email: user.email,
        name: user.displayName,
        type: userType,
        phone: '',
        location: '',
        socials: '',
        queries: '',
        createdAt: new Date().toISOString(),
        isVerified: userType === 'donor',
      };
      
      await setDoc(doc(db, 'users', user.uid), userDocData);
      
      return {
        id: user.uid,
        email: user.email,
        name: user.displayName,
        type: userType,
        phone: '',
        location: '',
        socials: '',
        queries: '',
        isVerified: userType === 'donor'
      };
    } else {
      const userData = userDoc.data();
      return {
        id: user.uid,
        email: user.email,
        name: userData.name || user.displayName,
        type: userData.type,
        phone: userData.phone || '',
        location: userData.location || '',
        socials: userData.socials || '',
        queries: userData.queries || '',
        isVerified: userData.isVerified || false
      };
    }
  } catch (error) {
    console.error('Google sign in error:', error);
    throw error;
  }
};

// Update user profile
export const updateUserProfile = async (userId, profileData) => {
  try {
    const userRef = doc(db, 'users', userId);
    
    // Update Firebase Auth display name if name is being changed
    if (profileData.name && auth.currentUser) {
      await updateProfile(auth.currentUser, {
        displayName: profileData.name
      });
    }
    
    // Update Firestore document
    const updateData = {
      ...profileData,
      updatedAt: new Date().toISOString()
    };
    
    await updateDoc(userRef, updateData);
    
    // Get updated user data
    const updatedUserDoc = await getDoc(userRef);
    if (updatedUserDoc.exists()) {
      const userData = updatedUserDoc.data();
      return {
        id: userId,
        email: userData.email,
        name: userData.name,
        type: userData.type,
        phone: userData.phone || '',
        location: userData.location || '',
        socials: userData.socials || '',
        queries: userData.queries || '',
        tagline: userData.tagline || '',
        aboutUs: userData.aboutUs || '',
        focusAreas: userData.focusAreas || [],
        isVerified: userData.isVerified || false
      };
    }
    
    throw new Error('Failed to retrieve updated user data');
  } catch (error) {
    console.error('Profile update error:', error);
    throw error;
  }
};