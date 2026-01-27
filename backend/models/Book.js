const mongoose = require("mongoose");

const BookSchema = new mongoose.Schema({
  title: String,
  author: String,
  genre: String,
  publishedDate: Date,
  description: String,
  coverImage: String, // store file path
});

module.exports = mongoose.model("Book", BookSchema);
