const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

// ✅ Initialize Firebase Admin only once
if (!admin.apps.length) {
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

    console.log("✅ Firebase token verified:", decoded.email || decoded.uid); // less verbose
    next();
  } catch (err) {
    console.error("❌ Firebase token verification error:", err.message);
    return res.status(403).json({ error: "Invalid token" });
  }
};

module.exports = { verifyFirebaseToken, db };