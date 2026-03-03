// Room Detail page — full listing view with reviews, amenities, owner info
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getListing, createBooking } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import "./RoomDetail.css";

const amenityLabels = {
    wifi: "WiFi", ac: "AC", food: "Meals Included", laundry: "Laundry",
    parking: "Parking", power_backup: "Power Backup", water: "24/7 Water",
    furnished: "Fully Furnished", gym: "Gym Access", security: "Security/CCTV",
};

const RoomDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [listing, setListing] = useState(null);
    const [loading, setLoading] = useState(true);
    const [bookingStatus, setBookingStatus] = useState(""); // "success" | "error" | ""

    useEffect(() => {
        const fetchListing = async () => {
            try {
                const res = await getListing(id);
                setListing(res.data.listing);
            } catch (err) {
                console.error("Error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchListing();
    }, [id]);

    if (loading) {
        return <div className="spinner-wrapper"><div className="spinner"></div></div>;
    }

    if (!listing) {
        return (
            <div className="not-found">
                <h2>Room not found</h2>
                <Link to="/listings" className="btn btn-primary">Back to Listings</Link>
            </div>
        );
    }

    const avgRating = listing.reviews?.length
        ? (listing.reviews.reduce((sum, r) => sum + r.rating, 0) / listing.reviews.length).toFixed(1)
        : null;

    return (
        <div className="room-detail">
            {/* Back Button */}
            <div className="detail-back-bar">
                <button className="back-btn" onClick={() => navigate(-1)}>
                    &#8592; Back
                </button>
            </div>

            {/* Hero Image */}
            <div className="detail-hero">
                <img
                    src={listing.image?.url || "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=1200"}
                    alt={listing.title}
                    className="detail-hero-img"
                />
                <div className="detail-hero-overlay">
                    <div className="container">
                        <span className="badge badge-green detail-type">{listing.roomType}</span>
                        <h1 className="detail-title">{listing.title}</h1>
                        <p className="detail-location">{listing.location}, {listing.country}</p>
                    </div>
                </div>
            </div>

            <div className="container detail-content">
                <div className="detail-grid">
                    {/* Left Column — Details */}
                    <div className="detail-main">
                        {/* Quick Stats */}
                        <div className="detail-stats">
                            <div className="stat-box">
                                <span className="stat-box-value">&#8377;{listing.price?.toLocaleString("en-IN")}</span>
                                <span className="stat-box-label">per month</span>
                            </div>
                            {listing.nearbyCollege && (
                                <div className="stat-box">
                                    <span className="stat-box-value">{listing.distanceFromCollege || "-"}</span>
                                    <span className="stat-box-label">from {listing.nearbyCollege}</span>
                                </div>
                            )}
                            <div className="stat-box">
                                <span className="stat-box-value">{listing.maxOccupancy}</span>
                                <span className="stat-box-label">Max Occupancy</span>
                            </div>
                            <div className="stat-box">
                                <span className="stat-box-value">{listing.availableRooms}</span>
                                <span className="stat-box-label">Available</span>
                            </div>
                        </div>

                        {/* Description */}
                        <section className="detail-section">
                            <h2>About This Room</h2>
                            <p className="detail-desc">{listing.description}</p>
                        </section>

                        {/* Amenities */}
                        {listing.amenities?.length > 0 && (
                            <section className="detail-section">
                                <h2>Amenities</h2>
                                <div className="amenities-grid">
                                    {listing.amenities.map((a) => (
                                        <div key={a} className="amenity-item">
                                            <span className="amenity-check">&#10003;</span>
                                            <span>{amenityLabels[a] || a}</span>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Reviews */}
                        <section className="detail-section">
                            <h2>
                                Reviews
                                {avgRating && <span className="avg-rating">{avgRating} / 5</span>}
                                <span className="review-count">({listing.reviews?.length || 0} reviews)</span>
                            </h2>

                            {listing.reviews?.length > 0 ? (
                                <div className="reviews-list">
                                    {listing.reviews.map((review) => (
                                        <div key={review._id} className="review-card">
                                            <div className="review-header">
                                                <div className="review-author">
                                                    <div className="review-avatar">
                                                        {review.author?.name?.charAt(0) || "U"}
                                                    </div>
                                                    <div>
                                                        <span className="review-name">{review.author?.name || "User"}</span>
                                                        <span className="review-date">
                                                            {new Date(review.createdAt).toLocaleDateString("en-IN", {
                                                                year: "numeric", month: "short", day: "numeric",
                                                            })}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="review-stars">
                                                    {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
                                                </div>
                                            </div>
                                            <p className="review-text">{review.comment}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="no-reviews">No reviews yet. Be the first to review!</p>
                            )}
                        </section>
                    </div>

                    {/* Right Column — Booking Sidebar */}
                    <div className="detail-sidebar">
                        <div className="booking-card">
                            <div className="booking-price">
                                <span className="booking-amount">&#8377;{listing.price?.toLocaleString("en-IN")}</span>
                                <span className="booking-period">/month</span>
                            </div>

                            <div className="booking-info">
                                <div className="booking-row">
                                    <span>Room Type</span>
                                    <strong>{listing.roomType}</strong>
                                </div>
                                <div className="booking-row">
                                    <span>Available Rooms</span>
                                    <strong>{listing.availableRooms}</strong>
                                </div>
                                <div className="booking-row">
                                    <span>Status</span>
                                    <strong className={listing.status === "available" ? "text-green" : "text-red"}>
                                        {listing.status}
                                    </strong>
                                </div>
                            </div>

                            {currentUser ? (
                                <>
                                    {bookingStatus === "success" ? (
                                        <div className="booking-success">Booking request sent successfully!</div>
                                    ) : (
                                        <button
                                            className="btn btn-primary btn-full"
                                            onClick={async () => {
                                                try {
                                                    await createBooking(listing._id, { message: "I am interested in this room." });
                                                    setBookingStatus("success");
                                                } catch (err) {
                                                    setBookingStatus("error");
                                                    alert(err.response?.data?.message || "Could not send booking request");
                                                }
                                            }}
                                        >
                                            Send Booking Request
                                        </button>
                                    )}
                                </>
                            ) : (
                                <>
                                    <Link to="/login" className="btn btn-primary btn-full">
                                        Login to Book
                                    </Link>
                                    <p className="booking-note">Login required to send a booking request</p>
                                </>
                            )}

                            {/* Owner Info */}
                            {listing.owner && (
                                <div className="owner-info">
                                    <h4>Listed by</h4>
                                    <div className="owner-row">
                                        <div className="owner-avatar">
                                            {listing.owner.name?.charAt(0) || "O"}
                                        </div>
                                        <div>
                                            <span className="owner-name">{listing.owner.name}</span>
                                            {listing.owner.businessName && (
                                                <span className="owner-business">{listing.owner.businessName}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RoomDetail;
