import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import img1 from "../Images/signuppage1.png";
import logo1 from "../Images/Logo.png";

const Signup = () => {
  const API_BASE = import.meta.env.VITE_API_URL || "http://65.0.31.24:5000";
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  if (formData.password !== formData.confirmPassword) {
    alert("Passwords do not match!");
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: formData.email,
        password: formData.password,
      }),
    });

    const data = await res.json();

    if (res.ok) {
      alert("Signup successful!");
      navigate("/");
    } else {
      alert(data.message || "Signup failed");
    }
  } catch (err) {
    alert("Error connecting to server");
  }
};


  return (
    <div className="flex items-center justify-center min-h-screen bg-[#D2B48C]">
      <div className="flex w-[900px] h-[520px] bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Left Side - Image */}
        <div className="w-1/2 relative">
          <img
            src={img1}
            alt="Library"
            className="w-full h-full object-cover"
          />
          <div className="absolute top-6 left-6 flex items-center space-x-2">
            <img src={logo1} alt="Libricore Logo" className="w-25 h-25" />
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-1/2 flex flex-col justify-center px-10">
          <h2 className="text-2xl font-bold text-center mb-2 text-gray-800">
            Create your Libricore account
          </h2>
          <p className="text-sm text-gray-500 text-center mb-8">
            Start managing your library effortlessly.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#4B2E2B]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600">
                Password
              </label>
              <div className="relative w-full mt-1">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#4B2E2B]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 px-3 flex items-center text-sm text-gray-600"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="w-full mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#4B2E2B]"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#4B2E2B] text-white py-2 rounded-md hover:bg-[#3b231f] transition-all"
            >
              Sign up
            </button>

            <div className="text-center text-gray-400 text-sm mt-4">OR</div>

            <p className="text-center text-sm text-gray-600">
              Already have an account?{" "}
              <Link to="/" className="text-blue-600 hover:underline">
                Log in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;
