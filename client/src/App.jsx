// CampusCrib — Main App with Routing + AuthProvider
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleRoute from "./components/RoleRoute";
import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";
import Home from "./pages/Home/Home";
import Listings from "./pages/Listings/Listings";
import RoomDetail from "./pages/RoomDetail/RoomDetail";
import Login from "./pages/Auth/Login";
import Signup from "./pages/Auth/Signup";
import OwnerDashboard from "./pages/Dashboard/OwnerDashboard";
import AddListing from "./pages/Dashboard/AddListing";
import AdminDashboard from "./pages/Dashboard/AdminDashboard";
import MyBookings from "./pages/Student/MyBookings";
import Profile from "./pages/Student/Profile";
import "./index.css";

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="app">
          <Navbar />
          <main className="main-content">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/listings" element={<Listings />} />
              <Route path="/listings/:id" element={<RoomDetail />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              {/* Student / Any authenticated user Routes */}
              <Route path="/my-bookings" element={
                <ProtectedRoute>
                  <MyBookings />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />

              {/* Owner Routes */}
              <Route path="/owner/dashboard" element={
                <RoleRoute roles={["owner", "admin"]}>
                  <OwnerDashboard />
                </RoleRoute>
              } />
              <Route path="/owner/add-listing" element={
                <RoleRoute roles={["owner", "admin"]}>
                  <AddListing />
                </RoleRoute>
              } />

              {/* Admin Routes */}
              <Route path="/admin" element={
                <RoleRoute roles={["admin"]}>
                  <AdminDashboard />
                </RoleRoute>
              } />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
