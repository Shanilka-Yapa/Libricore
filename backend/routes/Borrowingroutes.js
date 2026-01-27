const express = require("express");
const jwt = require("jsonwebtoken");
const Borrowing = require("../models/Borrowing");
const PaidFine = require("../models/PaidFine");

const router = express.Router();

/*-Helper to verify user from token-*/
const getUserId = (req) => {
  const authHeader = req.headers["authorization"];
  if(!authHeader) return null;
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.id;
  } catch {
    return null;
  }
};

/* --------------------------- GET all borrowings --------------------------- */
router.get("/", async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Not logged in" });

    const today = new Date();

    // Auto-update overdue books
    const borrowings = await Borrowing.find({ user: userId });
    for (let b of borrowings) {
      if (b.status === "Borrowed" && new Date(b.returnDate) < today) {
        b.status = "Overdue";
        await b.save();
      }
    }

    const updatedBorrowings = await Borrowing.find({ user: userId });
    res.json({ borrowings: updatedBorrowings });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ----------------------------- ADD a borrowing ---------------------------- */
router.post("/", async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Not logged in" });

    const { id, title, author, borrower, loanDate, returnDate, status } = req.body;

    const existing = await Borrowing.findOne({ id, user: userId });
    if (existing) return res.status(400).json({ message: "Borrowing ID already exists" });

    const newBorrowing = new Borrowing({
      user: userId,
      id,
      title,
      author,
      borrower,
      loanDate,
      returnDate,
      status: status || "Borrowed",
    });

    await newBorrowing.save();
    res.status(201).json({ message: "Borrowing added successfully!", borrowing: newBorrowing });
  } catch (err) {
    res.status(500).json({ message: "Error adding borrowing", error: err.message });
  }
});

/* ----------------------- UPDATE status manually ----------------------- */
router.put("/:id/status", async (req, res) => {
  try {
    const userId = getUserId(req);
    const { id } = req.params;
    const { status } = req.body;

    const borrowing = await Borrowing.findOne({ id, user: userId });
    if (!borrowing) return res.status(404).json({ message: "Record not found" });

    borrowing.status = status;
    await borrowing.save();

    res.json({ message: "Status updated successfully", borrowing });
  } catch (err) {
    res.status(500).json({ message: "Error updating status" });
  }
});

/* --------------------- MARK AS PAID and save to PaidFines --------------------- */
router.put("/:id/pay", async (req, res) => {
  try {
    const userId = getUserId(req);
    const { id } = req.params;
    const { fine, returnedDate } = req.body;

    const borrowing = await Borrowing.findOne({ id, user: userId });
    if (!borrowing) return res.status(404).json({ message: "Borrowing not found" });

    borrowing.status = "Paid";
    borrowing.fine = fine;
    await borrowing.save();

    const paidFine = new PaidFine({
      user: userId,
      id: borrowing.id,
      title: borrowing.title,
      borrower: borrowing.borrower,
      fine,
      borrowedDate: borrowing.loanDate,
      returnedDate: returnedDate || new Date(),
      status: "Paid",
    });

    await paidFine.save();

    res.json({ message: "Fine marked as paid successfully", paidFine });
  } catch (err) {
    res.status(500).json({ message: "Server error while paying fine" });
  }
});

/* --------------------------- GET overdue borrowings -------------------------- */
router.get("/overdue", async (req, res) => {
  try {
    const userId = getUserId(req);
    const overdues = await Borrowing.find({ status: "Overdue" , user: userId });
    res.json({ overdues });
  } catch (err) {
    res.status(500).json({ message: "Error fetching overdue records" });
  }
});

/* ----------------------------- GET paid fines ----------------------------- */
router.get("/paid", async (req, res) => {
  try {
    const userId = getUserId(req);
    const paidFines = await PaidFine.find({ user: userId });
    res.json({ paidFines });
  } catch (err) {
    res.status(500).json({ message: "Error fetching paid fines" });
  }
});

/* ---------------------------- GET dashboard stats ---------------------------- */
router.get("/stats", async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Not logged in" });
    const borrowedCount = await Borrowing.countDocuments({ status: "Borrowed", user: userId });
    const overdueCount = await Borrowing.countDocuments({ status: "Overdue", user: userId });
    const totalLoans = borrowedCount + overdueCount;

    res.json({
      loans: totalLoans,
      borrowed: borrowedCount,
      overdue: overdueCount,
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching stats" });
  }
});

module.exports = router;
