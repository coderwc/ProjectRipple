const express = require("express");
const router = express.Router();
const { db, verifyFirebaseToken, verifyRole } = require("../firebaseAdmin");

// Public endpoints (no auth required)
// Get post details by ID
router.get("/posts/:postId", async (req, res) => {
  try {
    const { postId } = req.params;
    
    // Mock post data - in real implementation, you'd fetch from a posts collection
    const posts = {
      1: {
        id: 1,
        charityId: "charity123", // This would be the actual charity Firebase UID
        headline: "Emergency Earthquake Relief Fund",
        organization: "Disaster Relief NGO",
        description: "Providing immediate relief to earthquake victims in affected areas.",
        kindnessCap: "78% Full",
        remainingDays: 40,
        progress: 78,
        image: "/api/placeholder/400/200",
        donationItems: [
          { id: 1, type: "Water Bottles", current: 28, target: 40, available: true },
          { id: 2, type: "Blankets", current: 15, target: 20, available: true },
          { id: 3, type: "Rice Bags", current: 28, target: 40, available: true },
          { id: 4, type: "Soap Bars", current: 28, target: 40, available: false }
        ]
      },
      2: {
        id: 2,
        charityId: "charity456",
        headline: "Animal Rescue Fund",
        organization: "PawSafe",
        description: "Emergency rescue operations for animals affected by recent floods.",
        kindnessCap: "61% Full",
        remainingDays: 25,
        progress: 61,
        image: "/api/placeholder/400/200",
        donationItems: [
          { id: 1, type: "Pet Food", current: 45, target: 60, available: true },
          { id: 2, type: "Medical Supplies", current: 12, target: 25, available: true },
          { id: 3, type: "Animal Carriers", current: 8, target: 15, available: true }
        ]
      }
    };

    const post = posts[postId];
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    res.json(post);
  } catch (error) {
    console.error("❌ Error fetching post:", error);
    res.status(500).json({ error: "Failed to fetch post" });
  }
});

// Apply Firebase token verification and donor role verification to protected routes
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