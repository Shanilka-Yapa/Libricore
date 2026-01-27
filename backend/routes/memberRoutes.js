const express = require("express");
const Member = require("../models/memberModel");

const router = express.Router();

// ✅ GET all members
router.get("/", async (req, res) => {
  try {
    const members = await Member.find();
    res.json({ members }); // always send in this format
  } catch (err) {
    res.status(500).json({ message: "Error fetching members", error: err.message });
  }
});

// ✅ POST: Add a new member (with unique ID check)
router.post("/", async (req, res) => {
  try {
    const { id, name, age, address, phone } = req.body;
    console.log("Received new member data:", req.body); // ✅ for debugging

    // Check if member ID already exists
    const existingMember = await Member.findOne({ id });
    if (existingMember) {
      return res.status(400).json({ message: "Member ID already exists" });
    }

    const newMember = new Member({ id, name, age, address, phone });
    await newMember.save();
    res.status(201).json({ message: "Member added successfully!", member: newMember });
  } catch (err) {
    res.status(500).json({ message: "Error adding member", error: err.message });
  }
});

module.exports = router;
