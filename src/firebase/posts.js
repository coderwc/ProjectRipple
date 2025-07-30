// src/firebase/posts.js
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc,
  increment,
  query, 
  where, 
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, auth } from './config'; // ← Added auth import

// Create a new charity post - matches your existing API
export const createPost = async (postData) => {
  try {
    // 🔥 CHECK AUTHENTICATION FIRST
    const user = auth.currentUser;
    console.log('🔍 Current user in createPost:', user);
    console.log('🔍 User UID:', user?.uid);
    
    if (!user) {
      console.error('❌ No authenticated user found');
      return {
        success: false,
        error: 'User must be authenticated to create posts'
      };
    }

    let imageUrl = null;
    
    // Handle image upload if provided
    if (postData.image) {
      try {
        let blob = null;
        
        // Handle base64 image
        if (typeof postData.image === 'string' && postData.image.startsWith('data:image')) {
          const base64Data = postData.image.replace(/^data:image\/\w+;base64,/, '');
          const byteCharacters = atob(base64Data);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          blob = new Blob([byteArray], { type: 'image/jpeg' });
        }
        // Handle blob URL
        else if (typeof postData.image === 'string' && postData.image.startsWith('blob:')) {
          const response = await fetch(postData.image);
          blob = await response.blob();
        }
        // Handle File object
        else if (postData.image instanceof File) {
          blob = postData.image;
        }
        
        if (blob) {
          const timestamp = Date.now();
          const imageRef = ref(storage, `posts/${timestamp}_${user.uid}.jpg`);
          
          console.log('Uploading image to:', `posts/${timestamp}_${user.uid}.jpg`);
          const uploadResult = await uploadBytes(imageRef, blob);
          imageUrl = await getDownloadURL(uploadResult.ref);
          console.log('✅ Image uploaded successfully:', imageUrl);
        }
      } catch (imageError) {
        console.error('❌ Image upload failed:', imageError);
        // Continue without image rather than failing the entire post
        console.log('📝 Creating post without image due to upload error');
      }
    }
    
    // 🔥 ADD REQUIRED FIELDS FOR SECURITY RULES
    const newPost = {
      authorId: user.uid, // ← REQUIRED for security rules
      authorName: user.displayName || user.email || 'Anonymous',
      authorEmail: user.email,
      charityId: postData.charityId || user.uid,
      charityName: postData.charityName || user.displayName || 'Anonymous Charity',
      headline: postData.headline,
      category: postData.category || '',
      storyDescription: postData.storyDescription,
      deadline: postData.deadline || '',
      items: postData.items || [],
      imageUrl: imageUrl,
      status: 'active',
      donationsReceived: 0,
      donorCount: 0,
      views: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    console.log('🔍 Post data being sent to Firestore:', newPost);
    console.log('🔍 User UID (should match charityId):', user.uid);
    console.log('🔍 Post charityId:', newPost.charityId);
    
    // Store posts directly in charities collection
    const docRef = await addDoc(collection(db, 'charities'), newPost);
    
    console.log('✅ Post created with ID:', docRef.id);
    console.log('✅ Post saved to collection: charities');
    console.log('✅ Full saved post:', { id: docRef.id, ...newPost });
    
    // Return the same structure your frontend expects
    return {
      success: true,
      post: {
        id: docRef.id,
        ...newPost,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error('❌ Post creation error:', error);
    console.error('❌ Error code:', error.code);
    console.error('❌ Error message:', error.message);
    return {
      success: false,
      error: `Failed to create post: ${error.message}`
    };
  }
};

// Get all posts (with optional filtering)
export const getPosts = async (filters = {}) => {
  try {
    let q = collection(db, 'posts');
    
    // Apply filters
    const constraints = [];
    
    if (filters.charityId) {
      constraints.push(where('charityId', '==', filters.charityId));
    }
    
    if (filters.status) {
      constraints.push(where('status', '==', filters.status));
    }
    
    // Add ordering
    constraints.push(orderBy('createdAt', 'desc'));
    
    q = query(q, ...constraints);
    
    const querySnapshot = await getDocs(q);
    const posts = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      posts.push({
        id: doc.id,
        ...data,
        // Convert timestamps to ISO strings for consistency
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt
      });
    });
    
    console.log(`✅ Retrieved ${posts.length} posts`);
    return posts;
  } catch (error) {
    console.error('❌ Posts fetch error:', error);
    throw new Error('Failed to fetch posts');
  }
};

// Get posts by charity ID from charities subcollection
export const getPostsByCharity = async (charityId) => {
  try {
    console.log('🔍 Loading posts for charity:', charityId);
    console.log('🔍 Query: charities collection where charityId ==', charityId);
    
    // Load from charities collection filtered by charityId
    // Removed orderBy to avoid composite index requirement
    const postsRef = collection(db, 'charities');
    const q = query(postsRef, where('charityId', '==', charityId));
    
    console.log('🔍 Executing query...');
    
    const querySnapshot = await getDocs(q);
    const posts = [];
    
    console.log('📊 Query snapshot size:', querySnapshot.size);
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      console.log('📄 Found post:', doc.id, data);
      posts.push({
        id: doc.id,
        ...data,
        // Convert timestamps to ISO strings for consistency
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt
      });
    });
    
    // Sort posts manually by creation date (newest first)
    posts.sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return dateB - dateA;
    });
    
    console.log(`✅ Retrieved ${posts.length} posts for charity ${charityId}:`, posts);
    return posts;
  } catch (error) {
    console.error('❌ Charity posts fetch error:', error);
    throw new Error('Failed to fetch charity posts');
  }
};

// Update post statistics (when donations are made)
export const updatePostStats = async (postId, donationAmount = 0) => {
  try {
    const postRef = doc(db, 'posts', postId);
    
    const updateData = {
      donorCount: increment(1),
      updatedAt: serverTimestamp()
    };
    
    if (donationAmount > 0) {
      updateData.donationsReceived = increment(donationAmount);
    }
    
    await updateDoc(postRef, updateData);
    
    console.log('✅ Post stats updated for:', postId);
  } catch (error) {
    console.error('❌ Post stats update error:', error);
    throw new Error('Failed to update post statistics');
  }
};

// Increment post views
export const incrementPostViews = async (postId) => {
  try {
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, {
      views: increment(1),
      updatedAt: serverTimestamp()
    });
    
    console.log('✅ Post views incremented for:', postId);
  } catch (error) {
    console.error('❌ Post views update error:', error);
    // Don't throw error for view tracking - it's non-critical
  }
};

// Update post status
export const updatePostStatus = async (postId, status) => {
  try {
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, {
      status: status,
      updatedAt: serverTimestamp()
    });
    
    console.log('✅ Post status updated:', postId, status);
  } catch (error) {
    console.error('❌ Post status update error:', error);
    throw new Error('Failed to update post status');
  }
};

// Delete a charity post
export const deletePost = async (charityId, postId) => {
  try {
    console.log('🗑️ Deleting post:', postId);
    
    // Delete from charities collection
    const postRef = doc(db, 'charities', postId);
    await deleteDoc(postRef);
    
    console.log('✅ Post deleted successfully:', postId);
    return { success: true };
  } catch (error) {
    console.error('❌ Post deletion error:', error);
    throw new Error(`Failed to delete post: ${error.message}`);
  }
};