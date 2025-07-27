const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

// Only need this now:
const vendorRoutes = require("./routes/vendorRoutes");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// 🔐 All routes are already protected inside vendorRoutes
app.use("/api/vendor", vendorRoutes);

const PORT = 5001;
app.listen(PORT, () => {
  console.log(`🚀 Vendor backend running at http://localhost:${PORT}`);
});
