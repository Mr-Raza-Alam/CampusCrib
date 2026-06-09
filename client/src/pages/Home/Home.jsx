// Home page — landing page for CampusCrib
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getListings } from "../../services/api";
import RoomCard from "../../components/RoomCard/RoomCard";
import "./Home.css";

const Home = () => {
    const navigate = useNavigate();
    const [featuredListings, setFeaturedListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [collegeName, setCollegeName] = useState("");

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

    const handleSearch = (e) => {
        e.preventDefault();
        if (collegeName.trim()) {
            navigate(`/listings?search=${encodeURIComponent(collegeName.trim())}`);
        } else {
            navigate("/listings");
        }
    };

    // Get a preview listing for the floating card
    const previewListing = featuredListings[0];

    return (
        <div className="home">
            {/* Hero Section — Two Column Layout */}
            <section className="hero">
                <div className="hero-container container">
                    {/* Left Column */}
                    <div className="hero-left">
                        <div className="hero-social-proof">
                            <span className="proof-dot proof-dot-red"></span>
                            <span className="proof-dot proof-dot-yellow"></span>
                            <span className="proof-dot proof-dot-green"></span>
                            <span className="proof-dot proof-dot-blue"></span>
                            <span className="proof-text">1,000+ students found their home</span>
                        </div>

                        <h1 className="hero-title">
                            Find rooms students<br />
                            <span className="hero-highlight">actually love</span>
                        </h1>

                        <p className="hero-desc">
                            Verified PGs & apartments near your campus. Real reviews, real prices.
                        </p>

                        <form className="hero-search" onSubmit={handleSearch}>
                            <div className="hero-search-input-wrap">
                                <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                    <circle cx="12" cy="10" r="3"></circle>
                                </svg>
                                <input
                                    type="text"
                                    className="hero-search-input"
                                    placeholder="Enter your college name..."
                                    value={collegeName}
                                    onChange={(e) => setCollegeName(e.target.value)}
                                />
                            </div>
                            <button type="submit" className="btn btn-accent hero-search-btn">
                                Find Rooms
                            </button>
                        </form>

                        <div className="hero-stats">
                            <div className="hero-stat">
                                <span className="hero-stat-number">500+</span>
                                <span className="hero-stat-label">Rooms</span>
                            </div>
                            <div className="hero-stat">
                                <span className="hero-stat-number">10K+</span>
                                <span className="hero-stat-label">Students</span>
                            </div>
                            <div className="hero-stat">
                                <span className="hero-stat-number">50+</span>
                                <span className="hero-stat-label">Colleges</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Column — Floating Preview Card */}
                    <div className="hero-right">
                        <div className="hero-preview-card">
                            {previewListing ? (
                                <>
                                    <div className="preview-header">
                                        <span className="preview-rating">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="#F59E0B" stroke="none">
                                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                                            </svg>
                                            4.8 · Verified
                                        </span>
                                        <button className="preview-heart" aria-label="Favorite">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                                            </svg>
                                        </button>
                                    </div>
                                    <div className="preview-image-wrap">
                                        <img
                                            src={previewListing.images?.[0]?.url || previewListing.image?.url || "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=400"}
                                            alt={previewListing.title}
                                            className="preview-image"
                                        />
                                    </div>
                                    <div className="preview-body">
                                        <h3 className="preview-title">{previewListing.title}</h3>
                                        <p className="preview-meta">
                                            {previewListing.nearbyCollege && `${previewListing.nearbyCollege}`}
                                            {previewListing.distanceFromCollege && ` · ${previewListing.distanceFromCollege}`}
                                            {previewListing.amenities?.includes("ac") && " · AC"}
                                            {previewListing.amenities?.includes("wifi") && " + WiFi"}
                                        </p>
                                        <div className="preview-footer">
                                            <span className="preview-price">
                                                ₹{previewListing.price?.toLocaleString("en-IN")}<small>/mo</small>
                                            </span>
                                            <Link to={`/listings/${previewListing._id}`} className="btn btn-accent btn-sm preview-view-btn">
                                                View
                                            </Link>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="preview-skeleton">
                                    <div className="skeleton-header"></div>
                                    <div className="skeleton-image"></div>
                                    <div className="skeleton-text"></div>
                                    <div className="skeleton-text short"></div>
                                </div>
                            )}
                        </div>

                        {/* Trust Badge */}
                        <div className="hero-trust-badge">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--navy-500)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                <polyline points="22 4 12 14.01 9 11.01"></polyline>
                            </svg>
                            <div className="trust-text">
                                <strong>All rooms verified</strong>
                                <span>In-person visits by our team</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="section how-it-works" id="how-it-works">
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
