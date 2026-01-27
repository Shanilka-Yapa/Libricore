const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

const authRoutes = require("./routes/authRoutes");
const bookRoutes = require("./routes/books");
const memberRoutes = require("./routes/memberRoutes");
const borrowingsRoutes = require("./routes/Borrowingroutes");

dotenv.config();
const app = express();

// ✅ Middleware
app.use(cors({
  origin: "http://65.0.31.24", // your frontend URL
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());
app.use("/uploads", express.static("uploads"));

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
