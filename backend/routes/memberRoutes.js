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

const getUserId = (req) => {
  const decoded = verifyUser(req);
  return decoded ? decoded.id : null;
};


// GET all members
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

// POST: Add a new member (with unique ID check)
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

//Search members by ID
router.get("/search",async (req,res)=>{
  try{
    const userId = getUserId(req);
    if(!userId) return res.status(401).json({message:"Not logged in"});

    const query = req.query.q;
    if (!query) return res.json([]);

    const members = await Member.find({
      user: userId,
      id: { $regex: query, $options: "i" }
    }).limit(5);

    res.json(members);
  } catch(err){
    res.status(500).json({message:"Error searching members", error: err.message});
  }
});

// Example Backend Route (memberRoutes.js)
router.delete("/:id", async (req, res) => {
  try {
    const decoded = verifyUser(req); // Your JWT verification helper
    if (!decoded) return res.status(401).json({ message: "Unauthorized" });

    const deletedMember = await Member.findOneAndDelete({ 
      _id: req.params.id, 
      user: decoded.id 
    });

    if (!deletedMember) return res.status(404).json({ message: "Member not found" });
    res.json({ message: "Member deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});
module.exports = router;
