// Owner Dashboard — manage listings, bookings, and overview
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getMyListings, getMyBookings, respondToBooking, deleteBooking } from "../../services/api";
import "./Dashboard.css";

const OwnerDashboard = () => {
    const { userProfile } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("overview");
    const [listings, setListings] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    const isVerified = userProfile?.isVerified === true;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [listingsRes, bookingsRes] = await Promise.all([
                    getMyListings(),
                    getMyBookings(),
                ]);
                setListings(listingsRes.data.listings || []);
                setBookings(bookingsRes.data.bookings || []);
            } catch (err) {
                console.error("Dashboard fetch error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this listing?")) return;
        try {
            await deleteListing(id);
            setListings((prev) => prev.filter((l) => l._id !== id));
        } catch (err) {
            alert("Failed to delete listing");
        }
    };

    const handleBookingRespond = async (bookingId, status) => {
        try {
            await respondToBooking(bookingId, status);
            setBookings((prev) =>
                prev.map((b) => (b._id === bookingId ? { ...b, status } : b))
            );
        } catch (err) {
            alert(err.response?.data?.error || "Failed to update booking status");
        }
    };

    const handleDeleteBooking = async (bookingId) => {
        if (!window.confirm("Are you sure you want to delete this booking request? This action cannot be undone.")) return;
        try {
            await deleteBooking(bookingId);
            setBookings(bookings.filter((b) => b._id !== bookingId));
        } catch (err) {
            alert(err.response?.data?.error || "Failed to delete booking");
        }
    };

    if (loading) {
        return <div className="spinner-wrapper"><div className="spinner"></div></div>;
    }

    const pendingBookings = bookings.filter((b) => b.status === "pending");
    const totalRevenue = listings.reduce((sum, l) => sum + (l.price || 0), 0);

    return (
        <div className="dashboard">
            <div className="dashboard-container">
                {/* Verification Banner */}
                {!isVerified && (
                    <div className="verification-banner pending">
                        <div className="verification-banner-icon">⏳</div>
                        <div className="verification-banner-body">
                            <h3>Account Pending Verification</h3>
                            <p>Your owner account is being reviewed by our admin team. Once verified, you'll be able to create listings and manage bookings.</p>
                        </div>
                    </div>
                )}

                {isVerified && (
                    <div className="verification-banner verified">
                        <div className="verification-banner-icon">✅</div>
                        <div className="verification-banner-body">
                            <h3>Verified Owner</h3>
                            <p>Your account is verified. You have full access to all owner features.</p>
                        </div>
                    </div>
                )}

                {/* Header */}
                <div className="dash-header">
                    <div>
                        <h1 className="dash-title">Owner Dashboard</h1>
                        <p className="dash-subtitle">Welcome back, {userProfile?.name || "Owner"}!</p>
                    </div>
                    {isVerified ? (
                        <Link to="/owner/add-listing" className="btn btn-primary">
                            + Add New Listing
                        </Link>
                    ) : (
                        <button className="btn btn-primary" disabled style={{ opacity: 0.5, cursor: "not-allowed" }}>
                            + Add New Listing
                        </button>
                    )}
                </div>

                {/* Payment Info Reminder */}
                {isVerified && !userProfile?.paymentInfo?.upiId && !userProfile?.paymentInfo?.bankName && (
                    <div className="verification-banner pending" style={{ marginBottom: "1rem" }}>
                        <div className="verification-banner-icon">💳</div>
                        <div className="verification-banner-body">
                            <h3>Set Up Payment Info</h3>
                            <p>Add your UPI ID or bank details in your <Link to="/profile" style={{ fontWeight: 700 }}>Profile</Link> so students can pay security deposits.</p>
                        </div>
                    </div>
                )}

                {/* Tabs */}
                <div className="dash-tabs">
                    {["overview", "listings", "bookings"].map((tab) => (
                        <button
                            key={tab}
                            className={`dash-tab ${activeTab === tab ? "active" : ""}`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            {tab === "bookings" && pendingBookings.length > 0 && (
                                <span className="tab-badge">{pendingBookings.length}</span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Overview Tab */}
                {activeTab === "overview" && (
                    <div className="dash-overview">
                        <div className="stat-cards">
                            <div className="dash-stat-card">
                                <span className="dash-stat-icon">🏠</span>
                                <div>
                                    <span className="dash-stat-value">{listings.length}</span>
                                    <span className="dash-stat-label">Total Listings</span>
                                </div>
                            </div>
                            <div className="dash-stat-card">
                                <span className="dash-stat-icon">📋</span>
                                <div>
                                    <span className="dash-stat-value">{bookings.length}</span>
                                    <span className="dash-stat-label">Total Bookings</span>
                                </div>
                            </div>
                            <div className="dash-stat-card">
                                <span className="dash-stat-icon">⏳</span>
                                <div>
                                    <span className="dash-stat-value">{pendingBookings.length}</span>
                                    <span className="dash-stat-label">Pending Requests</span>
                                </div>
                            </div>
                            <div className="dash-stat-card">
                                <span className="dash-stat-icon">💰</span>
                                <div>
                                    <span className="dash-stat-value">₹{totalRevenue.toLocaleString("en-IN")}</span>
                                    <span className="dash-stat-label">Listing Value</span>
                                </div>
                            </div>
                        </div>

                        {/* Recent Bookings */}
                        {pendingBookings.length > 0 && (
                            <div className="dash-section">
                                <h3>Pending Booking Requests</h3>
                                <div className="booking-list">
                                    {pendingBookings.slice(0, 5).map((b) => (
                                        <div key={b._id} className="booking-item">
                                            <div className="booking-item-info">
                                                <strong>{b.student?.name || "Student"}</strong>
                                                <span>wants to book <em>{b.listing?.title || "a room"}</em></span>
                                                {b.message && <p className="booking-msg">{b.message}</p>}
                                            </div>
                                            <div className="booking-actions">
                                                <button className="btn-sm btn-accept" onClick={() => handleBookingRespond(b._id, "accepted")}>Accept</button>
                                                <button className="btn-sm btn-reject" onClick={() => handleBookingRespond(b._id, "rejected")}>Reject</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Listings Tab */}
                {activeTab === "listings" && (
                    <div className="dash-section">
                        <div className="dash-section-header">
                            <h3>My Listings ({listings.length})</h3>
                            {isVerified ? (
                                <Link to="/owner/add-listing" className="btn btn-primary btn-sm-pad">+ Add New</Link>
                            ) : (
                                <span className="btn btn-primary btn-sm-pad" style={{ opacity: 0.5, cursor: "not-allowed" }}>+ Add New</span>
                            )}
                        </div>
                        {listings.length === 0 ? (
                            <div className="empty-state">
                                <p>{isVerified ? "You haven't added any listings yet." : "Get verified to start adding listings."}</p>
                                {isVerified && (
                                    <Link to="/owner/add-listing" className="btn btn-primary">Add Your First Listing</Link>
                                )}
                            </div>
                        ) : (
                            <div className="my-listings-grid">
                                {listings.map((listing) => (
                                    <div key={listing._id} className="my-listing-card">
                                        <img
                                            src={listing.image?.url || "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=400"}
                                            alt={listing.title}
                                            className="my-listing-img"
                                        />
                                        <div className="my-listing-body">
                                            <h4 className="my-listing-title">{listing.title}</h4>
                                            <p className="my-listing-loc">{listing.location}</p>
                                            <div className="my-listing-meta">
                                                <span className="my-listing-price">₹{listing.price?.toLocaleString("en-IN")}/mo</span>
                                                <span className={`approval-badge ${listing.approvalStatus}`}>
                                                    {listing.approvalStatus}
                                                </span>
                                            </div>
                                            <div className="my-listing-actions">
                                                <Link to={`/listings/${listing._id}`} className="btn-sm btn-view">View</Link>
                                                <button className="btn-sm btn-delete" onClick={() => handleDelete(listing._id)}>Delete</button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Bookings Tab */}
                {activeTab === "bookings" && (
                    <div className="dash-section">
                        <h3>Booking Requests ({bookings.length})</h3>
                        {bookings.length === 0 ? (
                            <div className="empty-state">
                                <p>No booking requests yet.</p>
                            </div>
                        ) : (
                            <div className="booking-list">
                                {bookings.map((b) => (
                                    <div key={b._id} className={`booking-item status-${b.status}`}>
                                        <div className="booking-item-info">
                                            <div className="booking-item-top">
                                                <strong>{b.student?.name || "Student"}</strong>
                                                <span className={`status-badge ${b.status}`}>
                                                    {b.status === "payment_confirmed" ? "💸 Payment Sent" : b.status}
                                                </span>
                                            </div>
                                            <span className="booking-item-room">
                                                Room: <Link to={`/listings/${b.listing?._id}`}>{b.listing?.title || "Unknown"}</Link>
                                            </span>
                                            {b.student?.email && <span className="booking-contact">📧 {b.student.email}</span>}
                                            {b.student?.phone && <span className="booking-contact">📞 {b.student.phone}</span>}
                                            {b.message && <p className="booking-msg">"{b.message}"</p>}
                                            <span className="booking-date">
                                                {new Date(b.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })}
                                            </span>
                                        </div>
                                        {b.status === "pending" && (
                                            <div className="booking-actions">
                                                <button className="btn-sm btn-accept" onClick={() => handleBookingRespond(b._id, "accepted")}>Accept</button>
                                                <button className="btn-sm btn-reject" onClick={() => handleBookingRespond(b._id, "rejected")}>Reject</button>
                                            </div>
                                        )}
                                        {b.status === "payment_confirmed" && (
                                            <div className="booking-actions">
                                                <p style={{ fontSize: "0.75rem", color: "#4338CA", marginBottom: "0.3rem" }}>
                                                    Student says they've paid. Verify and confirm.
                                                </p>
                                                <button className="btn-sm btn-accept" onClick={() => handleBookingRespond(b._id, "confirmed")}>
                                                    ✅ Confirm Booking
                                                </button>
                                            </div>
                                        )}
                                        {b.status === "confirmed" && (
                                            <div style={{ fontSize: "0.75rem", color: "#059669", fontWeight: 600, padding: "0.3rem 0" }}>
                                                ✅ Booking confirmed
                                            </div>
                                        )}

                                        {/* Delete Option for Owner */}
                                        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "0.5rem" }}>
                                            <button
                                                onClick={() => handleDeleteBooking(b._id)}
                                                style={{
                                                    padding: '0.3rem 0.6rem', background: 'transparent',
                                                    border: '1px solid #FCA5A5', color: '#DC2626',
                                                    borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem',
                                                    fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.3rem'
                                                }}
                                            >
                                                🗑️ Delete Record
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default OwnerDashboard;
