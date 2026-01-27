const express = require("express");
const multer = require("multer");
const path = require("path");
const jwt = require("jsonwebtoken");
const Book = require("../models/Book");

const router = express.Router();

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

const verifyUser = (req, res) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return null;
  const token = authHeader.split(" ")[1];
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  }catch (err){
    return null;
  }
};

// Get all books
router.get("/", async (req, res) => {
  try {
    const decoded = verifyUser(req);
    if (!decoded) return res.status(401).json({ message: "Not logged in" });
    const books = await Book.find({ user: decoded.id }); // fetch all books from database
    res.json({ books });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Add book route (only for logged-in users)
router.post("/", upload.single("coverImage"), async (req, res) => {
  try {
    const decoded = verifyUser(req);
    if (!decoded) return res.status(401).json({ message: "Not logged in" });

    const { title, author, genre, isbn, publishedDate, description } = req.body;
    const coverImage = req.file ? req.file.path : null;
  
    const newBook = new Book({
      title,
      author,
      genre,
      publishedDate,
      description,
      coverImage,
      user: decoded.id,
    });

    await newBook.save();
    res.json({ success: true, book: newBook });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error: Could not save book" });
  }
});

// Delete book (only for logged-in users)
router.delete("/:id", async (req, res) => {
  try {
    const decoded = verifyUser(req);
    if (!decoded) return res.status(401).json({ message: "Not logged in" });

    const book = await Book.findOneAndDelete({ _id: req.params.id, user: decoded.id });
    if (!book) return res.status(404).json({ message: "Book not found" });


    res.json({ message: "Book deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;
