// Footer component
import { Link } from "react-router-dom";
import "./Footer.css";

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-grid">
                    {/* Brand */}
                    <div className="footer-section">
                        <h3 className="footer-brand">CampusCrib</h3>
                        <p className="footer-desc">
                            Find safe, verified, and affordable accommodation near your college. Built for students, by students.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className="footer-section">
                        <h4 className="footer-heading">Quick Links</h4>
                        <Link to="/" className="footer-link">Home</Link>
                        <Link to="/listings" className="footer-link">Browse Rooms</Link>
                        <Link to="/signup" className="footer-link">Sign Up</Link>
                    </div>

                    {/* Room Types */}
                    <div className="footer-section">
                        <h4 className="footer-heading">Room Types</h4>
                        <span className="footer-link">Single Room</span>
                        <span className="footer-link">Shared Room</span>
                        <span className="footer-link">PG Accommodation</span>
                        <span className="footer-link">Apartments</span>
                    </div>

                    {/* Contact */}
                    <div className="footer-section">
                        <h4 className="footer-heading">Contact</h4>
                        <span className="footer-link">support@campuscrib.com</span>
                        <span className="footer-link">+91 7004091859</span>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>&copy; {new Date().getFullYear()} CampusCrib. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
