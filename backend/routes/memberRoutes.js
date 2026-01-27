const express = require("express");
const jwt = require("jsonwebtoken");
const Member = require("../models/memberModel");

const router = express.Router();

const verifyUser = (req) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return null;
  const token = authHeader.split(" ")[1];
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return null;
  }
};


// ✅ GET all members
router.get("/", async (req, res) => {
  try {
    const decoded = verifyUser(req);
    if (!decoded) return res.status(401).json({ message: "Not logged in" });

    const members = await Member.find({ user: decoded.id });
    res.json({ members }); // always send in this format
  } catch (err) {
    res.status(500).json({ message: "Error fetching members", error: err.message });
  }
});

// ✅ POST: Add a new member (with unique ID check)
router.post("/", async (req, res) => {
  try {
    const decoded = verifyUser(req);
    if (!decoded) return res.status(401).json({ message: "Not logged in" });

    const { id, name, age, address, phone } = req.body;
    console.log("Received new member data:", req.body); // ✅ for debugging

    // Check if member ID already exists
    const existingMember = await Member.findOne({ id, user: decoded.id });
    if (existingMember) {
      return res.status(400).json({ message: "Member ID already exists" });
    }

    const newMember = new Member({ id, name, age, address, phone, user: decoded.id });
    await newMember.save();
    res.status(201).json({ message: "Member added successfully!", member: newMember });
  } catch (err) {
    res.status(500).json({ message: "Error adding member", error: err.message });
  }
});

module.exports = router;
