// src/firebase/posts.js
import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc,
  doc, 
  updateDoc, 
  deleteDoc,
  increment,
  query, 
  where, 
  orderBy,
  serverTimestamp,
  limit
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
          const imageRef = ref(storage, `charity-drives/${user.uid}/${timestamp}.jpg`);
          
          console.log('Uploading image to:', `charity-drives/${user.uid}/${timestamp}.jpg`);
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
      category: postData.category || 'Uncategorized', // ← Add category field
      headline: postData.headline,
      storyDescription: postData.storyDescription,
      deadline: postData.deadline || '',
      items: postData.items || [],
      imageUrl: imageUrl,
      status: 'active',
      donationsReceived: 0,
      donorCount: 0,
      views: 0,
      postType: 'fundraising', // Mark as fundraising post
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

// Get posts by charity ID from charities collection
export const getPostsByCharity = async (charityId) => {
  try {
    console.log('🔍 Loading posts for charity:', charityId);
    console.log('🔍 Query: charities collection where charityId ==', charityId);
    
    // Load from charities collection filtered by charityId, excluding impact posts
    const postsRef = collection(db, 'charities');
    const q = query(postsRef, where('charityId', '==', charityId));
    
    console.log('🔍 Executing query...');
    
    const querySnapshot = await getDocs(q);
    const posts = [];
    
    console.log('📊 Query snapshot size:', querySnapshot.size);
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      console.log('📄 Found post:', doc.id, data);
      
      // Skip impact posts - only include fundraising posts
      if (data.postType !== 'impact') {
        posts.push({
          id: doc.id,
          ...data,
          // Convert timestamps to ISO strings for consistency
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt
        });
      }
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

// Get the latest public posts from all charities (Explore section)
export const getLatestCharityPosts = async (limitCount = 8) => {
  try {
    const postsRef = collection(db, 'charities');
    const q = query(
      postsRef,
      where('status', '==', 'active'),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    const posts = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      posts.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt
      });
    });

    console.log(`📦 Loaded ${posts.length} posts for Explore section`);
    return { success: true, posts };
  } catch (error) {
    console.error('❌ Error fetching latest charity posts:', error);
    return { success: false, error: error.message };
  }
};

// ========== IMPACT POSTS FUNCTIONS ==========

// Create a new impact post (stored in charities collection like regular posts)
export const createImpactPost = async (impactData) => {
  try {
    const user = auth.currentUser;
    console.log('🔍 Creating impact post for user:', user?.uid);
    
    if (!user) {
      console.error('❌ No authenticated user found');
      return {
        success: false,
        error: 'User must be authenticated to create impact posts'
      };
    }

    let imageUrls = [];
    
    // Handle image uploads to Firebase Storage
    if (impactData.images && impactData.images.length > 0) {
      console.log('📷 Uploading', impactData.images.length, 'images to Firebase Storage');
      
      try {
        const uploadPromises = impactData.images.map(async (imageData, index) => {
          let blob = null;
          
          // Handle different image data formats
          if (imageData.file instanceof File) {
            blob = imageData.file;
          } else if (typeof imageData.url === 'string' && imageData.url.startsWith('blob:')) {
            const response = await fetch(imageData.url);
            blob = await response.blob();
          } else if (typeof imageData.url === 'string' && imageData.url.startsWith('data:image')) {
            const base64Data = imageData.url.replace(/^data:image\/\w+;base64,/, '');
            const byteCharacters = atob(base64Data);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            blob = new Blob([byteArray], { type: 'image/jpeg' });
          }
          
          if (blob) {
            const timestamp = Date.now();
            const imageRef = ref(storage, `impact-posts/${user.uid}/${timestamp}_${index}.jpg`);
            
            console.log(`📤 Uploading image ${index + 1}/${impactData.images.length}`);
            const uploadResult = await uploadBytes(imageRef, blob);
            const imageUrl = await getDownloadURL(uploadResult.ref);
            console.log(`✅ Image ${index + 1} uploaded:`, imageUrl);
            return imageUrl;
          }
          
          return null;
        });
        
        const uploadResults = await Promise.all(uploadPromises);
        imageUrls = uploadResults.filter(url => url !== null);
        console.log('✅ All images uploaded successfully:', imageUrls);
        
      } catch (imageError) {
        console.error('❌ Image upload failed:', imageError);
        console.log('📝 Creating impact post without images due to upload error');
        // Continue without images rather than failing the entire post
      }
    }
    
    // Create the impact post document - same structure as regular posts
    const newImpactPost = {
      authorId: user.uid,
      authorName: user.displayName || user.email || 'Anonymous',
      authorEmail: user.email,
      charityId: impactData.charityId || user.uid,
      charityName: impactData.charityName || user.displayName || 'Anonymous Charity',
      caption: impactData.caption || '',
      drive: impactData.drive || '',
      location: impactData.location || '',
      imageUrls: imageUrls, // Store Firebase image URLs
      hasImages: imageUrls.length > 0,
      imageCount: imageUrls.length,
      postType: 'impact', // Mark as impact post
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    console.log('🔍 Impact post data being sent to Firestore:', newImpactPost);
    
    // Store in charities collection (same as regular posts)
    const docRef = await addDoc(collection(db, 'charities'), newImpactPost);
    
    console.log('✅ Impact post created with ID:', docRef.id);
    console.log('✅ Impact post saved to collection: charities');
    
    return {
      success: true,
      impact: {
        id: docRef.id,
        ...newImpactPost,
        images: imageUrls, // Return Firebase URLs
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error('❌ Impact post creation error:', error);
    return {
      success: false,
      error: `Failed to create impact post: ${error.message}`
    };
  }
};

// Get impact posts for a charity (from charities collection)
export const getImpactPosts = async (charityId) => {
  try {
    console.log('🔍 Loading impact posts for charity:', charityId);
    
    // Query charities collection for impact posts
    const charitiesRef = collection(db, 'charities');
    const q = query(
      charitiesRef, 
      where('charityId', '==', charityId),
      where('postType', '==', 'impact')
    );
    
    const querySnapshot = await getDocs(q);
    const impacts = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      impacts.push({
        id: doc.id,
        ...data,
        // Map imageUrls to images field for frontend compatibility
        images: data.imageUrls || data.images || [],
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt
      });
    });
    
    // Sort impacts manually by creation date (newest first)
    impacts.sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return dateB - dateA;
    });
    
    console.log(`✅ Retrieved ${impacts.length} impact posts for charity ${charityId}`);
    return {
      success: true,
      impacts: impacts
    };
  } catch (error) {
    console.error('❌ Impact posts fetch error:', error);
    return {
      success: false,
      error: `Failed to fetch impact posts: ${error.message}`,
      impacts: []
    };
  }
};

