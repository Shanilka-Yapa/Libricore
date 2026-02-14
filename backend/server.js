const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

const authRoutes = require("./routes/authRoutes");
const bookRoutes = require("./routes/books");
const memberRoutes = require("./routes/memberRoutes");
const borrowingsRoutes = require("./routes/Borrowingroutes");
const path = require("path");
const fs = require("fs");

dotenv.config();
const app = express();

// ✅ Middleware
app.use(cors({
  origin: ["http://65.0.31.24", "http://localhost:3000", "http://localhost"], // frontend URLs
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

// Serve upload files but return a small inline placeholder SVG when file is missing.
const uploadsPath = path.join(__dirname, "uploads");
// Ensure uploads directory exists (will be a mounted volume in production)
try {
  fs.mkdirSync(uploadsPath, { recursive: true });
} catch (e) {
  console.warn("Could not ensure uploads directory:", e.message);
}
app.use("/uploads", express.static(uploadsPath));

app.get("/uploads/:filePath(*)", (req, res) => {
  const rel = req.params.filePath || ""; // wildcard part after /uploads/
  const filePath = path.join(uploadsPath, rel);
  fs.access(filePath, fs.constants.R_OK, (err) => {
    if (!err) return res.sendFile(filePath);

    // Inline SVG placeholder to avoid 404s when files are missing.
    const svg = `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<svg xmlns='http://www.w3.org/2000/svg' width='420' height='300' viewBox='0 0 420 300'>` +
      `<rect width='100%' height='100%' fill='#F3F4F6'/>` +
      `<text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='#9CA3AF' font-family='Arial, sans-serif' font-size='20'>Image not available</text>` +
      `</svg>`;
    res.setHeader("Content-Type", "image/svg+xml");
    res.status(200).send(svg);
  });
});

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/members", memberRoutes);
app.use("/api/borrowings", borrowingsRoutes);

// ✅ Add this root route so you can confirm backend is running
app.get("/", (req, res) => {
  res.send("🚀 Backend is running successfully inside Docker!");
});

// ✅ MongoDB connection — use the correct hostname 'mongo' for Docker
mongoose.connect(process.env.MONGO_URI || "mongodb://mongo:27017/libricore", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.log("❌ MongoDB connection error:", err));

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => console.log(`🚀 Server running on port ${PORT}`));
