import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Overdue = () => {
  const navigate = useNavigate();
  const [overdueBooks, setOverdueBooks] = useState([]);
  const [paidBooks, setPaidBooks] = useState([]);
  const [showCalc, setShowCalc] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [formData, setFormData] = useState({
    borrowedDate: "",
    returnedDate: "",
    oneDayFine: "",
    totalFine: "",
  });

  // ✅ Fetch Overdue & Paid records from backend
  const fetchData = async () => {
    try {
      const [borrowingsRes, paidRes] = await Promise.all([
        fetch("http://65.0.54.172:5000/api/borrowings"),
        fetch("http://65.0.54.172:5000/api/borrowings/paid"),
      ]);

      const borrowingsData = await borrowingsRes.json();
      const paidData = await paidRes.json();

      if (borrowingsRes.ok) {
        const overdueList = borrowingsData.borrowings.filter(
          (b) => b.status === "Overdue"
        );
        setOverdueBooks(overdueList);
      }

      if (paidRes.ok) {
        setPaidBooks(paidData.paidFines);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ✅ Open fine calculator popup
  const openCalculator = (book) => {
    setSelectedBook(book);
    setShowCalc(true);
  };

  // ✅ Close fine calculator
  const closeCalculator = () => {
    setShowCalc(false);
    setFormData({
      borrowedDate: "",
      returnedDate: "",
      oneDayFine: "",
      totalFine: "",
    });
  };

  // ✅ Handle fine input change & auto-calc
  const handleChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...formData, [name]: value };

    if (updated.borrowedDate && updated.returnedDate && updated.oneDayFine) {
      const start = new Date(updated.borrowedDate);
      const end = new Date(updated.returnedDate);
      const days = Math.max(0, (end - start) / (1000 * 60 * 60 * 24));
      updated.totalFine = (days * parseFloat(updated.oneDayFine)).toFixed(2);
    }

    setFormData(updated);
  };

  // ✅ Mark book as Paid
  const handleMarkPaid = async () => {
    if (!selectedBook) return;

    try {
      const res = await fetch(
        `http://65.0.54.172:5000/api/borrowings/${selectedBook.id}/pay`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            borrowedDate: formData.borrowedDate,
            returnedDate: formData.returnedDate,
            fine: formData.totalFine,
            status: "Paid",
          }),
        }
      );

      const data = await res.json();
      if (res.ok) {
        alert("✅ Fine recorded and marked as Paid!");
        closeCalculator();
        fetchData(); // Refresh lists
      } else {
        alert(data.message || "Error updating fine");
      }
    } catch (err) {
      console.error("Error updating fine:", err);
      alert("Server error while updating fine");
    }
  };

  // ✅ Colored status labels
  const renderStatus = (status) => {
    let colorClass = "";
    if (status === "Overdue") colorClass = "bg-red-100 text-red-700";
    else if (status === "Borrowed") colorClass = "bg-yellow-100 text-yellow-700";
    else if (status === "Returned") colorClass = "bg-green-100 text-green-700";
    else if (status === "Paid") colorClass = "bg-blue-100 text-blue-700";

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${colorClass}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[#F5E8E4] p-6 relative">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-[#4B0000]">📚 Overdue & Paid Fines</h1>
        <button
          onClick={() => navigate("/dashboard")}
          className="bg-[#4B0000] text-white px-4 py-2 rounded-lg hover:bg-[#3b0000] transition-all"
        >
          ←
        </button>
      </div>

      {/* Overdue Table */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-10">
        <h2 className="text-2xl font-bold mb-4 text-[#4B0000]">Overdue Books</h2>
        {overdueBooks.length === 0 ? (
          <p className="text-gray-600 text-center py-6">
            🎉 No overdue books right now!
          </p>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="text-left border-b text-gray-700">
                <th className="p-3">Book Title</th>
                <th className="p-3">Borrower</th>
                <th className="p-3">Due Date</th>
                <th className="p-3">Fine (Rs)</th>
                <th className="p-3">Status</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {overdueBooks.map((book) => (
                <tr key={book.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{book.title}</td>
                  <td className="p-3">{book.borrower}</td>
                  <td className="p-3">{book.returnDate ? new Date(book.returnDate).toLocaleDateString("en-GB"):"-"}</td>
                  <td className="p-3">{book.fine || "-"}</td>
                  <td className="p-3">{renderStatus(book.status)}</td>
                  <td className="p-3">
                    <button
                      onClick={() => openCalculator(book)}
                      className="bg-[#4B0000] text-white px-3 py-1 rounded-lg hover:bg-[#3b0000] transition-all"
                    >
                      Fine Calculator
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Paid Fines Table */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-[#4B0000]">Paid Fines</h2>
        {paidBooks.length === 0 ? (
          <p className="text-gray-600 text-center py-6">
            💸 No paid fines yet!
          </p>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="text-left border-b text-gray-700">
                <th className="p-3">Book Title</th>
                <th className="p-3">Borrower</th>
                <th className="p-3">Fine Amount (Rs)</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {paidBooks.map((book) => (
                <tr key={book.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{book.title}</td>
                  <td className="p-3">{book.borrower}</td>
                  <td className="p-3">{book.fine}</td>
                  <td className="p-3">{renderStatus(book.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Fine Calculator Modal */}
      {showCalc && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#F5E8E4] bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md">
            <h2 className="text-2xl font-bold text-center text-[#4B0000] mb-4">
              💰 Fine Calculator
            </h2>

            <div className="space-y-3">
              <div>
                <label className="block text-gray-700 mb-1">Borrowed Date</label>
                <input
                  type="date"
                  name="borrowedDate"
                  value={formData.borrowedDate}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-1">Returned Date</label>
                <input
                  type="date"
                  name="returnedDate"
                  value={formData.returnedDate}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-1">Fine Per Day (Rs)</label>
                <input
                  type="number"
                  name="oneDayFine"
                  value={formData.oneDayFine}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded-lg"
                  placeholder="Enter fine per day"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-1">Total Fine (Rs)</label>
                <input
                  type="text"
                  name="totalFine"
                  value={formData.totalFine}
                  readOnly
                  className="w-full border px-3 py-2 rounded-lg bg-gray-100"
                />
              </div>
            </div>

            <div className="flex justify-between mt-5">
              <button
                onClick={closeCalculator}
                className="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleMarkPaid}
                className="px-4 py-2 rounded-lg bg-[#4B0000] text-white hover:bg-[#3b0000] transition-all"
              >
                Mark as Paid
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Overdue;
