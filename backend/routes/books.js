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

// Get all books
router.get("/", async (req, res) => {
  try {
    const books = await Book.find(); // fetch all books from database
    res.json({ books });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Add book route (only for logged-in users)
router.post("/", upload.single("coverImage"), async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader) return res.status(401).json({ message: "Not logged in" });

    const token = authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Not logged in" });

    let userId;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userId = decoded.id;
    } catch {
      return res.status(401).json({ message: "Invalid token" });
    }

    const { title, author, genre, isbn, publishedDate, description } = req.body;
    const coverImage = req.file ? req.file.path : null;

    const newBook = new Book({
      title,
      author,
      genre,
      publishedDate,
      description,
      coverImage,
    });

    await newBook.save();
    res.json({ success: true, book: newBook });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

// Delete book (only for logged-in users)
router.delete("/:id", async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader) return res.status(401).json({ message: "Not logged in" });

    const token = authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Not logged in" });

    try {
      jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return res.status(401).json({ message: "Invalid token" });
    }

    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) return res.status(404).json({ message: "Book not found" });

    res.json({ message: "Book deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;
