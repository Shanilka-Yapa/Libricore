const mongoose = require("mongoose");

const PaidFineSchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  borrower: { type: String, required: true },
  fine: { type: Number, required: true },
  borrowedDate: { type: String },
  returnedDate: { type: String },
  status: { type: String, default: "Paid" },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

module.exports = mongoose.model("PaidFine", PaidFineSchema);
