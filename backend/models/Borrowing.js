// backend/models/Borrowing.js
const mongoose = require("mongoose");

const borrowingSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  author: { type: String, required: true },
  borrower: { type: String, required: true },
  loanDate: { type: Date, required: true },
  returnDate: { type: Date, required: true },
  status: {
    type: String,
    enum: ["Borrowed", "Returned", "Overdue", "Paid"],
    default: "Borrowed",
  },
  fine: { type: Number, default: 0 },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

module.exports = mongoose.model("Borrowing", borrowingSchema);
