import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const ViewBooks = () => {
  const API_BASE = import.meta.env.VITE_API_URL || "http://65.0.31.24:5000";
  const [searchTerm, setSearchTerm] = useState("");
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBooks = async () => {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) {
        alert("You must be logged in to view books");
        navigate("/");
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/api/books`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) {
          setBooks(data.books || []);
        } else {
          console.error(data.message || "Failed to fetch books");
        }
      } catch (err) {
        console.error("Connection error:",err);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [navigate]);

  const filteredBooks = books.filter(
    (book) =>
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this book?")) {
      try {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        const res =await fetch(`${API_BASE}/api/books/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          setBooks(books.filter((b) => b._id !== id));
          alert ("Book deleted successfully");
        } else {
          const errorData = await res.json();
          alert(errorData.message || "Failed to delete book");
        }
      } catch (error) {
        console.error("Error deleting book:", error);
        alert("Failed to delete book");
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F5E8E4] p-8">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 bg-[#4B0000] text-white px-4 py-2 rounded-lg hover:bg-[#3b0000] transition-all"
      >
        ← Back
      </button>

      <h1 className="text-4xl font-bold text-[#4B0000] mb-6 text-center">
        📚 View Books
      </h1>

      <div className="mb-6 flex justify-center">
        <input
          type="text"
          placeholder="Search by title or author..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#4B0000]"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {filteredBooks.length === 0 && (
          <p className="text-gray-600 text-center col-span-full">No books found.</p>
        )}

        {filteredBooks.map((book) => (
          <div
            key={book._id}
            className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200 hover:scale-105 transition-transform duration-300 w-64 mx-auto"
          >

            {/* Cover Image */}
            <div className="h-64 bg-gray-100 flex items-center justify-center">
              {book.coverImage ? (
                <img
                  src={`${API_BASE}/${book.coverImage.replace(/\\/g, "/").replace("uploads/","")}`}
                  alt={book.title}
                  className="w-auto h-full object-contain"
                  onError={(e)=>{e.target.src='https://via.placeholder.com/150';}}
                />
              ) : (
                <span className="text-gray-400">No Image</span>
              )}
            </div>

            {/* Book Info */}
            <div className="p-4">
              <h2 className="text-xl font-semibold text-[#4B0000]">{book.title}</h2>
              <p className="text-gray-600">by {book.author}</p>
              <p className="text-gray-500 mt-1">Genre: {book.genre}</p>
              {book.isbn && <p className="text-gray-500">ISBN: {book.isbn}</p>}
              {book.description && (
                <p className="text-gray-700 mt-2 text-sm line-clamp-4">
                  {book.description}
                </p>
              )}

              <button
                onClick={() => handleDelete(book._id)}
                className="mt-4 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ViewBooks;
