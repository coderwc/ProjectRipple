import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from './config';

// 🔥 Sync with vendor backend
const initVendorProfile = async (name, email) => {
  const token = await auth.currentUser.getIdToken();

  await fetch("http://localhost:5001/api/vendor/init", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ name, email })
  });
};

// ✏️ Sign up
export const signUpUser = async (userData, userType) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      userData.email,
      userData.password
    );

    const user = userCredential.user;

    await updateProfile(user, {
      displayName: userData.fullName
    });

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
      isVerified: userType === 'donor'
    };

    const collection = userType === 'vendor' ? 'vendors' : 'users';
    await setDoc(doc(db, collection, user.uid), userDocData);

    if (userType === 'vendor') {
      await initVendorProfile(userData.fullName, user.email);
    }

    return { ...userDocData, id: user.uid };
  } catch (error) {
    console.error('Sign up error:', error);
    throw error;
  }
};

// ✏️ Sign in (auto-detect type from Firestore)
export const signInUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // ✅ Check vendors first
    const vendorDoc = await getDoc(doc(db, 'vendors', user.uid));
    if (vendorDoc.exists()) {
      const userData = vendorDoc.data();

      await initVendorProfile(userData.name || user.displayName, user.email);

      return {
        id: user.uid,
        email: user.email,
        name: userData.name || user.displayName,
        type: 'vendor',
        phone: userData.phone || '',
        location: userData.location || '',
        socials: userData.socials || '',
        queries: userData.queries || '',
        isVerified: userData.isVerified || false
      };
    }

    // ✅ Else check users (donor / charity)
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
        isVerified: userData.isVerified || false
      };
    }

    // ⚠️ Fallback (new user not in either collection)
    return {
      id: user.uid,
      email: user.email,
      name: user.displayName || 'User',
      type: 'donor',
      phone: '',
      location: '',
      socials: '',
      queries: '',
      isVerified: false
    };
  } catch (error) {
    console.error('Sign in error:', error);
    throw error;
  }
};

// ✏️ Google sign-in (auto-detect collection or create new)
export const signInWithGoogle = async (userType) => {
  try {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    const user = userCredential.user;

    // ✅ Check if vendor
    const vendorDoc = await getDoc(doc(db, 'vendors', user.uid));
    if (vendorDoc.exists()) {
      const userData = vendorDoc.data();
      await initVendorProfile(userData.name || user.displayName, user.email);

      return {
        id: user.uid,
        email: user.email,
        name: userData.name || user.displayName,
        type: 'vendor',
        phone: userData.phone || '',
        location: userData.location || '',
        socials: userData.socials || '',
        queries: userData.queries || '',
        isVerified: userData.isVerified || false
      };
    }

    // ✅ Check if user
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
        isVerified: userData.isVerified || false
      };
    }

    // ✏️ If user not in DB, create new
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
      isVerified: userType === 'donor'
    };

    const collection = userType === 'vendor' ? 'vendors' : 'users';
    await setDoc(doc(db, collection, user.uid), userDocData);

    if (userType === 'vendor') {
      await initVendorProfile(user.displayName, user.email);
    }

    return { ...userDocData, id: user.uid };
  } catch (error) {
    console.error('Google sign in error:', error);
    throw error;
  }
};

export const updateUserProfile = async (newData) => {
  const user = auth.currentUser;
  if (!user) throw new Error("No authenticated user");

  await updateProfile(user, newData);
};