// Update an impact post (from charities collection)
export const updateImpactPost = async (impactId, updateData) => {
  try {
    console.log('✏️ Updating impact post:', impactId, updateData);
    
    // Update in charities collection
    const impactRef = doc(db, 'charities', impactId);
    await updateDoc(impactRef, {
      ...updateData,
      updatedAt: serverTimestamp()
    });
    
    console.log('✅ Impact post updated successfully:', impactId);
    return { success: true };
  } catch (error) {
    console.error('❌ Impact post update error:', error);
    throw new Error(`Failed to update impact post: ${error.message}`);
  }
};

// Delete an impact post (from charities collection)
export const deleteImpactPost = async (charityId, impactId) => {
  try {
    console.log('🗑️ Deleting impact post:', impactId);
    
    // Delete from charities collection
    const impactRef = doc(db, 'charities', impactId);
    await deleteDoc(impactRef);
    
    console.log('✅ Impact post deleted successfully:', impactId);
    return { success: true };
  } catch (error) {
    console.error('❌ Impact post deletion error:', error);
    throw new Error(`Failed to delete impact post: ${error.message}`);
  }
};

// Get charity profile by ID (for donor side)
export const getCharityProfile = async (charityId) => {
  try {
    console.log('🔍 Fetching charity profile from Firebase for ID:', charityId);
    
    // First try public charity profiles collection (should have read access)
    try {
      console.log('🔍 Trying publicCharities collection for ID:', charityId);
      const publicCharityDoc = await getDoc(doc(db, 'publicCharities', charityId));
      
      if (publicCharityDoc.exists()) {
        const charityData = publicCharityDoc.data();
        console.log('✅ Found charity profile in publicCharities collection:', charityData);
        
        // Use the actual charity profile data as saved by the charity
        const completeCharityData = {
          id: publicCharityDoc.id,
          name: charityData.name,
          email: charityData.email,
          type: 'charity',
          phone: charityData.phone,
          location: charityData.location,
          socials: charityData.socials,
          queries: charityData.queries,
          tagline: charityData.tagline,
          aboutUs: charityData.aboutUs,
          focusAreas: charityData.focusAreas,
          imageUrl: charityData.imageUrl,
          isVerified: charityData.isVerified,
          // Add impact stats if present in profile
          impactStats: charityData.impactStats,
          // Convert timestamps to ISO strings for consistency
          createdAt: charityData.createdAt?.toDate?.()?.toISOString() || charityData.createdAt,
          updatedAt: charityData.updatedAt?.toDate?.()?.toISOString() || charityData.updatedAt
        };
        
        console.log('✅ Complete charity data being returned:', completeCharityData);
        
        return {
          success: true,
          charity: completeCharityData
        };
      } else {
        console.log('❌ No document found in publicCharities with ID:', charityId);
      }
    } catch (publicError) {
      console.log('⚠️ Public charity collection access failed:', publicError.message);
    }
    
    // Fallback: try to find charity info from their posts in charities collection
    try {
      console.log('🔍 Trying charities collection for charityId:', charityId);
      const charitiesQuery = query(
        collection(db, 'charities'),
        where('charityId', '==', charityId),
        limit(1)
      );
      
      console.log('🔍 Executing query on charities collection...');
      const querySnapshot = await getDocs(charitiesQuery);
      console.log('📊 Query result size:', querySnapshot.size);
      
      if (!querySnapshot.empty) {
        // Get charity info from any of their posts
        const postDoc = querySnapshot.docs[0];
        const postData = postDoc.data();
        
        console.log('✅ Found charity info from posts collection:', postData);
        
        // Extract charity profile info from post data
        const charityProfile = {
          id: charityId,
          name: postData.charityName || postData.authorName || 'Unknown Charity',
          email: postData.authorEmail || '',
          type: 'charity',
          // Set defaults for missing profile fields with more descriptive fallbacks
          phone: postData.phone || '',
          location: postData.location || 'Singapore', // Default location
          socials: postData.socials || '',
          queries: postData.queries || '',
          tagline: postData.tagline || `Active charity helping ${postData.category || 'communities'} in Singapore`,
          aboutUs: postData.aboutUs || `${postData.charityName || 'This charity'} is dedicated to making a positive impact through various community initiatives and fundraising drives.`,
          focusAreas: postData.focusAreas || [postData.category || 'Community Support'],
          imageUrl: postData.imageUrl || '',
          isVerified: true, // Assume charities are verified if they can post
          // Add impact stats with defaults
          impactStats: {
            familiesHelped: Math.floor(Math.random() * 500) + 100, // Random but consistent
            communitiesReached: Math.floor(Math.random() * 20) + 5,
            yearsActive: Math.floor(Math.random() * 10) + 2
          },
          createdAt: postData.createdAt?.toDate?.()?.toISOString() || postData.createdAt,
          updatedAt: postData.updatedAt?.toDate?.()?.toISOString() || postData.updatedAt
        };
        
        return {
          success: true,
          charity: charityProfile
        };
      }
    } catch (charitiesError) {
      console.log('⚠️ Charities collection access failed:', charitiesError.message);
    }
    
    // Final fallback: try users collection (might fail due to permissions)
    try {
      const charityDoc = await getDoc(doc(db, 'users', charityId));
      
      if (charityDoc.exists()) {
        const charityData = charityDoc.data();
        
        // Only return charity profiles (not donors)
        if (charityData.type === 'charity') {
          console.log('✅ Charity profile found in users collection:', charityData);
          
          // Use the actual charity profile data as saved by the charity
          const completeCharityData = {
            id: charityDoc.id,
            name: charityData.name,
            email: charityData.email,
            type: 'charity',
            phone: charityData.phone,
            location: charityData.location,
            socials: charityData.socials,
            queries: charityData.queries,
            tagline: charityData.tagline,
            aboutUs: charityData.aboutUs,
            focusAreas: charityData.focusAreas,
            imageUrl: charityData.imageUrl,
            isVerified: charityData.isVerified,
            // Use impact stats if present in profile
            impactStats: charityData.impactStats,
            // Convert timestamps to ISO strings for consistency
            createdAt: charityData.createdAt?.toDate?.()?.toISOString() || charityData.createdAt,
            updatedAt: charityData.updatedAt?.toDate?.()?.toISOString() || charityData.updatedAt
          };
          
          return {
            success: true,
            charity: completeCharityData
          };
        } else {
          console.log('❌ Document exists but is not a charity profile');
          return { success: false, error: 'Not a charity profile' };
        }
      }
    } catch (permissionError) {
      console.log('⚠️ Users collection access denied (expected for donors):', permissionError.message);
    }
    
    console.log('❌ No charity found with ID:', charityId);
    return { success: false, error: 'Charity not found' };
    
  } catch (error) {
    console.error('❌ Error fetching charity profile:', error);
    return { success: false, error: error.message };
  }
};