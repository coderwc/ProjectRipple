const express = require("express");
const router = express.Router();
const { db, verifyFirebaseToken, verifyRole } = require("../firebaseAdmin");

// Apply Firebase token verification and charity role verification to all routes
router.use(verifyFirebaseToken);
router.use(verifyRole('charity'));

// Get charity profile
router.get("/profile", async (req, res) => {
  try {
    const charityRef = db.collection("users").doc(req.user.uid);
    const doc = await charityRef.get();

    if (!doc.exists()) {
      return res.status(404).json({ error: "Charity profile not found" });
    }
    
    const charityData = doc.data();
    if (charityData.type !== 'charity') {
      return res.status(403).json({ error: "Access denied: Not a charity account" });
    }

    res.json(charityData);
  } catch (error) {
    console.error("❌ Error fetching charity profile:", error);
    res.status(500).json({ error: "Failed to fetch charity profile" });
  }
});

// Update charity profile
router.put("/profile", async (req, res) => {
  try {
    const charityRef = db.collection("users").doc(req.user.uid);
    
    // Ensure we don't allow changing the user type
    const updateData = { ...req.body };
    delete updateData.type; // Remove type from update data
    delete updateData.uid;  // Remove uid from update data
    
    await charityRef.update(updateData);
    res.json({ message: "Charity profile updated successfully" });
  } catch (error) {
    console.error("❌ Error updating charity profile:", error);
    res.status(500).json({ error: "Failed to update charity profile" });
  }
});

module.exports = router;