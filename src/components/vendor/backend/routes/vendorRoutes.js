const express = require("express");
const router = express.Router();
const { db, verifyFirebaseToken } = require("../firebaseAdmin");

router.use(verifyFirebaseToken);

// Init or update vendor profile
router.post("/init", async (req, res) => {
  const { name, email } = req.body;
  const vendorRef = db.collection("vendors").doc(req.user.uid);

  try {
    await vendorRef.set({ name, email, balance: 0, listings: 0 }, { merge: true });
    res.json({ message: "Vendor initialized or updated" });
  } catch (error) {
    console.error("❌ Error initializing vendor:", error);
    res.status(500).json({ error: "Failed to initialize vendor" });
  }
});

// Get vendor profile
router.get("/profile", async (req, res) => {
  try {
    const vendorRef = db.collection("vendors").doc(req.user.uid);
    const doc = await vendorRef.get();

    if (!doc.exists) return res.status(404).json({ error: "Vendor not found" });
    res.json(doc.data());
  } catch (error) {
    console.error("❌ Error fetching vendor profile:", error);
    res.status(500).json({ error: "Failed to fetch vendor profile" });
  }
});

// Add new listing under vendor's subcollection
router.post("/listings", async (req, res) => {
  try {
    const vendorId = req.user.uid;
    const {
      name, category, price, quantity, expiryDate, condition, description, image
    } = req.body;

    const newListing = {
      name,
      category,
      price,
      quantity,
      expiryDate: expiryDate || null,
      condition: condition || "New",
      description: description || "",
      image: image || "",
      createdAt: new Date().toISOString()
    };

    const docRef = await db.collection("vendors").doc(vendorId).collection("listings").add(newListing);
    res.status(200).json({ id: docRef.id, ...newListing });
  } catch (error) {
    console.error("❌ Error adding listing:", error);
    res.status(500).json({ error: "Failed to add listing" });
  }
});

// Fetch all listings for current vendor
router.get("/listings", async (req, res) => {
  try {
    const vendorId = req.user.uid;
    const snapshot = await db.collection("vendors").doc(vendorId).collection("listings").get();

    const listings = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json(listings);
  } catch (error) {
    console.error("❌ Error fetching listings:", error);
    res.status(500).json({ error: "Failed to fetch listings" });
  }
});

// Update specific listing
router.put("/listings/:id", async (req, res) => {
  const listingId = req.params.id;
  const vendorId = req.user.uid;

  try {
    const listingRef = db.collection("vendors").doc(vendorId).collection("listings").doc(listingId);
    const doc = await listingRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Listing not found" });
    }

    await listingRef.update(req.body);
    res.status(200).json({ message: "Listing updated" });
  } catch (error) {
    console.error("❌ Error updating listing:", error);
    res.status(500).json({ error: "Failed to update listing" });
  }
});

// Delete specific listing
router.delete("/listings/:id", async (req, res) => {
  const listingId = req.params.id;
  const vendorId = req.user.uid;

  try {
    const listingRef = db.collection("vendors").doc(vendorId).collection("listings").doc(listingId);
    const doc = await listingRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Listing not found" });
    }

    await listingRef.delete();
    res.status(200).json({ message: "Listing deleted" });
  } catch (error) {
    console.error("❌ Error deleting listing:", error);
    res.status(500).json({ error: "Failed to delete listing" });
  }
});

module.exports = router;
