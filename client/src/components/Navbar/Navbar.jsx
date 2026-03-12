// Navbar component — shows auth state + mobile hamburger menu
import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Navbar.css";

const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { currentUser, userProfile, logout } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);

    const isActive = (path) => location.pathname === path;

    // Close menu on route change
    useEffect(() => {
        setMenuOpen(false);
    }, [location.pathname]);

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuOpen && menuRef.current && !menuRef.current.contains(e.target)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [menuOpen]);

    const handleLogout = async () => {
        try {
            await logout();
            navigate("/");
        } catch (err) {
            console.error("Logout error:", err);
        }
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-brand">
                    <img src="/Icon_CC.png" alt="CampusCrib" className="brand-logo" />
                    <span className="brand-text">CampusCrib</span>
                </Link>

                {/* Desktop Nav Links */}
                <div className="navbar-links">
                    <Link to="/" className={`nav-link ${isActive("/") ? "active" : ""}`}>
                        Home
                    </Link>
                    <Link to="/listings" className={`nav-link ${isActive("/listings") ? "active" : ""}`}>
                        Browse Rooms
                    </Link>
                </div>

                {/* Desktop Actions */}
                <div className="navbar-actions">
                    {currentUser ? (
                        <>
                            <div
                                className="nav-user"
                                onClick={() => navigate("/profile")}
                                style={{ cursor: "pointer" }}
                                title="My Profile"
                            >
                                <div className="nav-avatar">
                                    {currentUser.photoURL ? (
                                        <img src={currentUser.photoURL} alt="Profile" className="nav-avatar-img" />
                                    ) : (
                                        <span>{(currentUser.displayName || currentUser.email)?.charAt(0).toUpperCase()}</span>
                                    )}
                                </div>
                                <span className="nav-username">
                                    {currentUser.displayName || currentUser.email?.split("@")[0]}
                                </span>
                            </div>
                            {userProfile?.role === "student" && (
                                <Link to="/my-bookings" className={`nav-link ${isActive("/my-bookings") ? "active" : ""}`}>My Bookings</Link>
                            )}
                            {userProfile?.role === "owner" && (
                                <Link to="/owner/dashboard" className="nav-link nav-link-badge">Dashboard</Link>
                            )}
                            {userProfile?.role === "admin" && (
                                <Link to="/admin" className="nav-link nav-link-badge">Admin</Link>
                            )}
                            <button className="btn btn-outline btn-sm" onClick={handleLogout}>
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="btn btn-outline btn-sm">
                                Login
                            </Link>
                            <Link to="/signup" className="btn btn-primary btn-sm">
                                Sign Up
                            </Link>
                        </>
                    )}
                </div>

                {/* Hamburger Button (Mobile) */}
                <button
                    className={`hamburger ${menuOpen ? "open" : ""}`}
                    onClick={() => setMenuOpen(!menuOpen)}
                    aria-label="Toggle menu"
                >
                    <span className="hamburger-bar"></span>
                    <span className="hamburger-bar"></span>
                    <span className="hamburger-bar"></span>
                </button>
            </div>

            {/* Mobile Drawer */}
            {menuOpen && <div className="mobile-backdrop" onClick={() => setMenuOpen(false)} />}
            <div className={`mobile-drawer ${menuOpen ? "open" : ""}`} ref={menuRef}>
                <div className="mobile-drawer-links">
                    <Link to="/" className={`mobile-link ${isActive("/") ? "active" : ""}`}>Home</Link>
                    <Link to="/listings" className={`mobile-link ${isActive("/listings") ? "active" : ""}`}>Browse Rooms</Link>

                    {currentUser && (
                        <>
                            <div className="mobile-divider" />
                            <Link to="/profile" className={`mobile-link ${isActive("/profile") ? "active" : ""}`}>My Profile</Link>
                            {userProfile?.role === "student" && (
                                <Link to="/my-bookings" className={`mobile-link ${isActive("/my-bookings") ? "active" : ""}`}>My Bookings</Link>
                            )}
                            {userProfile?.role === "owner" && (
                                <Link to="/owner/dashboard" className={`mobile-link ${isActive("/owner/dashboard") ? "active" : ""}`}>Owner Dashboard</Link>
                            )}
                            {userProfile?.role === "admin" && (
                                <Link to="/admin" className={`mobile-link ${isActive("/admin") ? "active" : ""}`}>Admin Panel</Link>
                            )}
                        </>
                    )}
                </div>

                <div className="mobile-drawer-actions">
                    {currentUser ? (
                        <>
                            <div className="mobile-user-info">
                                <div className="nav-avatar">
                                    {currentUser.photoURL ? (
                                        <img src={currentUser.photoURL} alt="Profile" className="nav-avatar-img" />
                                    ) : (
                                        <span>{(currentUser.displayName || currentUser.email)?.charAt(0).toUpperCase()}</span>
                                    )}
                                </div>
                                <span>{currentUser.displayName || currentUser.email?.split("@")[0]}</span>
                            </div>
                            <button className="btn btn-outline mobile-btn" onClick={handleLogout}>Logout</button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="btn btn-outline mobile-btn">Login</Link>
                            <Link to="/signup" className="btn btn-primary mobile-btn">Sign Up</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
