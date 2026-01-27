import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const ManageBooks = () => {
  
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [newBorrowing, setNewBorrowing] = useState({
    title: "",
    author: "",
    borrower: "",
    loanDate: "",
    returnDate: "",
    status: "Borrowed",
  });

  // ✅ Fetch books from backend & auto-mark overdue ones
  const fetchBorrowings = async () => {
    try {
      const token = localStorage.getItem("token")||sessionStorage.getItem("token");
      const res = await fetch("http://65.0.31.24:5000/api/borrowings",{
        method: "GET",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json" }
      });
      const data = await res.json();
      if (res.ok && data.borrowings) {
        const today = new Date();
        const updatedBooks = await Promise.all(
          data.borrowings.map(async (b) => {
            if (b.status === "Borrowed" && new Date(b.returnDate) < today) {
              // mark overdue in backend
              await updateStatus(b.id, "Overdue", false);
              return { ...b, status: "Overdue" };
            }
            return b;
          })
        );
        setBooks(data.borrowings);
      }
    } catch (err) {
      console.error("Error fetching borrowings:", err);
    }
  };

  useEffect(() => {
    fetchBorrowings();
  }, []);

  // ✅ Update status (can be called manually or from overdue check)
  const updateStatus = async (id, newStatus, updateFrontend = true) => {
    try {
      if (updateFrontend) {
        setBooks((prev) =>
          prev.map((b) => (b.id === id ? { ...b, status: newStatus } : b))
        );
      }

      const res = await fetch(`http://65.0.31.24:5000/api/borrowings/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Failed to update status");
      }
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  // ✅ Add new borrowing
  const handleAddBorrowing = async (e) => {
    e.preventDefault();
    try {
      const id = `B${(books.length + 1).toString().padStart(3, "0")}`;
      const newEntry = { id, ...newBorrowing };

      const res = await fetch("http://65.0.31.24:5000/api/borrowings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEntry),
      });

      const data = await res.json();
      if (res.ok) {
        setBooks([...books, data.borrowing]);
        setShowModal(false);
        setNewBorrowing({
          title: "",
          author: "",
          borrower: "",
          loanDate: "",
          returnDate: "",
          status: "Borrowed",
        });
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Error adding borrowing:", error);
    }
  };

  const filteredBooks = books.filter(
    (b) =>
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.author.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F5E8E4] p-6">
      <div className="max-w-6xl mx-auto bg-white shadow-xl rounded-2xl p-8">
        {/* Header Buttons */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate("/dashboard")}
            className="bg-[#4B0000] text-white px-4 py-2 rounded-lg hover:bg-[#3b0000] transition-all"
          >
            ←
          </button>

          <button
            onClick={() => setShowModal(true)}
            className="bg-[#4B0000] text-white px-4 py-2 rounded-lg hover:bg-[#3b0000] transition-all"
          >
            + Add Borrowing
          </button>
        </div>

        {/* Search Bar */}
        <div className="flex justify-end mb-4">
          <input
            type="text"
            placeholder="Search by title or author..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#4B0000] focus:outline-none w-1/3"
          />
        </div>

        {/* Books Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#4B0000] text-white text-left">
                <th className="py-3 px-4">Book ID</th>
                <th className="py-3 px-4">Title</th>
                <th className="py-3 px-4">Author</th>
                <th className="py-3 px-4">Borrower</th>
                <th className="py-3 px-4">Loan Date</th>
                <th className="py-3 px-4">Return Date</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredBooks.map((b) => (
                <tr
                  key={b.id}
                  className="border-b hover:bg-gray-50 transition-all"
                >
                  <td className="py-3 px-4">{b.id}</td>
                  <td className="py-3 px-4">{b.title}</td>
                  <td className="py-3 px-4">{b.author}</td>
                  <td className="py-3 px-4">{b.borrower}</td>
                  <td className="py-3 px-4">
                    {b.loanDate ? new Date(b.loanDate).toLocaleDateString("en-GB") : "—"}
                  </td>
                  <td className="py-3 px-4">
                    {b.returnDate ? new Date(b.returnDate).toLocaleDateString("en-GB") : "—"}
                  </td>

                  <td className="py-3 px-4">
                    <select
                      value={b.status}
                      onChange={(e) => updateStatus(b.id, e.target.value)}
                      className={`border rounded px-2 py-1 text-sm ${
                        b.status === "Overdue"
                          ? "bg-red-100 text-red-700"
                          : b.status === "Borrowed"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      <option value="Borrowed">Borrowed</option>
                      <option value="Returned">Returned</option>
                      <option value="Overdue">Overdue</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Borrowing Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-[#F5E8E4] bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-lg">
            <h2 className="text-2xl font-bold text-center text-[#4B0000] mb-6">
              ➕ Add Borrowing Entry
            </h2>

            <form onSubmit={handleAddBorrowing} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Book Title
                </label>
                <input
                  type="text"
                  name="title"
                  placeholder="Enter book title"
                  value={newBorrowing.title}
                  onChange={(e) =>
                    setNewBorrowing({ ...newBorrowing, title: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#4B0000] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Author
                </label>
                <input
                  type="text"
                  name="author"
                  placeholder="Enter author name"
                  value={newBorrowing.author}
                  onChange={(e) =>
                    setNewBorrowing({ ...newBorrowing, author: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#4B0000] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Borrower Name
                </label>
                <input
                  type="text"
                  name="borrower"
                  placeholder="Enter borrower's name"
                  value={newBorrowing.borrower}
                  onChange={(e) =>
                    setNewBorrowing({
                      ...newBorrowing,
                      borrower: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#4B0000] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Loan Date
                </label>
                <input
                  type="date"
                  name="loanDate"
                  value={newBorrowing.loanDate}
                  onChange={(e) =>
                    setNewBorrowing({
                      ...newBorrowing,
                      loanDate: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#4B0000] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Return Date
                </label>
                <input
                  type="date"
                  name="returnDate"
                  value={newBorrowing.returnDate}
                  onChange={(e) =>
                    setNewBorrowing({
                      ...newBorrowing,
                      returnDate: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#4B0000] focus:outline-none"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg border hover:bg-gray-100 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#4B0000] text-white hover:bg-[#3b0000] transition-all"
                >
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageBooks;
