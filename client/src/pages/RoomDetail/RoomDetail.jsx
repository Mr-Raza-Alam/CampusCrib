// Room Detail page — full listing view with reviews, amenities, owner info, and map
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getListing, createBooking, addReview } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import MapView from "../../components/MapView/MapView";
import "./RoomDetail.css";
import "../Student/Student.css";

const amenityLabels = {
    wifi: "WiFi", ac: "AC", food: "Meals Included", laundry: "Laundry",
    parking: "Parking", power_backup: "Power Backup", water: "24/7 Water",
    furnished: "Fully Furnished", gym: "Gym Access", security: "Security/CCTV",
};

const ruleLabels = {
    no_smoking: "No smoking on premises", no_alcohol: "No alcohol allowed",
    gate_closing: "Gate closes at 10:30 PM", no_guests_late: "No guests after 10 PM",
    cleanliness: "Maintain cleanliness in common areas", id_required: "Valid college ID required",
    noise_curfew: "No loud noise after 10 PM", no_pets: "No pets allowed",
    no_cooking: "No cooking in rooms", damage_charge: "Property damage charges apply",
};

const RoomDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { currentUser, userProfile } = useAuth();
    const [listing, setListing] = useState(null);
    const [loading, setLoading] = useState(true);
    const [bookingStatus, setBookingStatus] = useState("");
    // Review form state
    const [reviewRating, setReviewRating] = useState(0);
    const [reviewComment, setReviewComment] = useState("");
    const [reviewSubmitting, setReviewSubmitting] = useState(false);
    const [reviewMessage, setReviewMessage] = useState("");

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

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (reviewRating === 0) return setReviewMessage("Please select a star rating.");
        if (reviewComment.length < 3) return setReviewMessage("Review must be at least 3 characters.");

        setReviewSubmitting(true);
        setReviewMessage("");
        try {
            const res = await addReview(id, { rating: reviewRating, comment: reviewComment });
            // Add new review to listing immediately
            setListing((prev) => ({
                ...prev,
                reviews: [...(prev.reviews || []), res.data.review],
            }));
            setReviewRating(0);
            setReviewComment("");
            setReviewMessage("Review submitted!");
        } catch (err) {
            setReviewMessage(err.response?.data?.error || "Failed to submit review.");
        } finally {
            setReviewSubmitting(false);
        }
    };

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

            <div className="detail-content">
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

                        {/* Property Rules & Security Deposit */}
                        {(listing.propertyRules?.length > 0 || listing.customRules || listing.securityDeposit > 0) && (
                            <section className="detail-section rules-deposit-section">
                                <h2>📋 Property Rules & Deposit</h2>

                                {listing.propertyRules?.length > 0 && (
                                    <div className="rules-list">
                                        {listing.propertyRules.map((rule) => (
                                            <div key={rule} className="rule-item">
                                                <span className="rule-dot">•</span>
                                                <span>{ruleLabels[rule] || rule}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {listing.customRules && (
                                    <div className="custom-rules-box">
                                        <strong>Additional Rules:</strong>
                                        <p>{listing.customRules}</p>
                                    </div>
                                )}

                                <div className="deposit-info-grid">
                                    {listing.securityDeposit > 0 && (
                                        <div className="deposit-info-card">
                                            <span className="deposit-icon">💰</span>
                                            <div>
                                                <strong>Security Deposit</strong>
                                                <span>₹{listing.securityDeposit?.toLocaleString("en-IN")}</span>
                                            </div>
                                        </div>
                                    )}
                                    {listing.refundPolicy && listing.refundPolicy !== "No refund policy specified" && (
                                        <div className="deposit-info-card">
                                            <span className="deposit-icon">📌</span>
                                            <div>
                                                <strong>Refund Policy</strong>
                                                <span>{listing.refundPolicy}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </section>
                        )}

                        {/* Location Map */}
                        {listing.geometry?.coordinates && (
                            <section className="detail-section">
                                <h2>📍 Location</h2>
                                <MapView
                                    listings={[listing]}
                                    center={listing.geometry.coordinates}
                                    zoom={14}
                                    singleMarker={true}
                                />
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

                            {/* Review Form — logged in users only */}
                            {currentUser && userProfile?.role === "student" && (
                                <div className="review-form-section">
                                    <h3>Write a Review</h3>
                                    {reviewMessage && (
                                        <div className={reviewMessage.includes("submitted") ? "form-success" : "form-error"}>
                                            {reviewMessage}
                                        </div>
                                    )}
                                    <form onSubmit={handleReviewSubmit}>
                                        <div className="star-input">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    className={`star-btn ${star <= reviewRating ? "filled" : ""}`}
                                                    onClick={() => setReviewRating(star)}
                                                >
                                                    ★
                                                </button>
                                            ))}
                                        </div>
                                        <textarea
                                            className="review-textarea"
                                            placeholder="Share your experience about this room..."
                                            value={reviewComment}
                                            onChange={(e) => setReviewComment(e.target.value)}
                                        />
                                        <div className="review-submit-row">
                                            <button type="submit" className="btn btn-primary" disabled={reviewSubmitting}>
                                                {reviewSubmitting ? "Submitting..." : "Submit Review"}
                                            </button>
                                        </div>
                                    </form>
                                </div>
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
                                        <div className="booking-success">✅ Booking request sent! The owner will respond soon.</div>
                                    ) : (
                                        <form onSubmit={async (e) => {
                                            e.preventDefault();
                                            try {
                                                const formData = new FormData(e.target);
                                                await createBooking(listing._id, {
                                                    message: formData.get("message") || "I am interested in this room.",
                                                    contactPhone: formData.get("contactPhone") || "",
                                                });
                                                setBookingStatus("success");
                                            } catch (err) {
                                                const errMsg = err.response?.data?.error || err.response?.data?.details?.join(", ") || "Could not send booking request";
                                                alert(errMsg);
                                            }
                                        }}>
                                            <div style={{ marginBottom: "0.75rem" }}>
                                                <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--gray-700)", display: "block", marginBottom: "0.3rem" }}>
                                                    Message to Owner
                                                </label>
                                                <textarea
                                                    name="message"
                                                    placeholder="Hi, I am interested in this room..."
                                                    defaultValue="I am interested in this room."
                                                    style={{
                                                        width: "100%", padding: "0.5rem", borderRadius: "8px",
                                                        border: "1px solid var(--gray-200)", fontFamily: "var(--font-family)",
                                                        fontSize: "0.85rem", resize: "vertical", minHeight: "60px", boxSizing: "border-box",
                                                    }}
                                                />
                                            </div>
                                            <div style={{ marginBottom: "0.75rem" }}>
                                                <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--gray-700)", display: "block", marginBottom: "0.3rem" }}>
                                                    Phone (optional)
                                                </label>
                                                <input
                                                    name="contactPhone"
                                                    type="tel"
                                                    placeholder="10‑digit mobile"
                                                    style={{
                                                        width: "100%", padding: "0.5rem", borderRadius: "8px",
                                                        border: "1px solid var(--gray-200)", fontFamily: "var(--font-family)",
                                                        fontSize: "0.85rem", boxSizing: "border-box",
                                                    }}
                                                />
                                            </div>
                                            <button type="submit" className="btn btn-primary btn-full">
                                                Send Booking Request
                                            </button>
                                        </form>
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
