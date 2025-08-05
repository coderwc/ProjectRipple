// Load environment variables
require('dotenv').config();

const admin = require("firebase-admin");

// ✅ Initialize Firebase Admin only once
if (!admin.apps.length) {
  // Check if required environment variables are present
  const requiredEnvVars = [
    'FIREBASE_PROJECT_ID',
    'FIREBASE_PRIVATE_KEY_ID', 
    'FIREBASE_PRIVATE_KEY',
    'FIREBASE_CLIENT_EMAIL',
    'FIREBASE_CLIENT_ID',
    'FIREBASE_CLIENT_X509_CERT_URL'
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:', missingVars);
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }

  // Use environment variables for security
  const serviceAccount = {
    type: "service_account",
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
    universe_domain: "googleapis.com"
  };

  console.log('🔧 Initializing Firebase Admin with environment variables...');
  console.log('📧 Client email:', process.env.FIREBASE_CLIENT_EMAIL);
  console.log('🆔 Project ID:', process.env.FIREBASE_PROJECT_ID);
  console.log('🔑 Private key starts with:', process.env.FIREBASE_PRIVATE_KEY?.substring(0, 50) + '...');
  console.log('🏷️  Private key ID:', process.env.FIREBASE_PRIVATE_KEY_ID);
  console.log('🌐 Client X509 cert URL:', process.env.FIREBASE_CLIENT_X509_CERT_URL);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  
  console.log('✅ Firebase Admin initialized successfully');
  
  // Validate private key format
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  console.log('🔍 Private key ends with:', privateKey?.substring(privateKey.length - 50));
  console.log('🔍 Private key total length:', privateKey?.length);
  
  // Test Firestore connection
  const db = admin.firestore();
  db.collection('test').limit(1).get()
    .then(() => {
      console.log('✅ Firestore connection test successful');
    })
    .catch((error) => {
      console.error('❌ Firestore connection test failed:', error.message);
      console.error('🔍 Error code:', error.code);
      console.error('🔍 Check if your private key is complete and properly formatted');
    });
}

const db = admin.firestore();

/**
 * Middleware: Verify Firebase ID token
 * Attaches decoded user info to req.user
 */
const verifyFirebaseToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or malformed token" });
  }

  const token = authHeader.split("Bearer ")[1];

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = decoded;

    console.log("✅ Firebase token verified:", decoded.email || decoded.uid);
    next();
  } catch (err) {
    console.error("❌ Firebase token verification error:", err.message);
    return res.status(403).json({ error: "Invalid token" });
  }
};

/**
 * Middleware: Verify user role matches required role
 * Must be used after verifyFirebaseToken
 */
const verifyRole = (requiredRole) => {
  return async (req, res, next) => {
    try {
      console.log(`🔍 Verifying ${requiredRole} role for user:`, req.user.uid);
      const uid = req.user.uid;
      
      // Check if user exists in the appropriate collection
      let userDoc;
      if (requiredRole === 'vendor') {
        console.log('🔍 Checking vendors collection...');
        userDoc = await db.collection('vendors').doc(uid).get();
        console.log('🔍 Vendor document exists:', userDoc.exists);
      } else {
        console.log('🔍 Checking users collection...');
        userDoc = await db.collection('users').doc(uid).get();
        console.log('🔍 User document exists:', userDoc.exists);
      }

      if (!userDoc.exists) {
        console.log(`❌ ${requiredRole} document not found for UID:`, uid);
        return res.status(403).json({ error: "User not found" });
      }

      const userData = userDoc.data();
      console.log('✅ User data found:', { 
        type: userData.type, 
        name: userData.name || userData.fullName,
        email: userData.email 
      });
      
      // For vendors, existence in vendors collection is already confirmed above
      
      // For charity/donor, check the type field
      if (requiredRole !== 'vendor' && userData.type !== requiredRole) {
        console.log(`❌ Role mismatch: required ${requiredRole}, user has ${userData.type}`);
        return res.status(403).json({ 
          error: `Access denied: ${requiredRole} role required, but user has ${userData.type} role` 
        });
      }

      console.log(`✅ Role verification successful for ${requiredRole}`);
      // Attach user data to request
      req.userData = userData;
      next();
    } catch (error) {
      console.error("❌ Role verification error:", error);
      console.error("❌ Role verification error details:", error.message);
      console.error("❌ Role verification error code:", error.code);
      return res.status(500).json({ error: "Role verification failed", details: error.message });
    }
  };
};

module.exports = { verifyFirebaseToken, verifyRole, db };