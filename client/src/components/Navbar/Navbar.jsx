// Navbar component — shows auth state
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Navbar.css";

const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { currentUser, userProfile, logout } = useAuth();

    const isActive = (path) => location.pathname === path;

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
                    <span className="brand-icon">&#9978;</span>
                    <span className="brand-text">CampusCrib</span>
                </Link>

                <div className="navbar-links">
                    <Link to="/" className={`nav-link ${isActive("/") ? "active" : ""}`}>
                        Home
                    </Link>
                    <Link to="/listings" className={`nav-link ${isActive("/listings") ? "active" : ""}`}>
                        Browse Rooms
                    </Link>
                </div>

                <div className="navbar-actions">
                    {currentUser ? (
                        <>
                            <div className="nav-user">
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
            </div>
        </nav>
    );
};

export default Navbar;
