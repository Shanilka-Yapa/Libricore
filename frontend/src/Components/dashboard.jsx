import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../Images/Logo.png";
import dashboardImage from "../Images/dashboard-footer.png";

const Dashboard = () => {
  const navigate = useNavigate();
  const [bookCount, setBookCount] = useState(0);
  const [memberCount, setMemberCount] = useState(0);
  const [loanCount, setLoanCount] = useState(0);
  const [overdueCount, setOverdueCount] = useState(0);
  const [recentBorrowings, setRecentBorrowings] = useState([]); // for the recent activity section

  // Fetch book, member, and loan counts
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");

        // --- Fetch Books ---
        const booksRes = await fetch("http://65.0.54.172:5000/api/books", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const booksData = await booksRes.json();
        if (booksRes.ok && booksData) {
          const booksArray = Array.isArray(booksData)
            ? booksData
            : booksData.books || [];
          setBookCount(booksArray.length);
        }

        // --- Fetch Members ---
        const membersRes = await fetch("http://65.0.54.172:5000/api/members", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const membersData = await membersRes.json();
        console.log("Fetched members:", membersData);

        if (membersRes.ok && membersData) {
          const membersArray = Array.isArray(membersData)
            ? membersData
            : membersData.members || [];
          setMemberCount(membersArray.length);
        }

        // Fetch Recent Borrowings for Dashboard table 
        const recentRes = await fetch("http://65.0.54.172:5000/api/borrowings", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const recentData = await recentRes.json();

        if (recentRes.ok && recentData.borrowings) {
          // Sort by loan date (latest first) and take only 3
          const latestThree = recentData.borrowings
            .sort(
              (a, b) => new Date(b.loanDate || 0) - new Date(a.loanDate || 0)
            )
            .slice(0, 3);

          setRecentBorrowings(latestThree);
        }


        // --- Fetch Loans (Borrowed or Overdue) ---
        const loanres = await fetch("http://65.0.54.172:5000/api/borrowings", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const loanData = await loanres.json();
        console.log("Fetched loans:", loanData);

        if (loanres.ok && loanData) {
          const loanArray = Array.isArray(loanData)
            ? loanData
            : loanData.borrowings || [];

          // Filter only Borrowed or Overdue
          const activeLoans = loanArray.filter(
            (l) => l.status === "Borrowed" || l.status === "Overdue"
          );

          // Count all borrowed or overdue books
            setLoanCount(activeLoans.length);


          // Count overdue separately for Overdue card
          const overdueLoans = loanArray.filter((l) => l.status === "Overdue");
          setOverdueCount(overdueLoans.length);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  // ✅ Handle card clicks for navigation
  const handleCardClick = (label) => {
    if (label === "Books") navigate("/view-books");
    else if (label === "Members") navigate("/members");
    else if (label === "Loans") navigate("/loans");
    else if (label === "Overdue") navigate("/overdue");
  };

  // ✅ Dashboard cards
  const stats = [
    { id: 1, label: "Books", value: bookCount, bg: "bg-[#4B0000]" },
    { id: 2, label: "Members", value: memberCount, bg: "bg-[#064e3b]" },
    { id: 3, label: "Loans", value: loanCount, bg: "bg-[#b45309]" },
    { id: 4, label: "Overdue", value: overdueCount, bg: "bg-red-500" },
  ];


  return (
    <div className="min-h-screen bg-[#F5E8E4] p-6 lg:p-10">
      {/* Header */}
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <img src={logo} alt="Site logo" className="w-20 h-20 object-contain" />
          <div>
            <h1 className="text-4xl lg:text-5xl font-bold text-[#4B0000]">
              Dashboard
            </h1>
            <p className="text-sm text-gray-600">
              Overview of library activity and quick actions
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link
            to="/add-book"
            className="inline-flex items-center px-4 py-2 bg-[#4B0000] text-white rounded-md text-sm hover:bg-[#3b0000] transition-all"
          >
            + Add Book
          </Link>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-sm text-gray-600">Signed in as</div>
              <div className="text-sm font-medium text-gray-900">
                {localStorage.getItem("userEmail") || "Guest"}
              </div>
            </div>

            <button
              onClick={() => {
                localStorage.removeItem("userEmail");
                navigate("/");
              }}
              className="px-3 py-1 bg-[#4B0000] text-white rounded-md text-sm hover:bg-[#3b0000] transition-all"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Stats cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((s) => (
          <div
            key={s.id}
            onClick={() => handleCardClick(s.label)}
            className={`rounded-lg p-5 text-white ${s.bg} shadow cursor-pointer hover:scale-105 hover:shadow-lg transition-all duration-300`}
          >
            <div className="text-xl uppercase opacity-90">{s.label}</div>
            <div className="mt-2 text-3xl font-bold">{s.value}</div>
          </div>
        ))}
      </section>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent activity */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Recent Activity
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left">
              <thead>
                <tr className="text-gray-600">
                  <th className="py-2 px-3">Book</th>
                  <th className="py-2 px-3">Member</th>
                  <th className="py-2 px-3">Date</th>
                  <th className="py-2 px-3">Status</th>
                </tr>
              </thead>
          <tbody className="divide-y">
          {recentBorrowings.length === 0 ? (
            <tr>
              <td colSpan="4" className="py-4 text-center text-gray-500">
                No recent activity
              </td>
            </tr>
          ) : (
            recentBorrowings.map((r) => (
              <tr key={r.id} className="hover:bg-gray-50">
                <td className="py-3 px-3">{r.title}</td>
                <td className="py-3 px-3">{r.borrower}</td>
                <td className="py-3 px-3">
                  {r.loanDate
                    ? new Date(r.loanDate).toLocaleDateString("en-GB")
                    : "—"}
                </td>
                <td className="py-3 px-3">
                  <span
                    className={`inline-flex px-2 py-1 text-xs rounded-full ${
                      r.status === "Overdue"
                        ? "bg-red-100 text-red-700"
                        : r.status === "Borrowed"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {r.status}
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>

            </table>
          </div>
        </div>

        {/* Quick actions */}
        <aside className="bg-white rounded-lg shadow p-6 space-y-4">
          <h3 className="text-md font-medium text-gray-900">Quick Actions</h3>
          <div className="flex flex-col gap-3">
            <Link
              to="/add-book"
              className="w-full text-left px-4 py-2 bg-[#4B0000] text-white rounded-md hover:bg-[#3b0000] transition-all"
            >
              Add new book
            </Link>
            <Link
              to="/view-books"
              className="w-full text-left px-4 py-2 border rounded-md hover:bg-gray-100 transition-all"
            >
              View books
            </Link>
            <Link
              to="/members"
              className="w-full text-left px-4 py-2 border rounded-md hover:bg-gray-100 transition-all"
            >
              View members
            </Link>
            <Link
              to="/loans"
              className="w-full text-left px-4 py-2 border rounded-md hover:bg-gray-100 transition-all"
            >
              Manage Books
            </Link>
          </div>
        </aside>
      </div>


      {/* Dashboard Bottom Image */}
      <div className="mt-12">
        <img
          src={dashboardImage}
          alt="Library banner"
          className="w-full h-64 object-cover rounded-lg shadow"
        />
      </div>
    </div>
  );
};

export default Dashboard;
