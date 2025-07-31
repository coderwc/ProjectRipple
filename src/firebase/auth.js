import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile,
  signOut
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
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
      tagline: userData.tagline || '',
      aboutUs: userData.aboutUs || '',
      focusAreas: userData.focusAreas || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
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

// ✏️ Sign in with role validation
export const signInUser = async (email, password, expectedRole = null) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    try {
      // ✅ Check vendors first
      const vendorDoc = await getDoc(doc(db, 'vendors', user.uid));
      if (vendorDoc.exists()) {
        const userData = vendorDoc.data();

        // Role validation for vendors
        console.log('Checking vendor role validation. expectedRole:', expectedRole);
        if (expectedRole && expectedRole !== 'vendor') {
          // Sign out the user since role doesn't match
          console.log('Role mismatch detected, signing out user. Expected:', expectedRole, 'Actual: vendor');
          await signOut(auth);
          console.log('User signed out due to role mismatch');
          throw new Error(`Access denied: This account is registered as a vendor, but you're trying to access the ${expectedRole} interface.`);
        }

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

        // Role validation for charity/donor
        console.log('Checking user role validation. expectedRole:', expectedRole, 'actualType:', userData.type);
        if (expectedRole && expectedRole !== userData.type) {
          // Sign out the user since role doesn't match
          console.log('Role mismatch detected, signing out user. Expected:', expectedRole, 'Actual:', userData.type);
          await signOut(auth);
          console.log('User signed out due to role mismatch');
          throw new Error(`Access denied: This account is registered as a ${userData.type}, but you're trying to access the ${expectedRole} interface.`);
        }

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

      // ⚠️ User not found in database
      await signOut(auth);
      throw new Error('Account not found. Please sign up first.');
    } catch (roleError) {
      // If role validation fails, make sure user is signed out
      if (auth.currentUser) {
        await signOut(auth);
      }
      throw roleError;
    }
  } catch (error) {
    console.error('Sign in error:', error);
    throw error;
  }
};

// ✏️ Google sign-in with role validation
export const signInWithGoogle = async (expectedRole) => {
  try {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    const user = userCredential.user;

    try {
      // ✅ Check if vendor
      const vendorDoc = await getDoc(doc(db, 'vendors', user.uid));
      if (vendorDoc.exists()) {
        const userData = vendorDoc.data();
        
        // Role validation for existing vendors
        if (expectedRole && expectedRole !== 'vendor') {
          // Sign out the user since role doesn't match
          await signOut(auth);
          throw new Error(`Access denied: This account is registered as a vendor, but you're trying to access the ${expectedRole} interface.`);
        }
        
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

      // ✅ Check if user exists in users collection
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();

        // Role validation for existing users
        if (expectedRole && expectedRole !== userData.type) {
          // Sign out the user since role doesn't match
          await signOut(auth);
          throw new Error(`Access denied: This account is registered as a ${userData.type}, but you're trying to access the ${expectedRole} interface.`);
        }

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

      // ✏️ If user not in DB, create new with expected role
      if (!expectedRole) {
        await signOut(auth);
        throw new Error('Please select a role before signing in with Google.');
      }

      const userDocData = {
        uid: user.uid,
        email: user.email,
        name: user.displayName,
        type: expectedRole,
        phone: '',
        location: '',
        socials: '',
        queries: '',
        createdAt: new Date().toISOString(),
        isVerified: expectedRole === 'donor'
      };

      const collection = expectedRole === 'vendor' ? 'vendors' : 'users';
      await setDoc(doc(db, collection, user.uid), userDocData);

      if (expectedRole === 'vendor') {
        await initVendorProfile(user.displayName, user.email);
      }

      return { ...userDocData, id: user.uid };
    } catch (roleError) {
      // If role validation fails, make sure user is signed out
      if (auth.currentUser) {
        await signOut(auth);
      }
      throw roleError;
    }
  } catch (error) {
    console.error('Google sign in error:', error);
    throw error;
  }
};

export const updateUserProfile = async (userId, newData) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("No authenticated user");

    // Update Firebase Auth profile if name changed
    if (newData.name && newData.name !== user.displayName) {
      await updateProfile(user, {
        displayName: newData.name
      });
    }

    // Update Firestore document with all profile data
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      ...newData,
      updatedAt: new Date().toISOString()
    }, { merge: true });

    // Return updated user data
    const updatedDoc = await getDoc(userRef);
    return {
      id: updatedDoc.id,
      ...updatedDoc.data()
    };
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};