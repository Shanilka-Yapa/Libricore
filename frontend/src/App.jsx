import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

import Login from "./Components/login.jsx";
import Signup from "./Components/signup.jsx";
import Dashboard from "./Components/dashboard.jsx";
import Addbook from "./Components/addbook.jsx";
import ViewBooks from "./Components/viewbooks.jsx";
import Members from "./Components/members.jsx";
import AddMember from "./Components/addmember.jsx";
import ManageBooks from "./Components/managebooks.jsx";
import Overdue from "./Components/overdue.jsx";
import Footer from "./Components/Footer";


function App() {
  const [count, setCount] = useState(0);

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-book"
          element={
            <ProtectedRoute>
              <Addbook />
            </ProtectedRoute>
          }
        />
        <Route
          path="/view-books"
          element={
            <ProtectedRoute>
              <ViewBooks />
            </ProtectedRoute>
          }
        />
        <Route
          path="/members"
          element={
            <ProtectedRoute>
              <Members />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-member"
          element={
            <ProtectedRoute>
              <AddMember />
            </ProtectedRoute>
          }
        />
        <Route
          path="/loans"
          element={
            <ProtectedRoute>
              <ManageBooks />
            </ProtectedRoute>
          }
        />
        <Route
          path="/overdue"
          element={
            <ProtectedRoute>
              <Overdue />
            </ProtectedRoute>
          }
        />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
