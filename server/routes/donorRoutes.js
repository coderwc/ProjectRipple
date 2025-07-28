const express = require("express");
const router = express.Router();
const { db, verifyFirebaseToken, verifyRole } = require("../firebaseAdmin");

// Apply Firebase token verification and donor role verification to all routes
router.use(verifyFirebaseToken);
router.use(verifyRole('donor'));

// Get donor profile
router.get("/profile", async (req, res) => {
  try {
    const donorRef = db.collection("users").doc(req.user.uid);
    const doc = await donorRef.get();

    if (!doc.exists()) {
      return res.status(404).json({ error: "Donor profile not found" });
    }
    
    const donorData = doc.data();
    if (donorData.type !== 'donor') {
      return res.status(403).json({ error: "Access denied: Not a donor account" });
    }

    res.json(donorData);
  } catch (error) {
    console.error("❌ Error fetching donor profile:", error);
    res.status(500).json({ error: "Failed to fetch donor profile" });
  }
});

// Update donor profile
router.put("/profile", async (req, res) => {
  try {
    const donorRef = db.collection("users").doc(req.user.uid);
    
    // Ensure we don't allow changing the user type
    const updateData = { ...req.body };
    delete updateData.type; // Remove type from update data
    delete updateData.uid;  // Remove uid from update data
    
    await donorRef.update(updateData);
    res.json({ message: "Donor profile updated successfully" });
  } catch (error) {
    console.error("❌ Error updating donor profile:", error);
    res.status(500).json({ error: "Failed to update donor profile" });
  }
});

module.exports = router;