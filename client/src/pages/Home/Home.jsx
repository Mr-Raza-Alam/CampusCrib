// Home page — landing page for CampusCrib
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { getListings } from "../../services/api";
import RoomCard from "../../components/RoomCard/RoomCard";
import "./Home.css";

const Home = () => {
    const [featuredListings, setFeaturedListings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFeatured = async () => {
            try {
                const res = await getListings();
                setFeaturedListings(res.data.listings.slice(0, 6));
            } catch (err) {
                console.error("Error fetching listings:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchFeatured();
    }, []);

    return (
        <div className="home">
            {/* Hero Section */}
            <section className="hero">
                <div className="hero-overlay"></div>
                <div className="hero-content">
                    <span className="hero-tag">Trusted by 1000+ Students</span>
                    <h1 className="hero-title">
                        Find Your Perfect <br />
                        <span className="hero-highlight">Room Near Campus</span>
                    </h1>
                    <p className="hero-desc">
                        Safe, verified, and affordable PGs, rooms, and apartments near your college. No more hassle.
                    </p>
                    <div className="hero-actions">
                        <Link to="/listings" className="btn btn-primary btn-lg">
                            Browse Rooms
                        </Link>
                        <Link to="/signup" className="btn btn-white btn-lg">
                            List Your Property
                        </Link>
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="stats-bar">
                <div className="stats-container">
                    <div className="stat-item">
                        <span className="stat-number">500+</span>
                        <span className="stat-label">Verified Rooms</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-number">50+</span>
                        <span className="stat-label">Colleges Covered</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-number">10K+</span>
                        <span className="stat-label">Happy Students</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-number">200+</span>
                        <span className="stat-label">Property Owners</span>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="section how-it-works">
                <div className="container">
                    <h2 className="section-title">How CampusCrib Works</h2>
                    <p className="section-subtitle">Finding accommodation near your college is now easier than ever</p>

                    <div className="steps-grid">
                        <div className="step-card">
                            <div className="step-number">1</div>
                            <h3>Search</h3>
                            <p>Enter your college name or location to discover nearby rooms, PGs, and apartments.</p>
                        </div>
                        <div className="step-card">
                            <div className="step-number">2</div>
                            <h3>Compare</h3>
                            <p>Filter by price, room type, amenities, and distance. Read verified reviews from students.</p>
                        </div>
                        <div className="step-card">
                            <div className="step-number">3</div>
                            <h3>Book</h3>
                            <p>Send a booking request directly to the owner. No middlemen, no commission.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Listings */}
            <section className="section featured-section">
                <div className="container">
                    <h2 className="section-title">Featured Rooms</h2>
                    <p className="section-subtitle">Handpicked accommodations verified by our team</p>

                    {loading ? (
                        <div className="spinner-wrapper">
                            <div className="spinner"></div>
                        </div>
                    ) : (
                        <div className="listings-grid">
                            {featuredListings.map((listing) => (
                                <RoomCard key={listing._id} listing={listing} />
                            ))}
                        </div>
                    )}

                    <div className="featured-cta">
                        <Link to="/listings" className="btn btn-outline">
                            View All Rooms
                        </Link>
                    </div>
                </div>
            </section>

            {/* Room Types */}
            <section className="section room-types-section">
                <div className="container">
                    <h2 className="section-title">Accommodation Types</h2>
                    <p className="section-subtitle">Choose what suits your needs and budget</p>

                    <div className="types-grid">
                        <div className="type-card">
                            <div className="type-icon">&#127968;</div>
                            <h3>Single Room</h3>
                            <p>Private space for focused studying</p>
                        </div>
                        <div className="type-card">
                            <div className="type-icon">&#128101;</div>
                            <h3>Shared Room</h3>
                            <p>Budget-friendly with roommates</p>
                        </div>
                        <div className="type-card">
                            <div className="type-icon">&#127969;</div>
                            <h3>PG (Paying Guest)</h3>
                            <p>Home-like stay with meals included</p>
                        </div>
                        <div className="type-card">
                            <div className="type-icon">&#127963;</div>
                            <h3>Apartment</h3>
                            <p>Independent living for seniors</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="cta-section">
                <div className="cta-content">
                    <h2>Own a property near a college?</h2>
                    <p>Register as a property owner and reach thousands of students looking for accommodation.</p>
                    <Link to="/signup" className="btn btn-white btn-lg">
                        Register as Owner
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default Home;
