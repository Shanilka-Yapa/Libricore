import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import img1 from "../Images/loginpage.png";
import logo1 from "../Images/Logo.png";

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const res = await fetch("http://65.0.54.172:5000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: formData.email,
        password: formData.password,
      }),
    });

    const data = await res.json();

    if (res.ok) {
      alert("Login successful!");

      // ✅ Save token
      if (formData.rememberMe) {
        // Save in localStorage (persists even after closing browser)
        localStorage.setItem("token", data.token);
      } else {
        // Save in sessionStorage (clears when tab is closed)
        sessionStorage.setItem("token", data.token);
      }

      localStorage.setItem("userEmail", formData.email);

      navigate("/dashboard");
    } else {
      alert(data.message || "Login failed");
    }
  } catch (err) {
    alert("Error connecting to server");
  }
};



  return (
    <div className="flex items-center justify-center min-h-screen bg-[#D2B48C]">
      <div className="flex w-[900px] h-[520px] bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Left Side - Form */}
        <div className="w-1/2 flex flex-col justify-center px-10">
          <h2 className="text-2xl font-bold text-center mb-2 text-gray-800">
            Welcome back to Libricore
          </h2>
          <p className="text-sm text-gray-500 text-center mb-8">
            Log in to continue managing your library.
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
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#4B2E2B]"
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center space-x-2 text-gray-600">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="h-4 w-4 text-[#4B2E2B] border-gray-300 rounded"
                />
                <span>Remember me</span>
              </label>
            </div>

            <button
              type="submit"
              className="w-full bg-[#4B2E2B] text-white py-2 rounded-md hover:bg-[#3b231f] transition-all"
            >
              Log in
            </button>

            <div className="text-center text-gray-400 text-sm mt-4">OR</div>

            <p className="text-center text-sm text-gray-600">
              Don’t have an account?{" "}
              <Link to="/signup" className="text-blue-600 hover:underline">
                Sign up
              </Link>
            </p>
          </form>
        </div>

        {/* Right Side - Image */}
        <div className="w-1/2 relative">
          <img
            src={img1}
            alt="Login"
            className="w-full h-full object-cover"
          />
          <div className="absolute top-6 left-6 flex items-center space-x-2">
            <img src={logo1} alt="Libricore Logo" className="w-25 h-25" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
