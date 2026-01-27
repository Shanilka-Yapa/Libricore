import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AddBook = () => {
  const navigate = useNavigate();

  const [bookData, setBookData] = useState({
    title: "",
    author: "",
    genre: "",
    publishedDate: "",
    description: "",
    coverImage: null,
    coverPreview: null, // For preview
  });

  const genres = ["Fiction", "Non-Fiction", "Science", "History", "Biography", "Fantasy", "Mystery", "Romance", "Horror", "Poetry"];

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "coverImage" && files[0]) {
      setBookData({
        ...bookData,
        coverImage: files[0],
        coverPreview: URL.createObjectURL(files[0]), // create preview
      });
    } else {
      setBookData({ ...bookData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) {
      alert("You must be logged in to add a book");
      navigate("/");
      return;
    }

    const formData = new FormData();
    formData.append("title", bookData.title);
    formData.append("author", bookData.author);
    formData.append("genre", bookData.genre);
    formData.append("publishedDate", bookData.publishedDate);
    formData.append("description", bookData.description);
    if (bookData.coverImage) formData.append("coverImage", bookData.coverImage);

    try {
      const res = await fetch("http://65.0.54.172:5000/api/books", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        alert("✅ Book added successfully!");
        setBookData({
          title: "",
          author: "",
          genre: "",
          publishedDate: "",
          description: "",
          coverImage: null,
          coverPreview: null,
        });
      } else {
        alert(data.message || "Failed to add book");
      }
    } catch (err) {
      console.error(err);
      alert("Error connecting to server");
    }
  };

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (bookData.coverPreview) URL.revokeObjectURL(bookData.coverPreview);
    };
  }, [bookData.coverPreview]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#F5E8E4] p-6">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-lg">
        <button
          onClick={() => navigate("/dashboard")}
          className="mb-6 bg-[#4B0000] text-white px-4 py-2 rounded-lg hover:bg-[#3b0000] transition-all"
        >
          ← Back
        </button>

        <h2 className="text-2xl font-bold text-center text-[#4B0000] mb-6">
          📚 Add a New Book
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" name="title" placeholder="Title" value={bookData.title} onChange={handleChange} required className="w-full px-4 py-2 border rounded-lg" />
          <input type="text" name="author" placeholder="Author" value={bookData.author} onChange={handleChange} required className="w-full px-4 py-2 border rounded-lg" />
          <select name="genre" value={bookData.genre} onChange={handleChange} required className="w-full px-4 py-2 border rounded-lg">
            <option value="" disabled>Select genre</option>
            {genres.map((g, i) => <option key={i} value={g}>{g}</option>)}
          </select>
          <input type="date" name="publishedDate" value={bookData.publishedDate} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" />
          <textarea name="description" placeholder="Description" value={bookData.description} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" />

          {/* Cover Image Upload */}
          <label className="w-full flex items-center justify-center px-4 py-2 bg-[#4B0000] text-white rounded-lg cursor-pointer hover:bg-[#5B0A0A] transition-all">
            {bookData.coverImage ? "Change Cover Image" : "Upload Cover Image"}
            <input type="file" name="coverImage" accept="image/*" onChange={handleChange} className="hidden" />
          </label>

          {/* Preview */}
          {bookData.coverPreview && (
            <div className="mt-2 flex justify-center">
              <img src={bookData.coverPreview} alt="Preview" className="w-32 h-48 object-cover rounded-md shadow" />
            </div>
          )}

          <button type="submit" className="w-full bg-[#4B0000] text-white py-2 rounded-lg hover:bg-[#5B0A0A] transition-all">
            Add Book
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddBook;
