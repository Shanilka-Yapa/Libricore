import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const AddMember = () => {
  const API_BASE = import.meta.env.VITE_API_URL || "http://65.0.31.24:5000";
  const navigate = useNavigate();

  const [memberData, setMemberData] = useState({
    id: "",
    name: "",
    age: "",
    address: "",
    phone: "",
  });

  const handleChange = (e) => {
    setMemberData({ ...memberData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token){
      alert("You must be logged in to add a member");
      navigate("/");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/members`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(memberData),
      });

      const data = await res.json();

      if (res.ok) {
        alert("✅ " + data.message);
        setMemberData({
          id: "",
          name: "",
          age: "",
          address: "",
          phone: "",
        });
        navigate("/members");
      } else {
        alert("❌ " + (data.message || "Failed to add member"));
        if(res.status === 401) navigate("/");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("⚠️ Unable to connect to the server. Please try again later.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#F5E8E4] p-6">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-lg">
        {/* Back button */}
        <button
          onClick={() => navigate("/members")}
          className="mb-6 bg-[#4B0000] text-white px-4 py-2 rounded-lg hover:bg-[#3b0000] transition-all"
        >
          ←
        </button>

        <h2 className="text-2xl font-bold text-center text-[#4B0000] mb-6">
          👥 Add a New Member
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium mb-1">ID No</label>
            <input
              type="text"
              name="id"
              value={memberData.id}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#4B0000] focus:outline-none"
              placeholder="Enter member ID"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Name</label>
            <input
              type="text"
              name="name"
              value={memberData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#4B0000] focus:outline-none"
              placeholder="Enter member name"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Age</label>
            <input
              type="number"
              name="age"
              value={memberData.age}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#4B0000] focus:outline-none"
              placeholder="Enter age"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Address</label>
            <input
              type="text"
              name="address"
              value={memberData.address}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#4B0000] focus:outline-none"
              placeholder="Enter address"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Phone Number
            </label>
            <input
              type="text"
              name="phone"
              value={memberData.phone}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#4B0000] focus:outline-none"
              placeholder="Enter phone number"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#4B0000] text-white font-semibold py-2 rounded-lg hover:bg-[#5B0A0A] transition-all"
          >
            Add Member
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddMember;
