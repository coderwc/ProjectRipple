const admin = require("firebase-admin");

// ✅ Initialize Firebase Admin only once
if (!admin.apps.length) {
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

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
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
      const uid = req.user.uid;
      
      // Check if user exists in the appropriate collection
      let userDoc;
      if (requiredRole === 'vendor') {
        userDoc = await db.collection('vendors').doc(uid).get();
      } else {
        userDoc = await db.collection('users').doc(uid).get();
      }

      if (!userDoc.exists) {
        return res.status(403).json({ error: "User not found" });
      }

      const userData = userDoc.data();
      
      // For vendors, existence in vendors collection is already confirmed above
      
      // For charity/donor, check the type field
      if (requiredRole !== 'vendor' && userData.type !== requiredRole) {
        return res.status(403).json({ 
          error: `Access denied: ${requiredRole} role required, but user has ${userData.type} role` 
        });
      }

      // Attach user data to request
      req.userData = userData;
      next();
    } catch (error) {
      console.error("❌ Role verification error:", error);
      return res.status(500).json({ error: "Role verification failed" });
    }
  };
};

module.exports = { verifyFirebaseToken, verifyRole, db };