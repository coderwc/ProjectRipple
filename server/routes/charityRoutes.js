const express = require("express");
const router = express.Router();
const { db, verifyFirebaseToken, verifyRole } = require("../firebaseAdmin");

// Public endpoints (no auth required)
// Get public charity profile by ID
router.get("/public/:charityId", async (req, res) => {
  try {
    const { charityId } = req.params;
    console.log("🔍 UPDATED: Fetching charity profile for ID:", charityId);
    
    const charityRef = db.collection("users").doc(charityId);
    const doc = await charityRef.get();

    if (!doc.exists) {
      console.log("❌ Charity not found in users collection, returning mock data");
      // Return mock data for testing when charity profile doesn't exist
      const mockData = {
        id: charityId,
        name: "Hope Foundation",
        tagline: "Bringing hope to communities in need",
        location: "San Francisco, CA",
        phone: "+1 (555) 123-4567",
        website: "www.hopefoundation.org",
        aboutUs: "Hope Foundation has been dedicated to providing emergency relief and long-term support to communities affected by natural disasters and poverty. Our mission is to restore hope and rebuild lives through compassionate action and sustainable solutions.",
        focusAreas: ["Disaster Relief", "Education", "Healthcare", "Community Development"],
        impactStats: {
          familiesHelped: 15000,
          communitiesReached: 45,
          yearsActive: 12
        }
      };
      return res.json(mockData);
    }
    
    const charityData = doc.data();
    if (charityData.type !== 'charity') {
      console.log("❌ User is not a charity, returning mock data");
      // Return mock data for testing
      const mockData = {
        id: charityId,
        name: "Hope Foundation",
        tagline: "Bringing hope to communities in need",
        location: "San Francisco, CA",
        phone: "+1 (555) 123-4567",
        website: "www.hopefoundation.org",
        aboutUs: "Hope Foundation has been dedicated to providing emergency relief and long-term support to communities affected by natural disasters and poverty.",
        focusAreas: ["Disaster Relief", "Education", "Healthcare"],
        impactStats: {
          familiesHelped: 15000,
          communitiesReached: 45,
          yearsActive: 12
        }
      };
      return res.json(mockData);
    }

    // Return actual charity data if found
    const publicData = {
      id: charityId,
      name: charityData.name,
      tagline: charityData.tagline,
      location: charityData.location,
      phone: charityData.phone,
      socials: charityData.socials,
      aboutUs: charityData.aboutUs,
      focusAreas: charityData.focusAreas || [],
      impactStats: {
        familiesHelped: Math.floor(Math.random() * 5000) + 1000,
        communitiesReached: Math.floor(Math.random() * 200) + 50,
        yearsActive: Math.floor(Math.random() * 15) + 3
      }
    };

    console.log("✅ Returning charity data:", publicData);
    res.json(publicData);
  } catch (error) {
    console.error("❌ Error fetching public charity profile:", error);
    res.status(500).json({ error: "Failed to fetch charity profile" });
  }
});

// Get charity posts
router.get("/public/:charityId/posts", async (req, res) => {
  try {
    const { charityId } = req.params;
    
    // Mock posts data - in real implementation, you'd fetch from a posts collection
    const posts = [
      {
        id: 1,
        charityId: charityId,
        headline: "Emergency Earthquake Relief Fund",
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
      }
    ];

    res.json(posts);
  } catch (error) {
    console.error("❌ Error fetching charity posts:", error);
    res.status(500).json({ error: "Failed to fetch charity posts" });
  }
});

// Apply Firebase token verification and charity role verification to protected routes
router.use(verifyFirebaseToken);
router.use(verifyRole('charity'));

// Get charity profile
router.get("/profile", async (req, res) => {
  try {
    const charityRef = db.collection("users").doc(req.user.uid);
    const doc = await charityRef.get();

    if (!doc.exists) {
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