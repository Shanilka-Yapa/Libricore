import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

const Members = () => {
  const API_BASE = import.meta.env.VITE_API_URL || "http://65.0.31.24:5000";
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch members from backend with token
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        if (!token) {
          navigate("/");
          return;
        }

        const res = await fetch(`${API_BASE}/api/members`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (res.ok) {
          // Handle both array or { members: [...] } formats
          const membersArray = Array.isArray(data) ? data : data.members || [];
          setMembers(membersArray);
        } else {
          console.error("Failed to fetch members");
          if (res.status === 401) navigate("/"); // Unauthorized, redirect to login
        }
      } catch (error) {
        console.error("Error fetching members:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, []);

  // Filter members based on search input
  const filteredMembers = members.filter(
    (member) =>
      member.name?.toLowerCase().includes(search.toLowerCase()) ||
      (member.id?.toString().toLowerCase().includes(search.toLowerCase()))
  );

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this member?")) {
      try {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        const res = await fetch(`${API_BASE}/api/members/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          setMembers(members.filter((m) => m._id !== id && m.id !== id));
          alert("Member deleted successfully");
        }else{
          const errorData = await res.json();
          alert(errorData.message || "Failed to delete member");  
        }
      } catch (error) {
        console.error("Error deleting member:", error);
        alert("Failed to delete member");
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F5E8E4] p-6">
      <div className="max-w-5xl mx-auto bg-white shadow-xl rounded-2xl p-8">
        {/* Top Bar: Back + Add Member */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => navigate("/dashboard")}
            className="bg-[#4B0000] text-white px-4 py-2 rounded-lg hover:bg-[#3b0000] transition-all"
          >
            ←
          </button>

          <Link
            to="/add-member"
            className="bg-[#4B0000] text-white px-4 py-2 rounded-lg hover:bg-[#3b0000] transition-all"
          >
            + Add Member
          </Link>
        </div>

        {/* Header */}
        <h1 className="text-3xl font-bold text-center text-[#4B0000] mb-6">
          👥 Library Members
        </h1>

        {/* Search Bar */}
        <div className="flex justify-end mb-4">
          <input
            type="text"
            placeholder="Search by name or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#4B0000] focus:outline-none w-1/3"
          />
        </div>

        {/* Members Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <p className="text-center text-gray-500 py-4 italic">Loading...</p>
          ) : filteredMembers.length > 0 ? (
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#4B0000] text-white text-left">
                  <th className="py-3 px-4">ID No</th>
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Age</th>
                  <th className="py-3 px-4">Address</th>
                  <th className="py-3 px-4">Phone Number</th>
                  <th className="py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map((member) => (
                  <tr
                    key={member._id || member.id}
                    className="border-b hover:bg-gray-50 transition-all"
                  >
                    <td className="py-3 px-4">{member.id || member._id}</td>
                    <td className="py-3 px-4">{member.name}</td>
                    <td className="py-3 px-4">{member.age}</td>
                    <td className="py-3 px-4">{member.address}</td>
                    <td className="py-3 px-4">{member.phone}</td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleDelete(member._id || member.id)}
                        className="bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 transition-all"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-center text-gray-500 italic py-4">
              No members found.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Members;
