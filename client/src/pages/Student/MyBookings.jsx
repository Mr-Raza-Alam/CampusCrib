// My Bookings — student view with payment info after acceptance
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getMyBookings, confirmPayment, deleteBooking } from "../../services/api";
import "../Dashboard/Dashboard.css";
import "./Student.css";

const ruleLabels = {
    no_smoking: "No smoking on premises", no_alcohol: "No alcohol allowed",
    gate_closing: "Gate closes at 10:30 PM", no_guests_late: "No guests after 10 PM",
    cleanliness: "Maintain cleanliness in common areas", id_required: "Valid college ID required",
    noise_curfew: "No loud noise after 10 PM", no_pets: "No pets allowed",
    no_cooking: "No cooking in rooms", damage_charge: "Property damage charges apply",
};

const MyBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const res = await getMyBookings();
                setBookings(res.data.bookings || []);
            } catch (err) {
                console.error("Bookings error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchBookings();
    }, []);

    const handleDelete = async (bookingId) => {
        if (!window.confirm("Are you sure you want to cancel and delete this booking request?")) return;
        try {
            await deleteBooking(bookingId);
            setBookings((prev) => prev.filter((b) => b._id !== bookingId));
        } catch (err) {
            alert(err.response?.data?.error || "Failed to delete booking");
        }
    };

    const handleConfirmPayment = async (bookingId) => {
        if (!window.confirm("Are you sure you have made the security deposit payment?")) return;
        try {
            const res = await confirmPayment(bookingId);
            setBookings((prev) =>
                prev.map((b) => (b._id === bookingId ? { ...b, status: "payment_confirmed", paymentConfirmedAt: new Date() } : b))
            );
        } catch (err) {
            alert(err.response?.data?.error || "Failed to confirm payment");
        }
    };

    if (loading) {
        return <div className="spinner-wrapper"><div className="spinner"></div></div>;
    }

    const getStatusColor = (status) => {
        if (status === "accepted") return "#D97706";
        if (status === "payment_confirmed") return "#6366F1";
        if (status === "confirmed") return "#059669";
        if (status === "rejected") return "#DC2626";
        return "#9CA3AF";
    };

    const getStatusLabel = (status) => {
        if (status === "accepted") return "Accepted — Pay Deposit";
        if (status === "payment_confirmed") return "Payment Sent";
        if (status === "confirmed") return "Confirmed ✅";
        if (status === "rejected") return "Rejected";
        return "Pending";
    };

    return (
        <div className="dashboard">
            <div className="dashboard-container">
                <button className="back-btn" onClick={() => navigate("/listings")} style={{ marginBottom: "1.5rem" }}>
                    ← Back to Rooms
                </button>
                <div className="dash-header">
                    <div>
                        <h1 className="dash-title">My Bookings</h1>
                        <p className="dash-subtitle">Track all your room booking requests</p>
                    </div>
                </div>

                {bookings.length === 0 ? (
                    <div className="dash-section">
                        <div className="empty-state">
                            <p>You haven't made any booking requests yet.</p>
                            <Link to="/listings" className="btn btn-primary">Browse Rooms</Link>
                        </div>
                    </div>
                ) : (
                    <div className="bookings-grid">
                        {bookings.map((b) => (
                            <div key={b._id} className="student-booking-card">
                                <div className="sb-img-wrap">
                                    <img
                                        src={b.listing?.image?.url || "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=400"}
                                        alt={b.listing?.title || "Room"}
                                        className="sb-img"
                                    />
                                    <span className="sb-status" style={{ background: getStatusColor(b.status) }}>
                                        {getStatusLabel(b.status)}
                                    </span>
                                </div>
                                <div className="sb-body">
                                    <h3 className="sb-title">
                                        <Link to={`/listings/${b.listing?._id}`}>{b.listing?.title || "Room"}</Link>
                                    </h3>
                                    <p className="sb-location">{b.listing?.location}</p>
                                    <div className="sb-meta">
                                        <span className="sb-price">₹{b.listing?.price?.toLocaleString("en-IN")}/mo</span>
                                        <span className="sb-date">
                                            {new Date(b.createdAt).toLocaleDateString("en-IN", {
                                                year: "numeric", month: "short", day: "numeric",
                                            })}
                                        </span>
                                    </div>
                                    {b.message && <p className="sb-message">"{b.message}"</p>}

                                    {/* Accepted — Show payment info + rules */}
                                    {b.status === "accepted" && (
                                        <div className="sb-payment-section">
                                            <div className="sb-accepted-info">
                                                <h4>✅ Booking Accepted!</h4>
                                                <p>Please pay the security deposit within 24 hours to confirm your booking.</p>
                                            </div>

                                            {/* Property Rules */}
                                            {b.listing?.propertyRules?.length > 0 && (
                                                <div className="sb-rules-box">
                                                    <strong>📋 Property Rules:</strong>
                                                    <ul>
                                                        {b.listing.propertyRules.map((rule) => (
                                                            <li key={rule}>{ruleLabels[rule] || rule}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                            {b.listing?.customRules && (
                                                <p className="sb-custom-rules"><em>"{b.listing.customRules}"</em></p>
                                            )}

                                            {/* Deposit Info */}
                                            {b.listing?.securityDeposit > 0 && (
                                                <div className="sb-deposit-box">
                                                    <span>💰 Security Deposit: <strong>₹{b.listing.securityDeposit?.toLocaleString("en-IN")}</strong></span>
                                                    {b.listing?.refundPolicy && <span>📌 {b.listing.refundPolicy}</span>}
                                                </div>
                                            )}

                                            {/* Owner Payment Details */}
                                            {b.owner && (
                                                <div className="sb-owner-payment">
                                                    <strong>💳 Payment Details:</strong>
                                                    {b.owner.paymentInfo?.upiId && <p>UPI: <strong>{b.owner.paymentInfo.upiId}</strong></p>}
                                                    {b.owner.paymentInfo?.bankName && <p>Bank: {b.owner.paymentInfo.bankName}</p>}
                                                    {b.owner.paymentInfo?.accountNumber && <p>A/C: {b.owner.paymentInfo.accountNumber}</p>}
                                                    {b.owner.paymentInfo?.ifscCode && <p>IFSC: {b.owner.paymentInfo.ifscCode}</p>}
                                                    {b.owner.paymentInfo?.qrCodeImage && (
                                                        <img src={b.owner.paymentInfo.qrCodeImage} alt="QR Code" className="sb-qr-code" />
                                                    )}
                                                </div>
                                            )}

                                            {/* Owner Contact */}
                                            <div className="sb-owner-contact">
                                                <strong>📞 Owner Contact:</strong>
                                                {b.owner?.name && <p>{b.owner.name}</p>}
                                                {b.owner?.phone && <p>📞 {b.owner.phone}</p>}
                                                {b.owner?.email && <p>📧 {b.owner.email}</p>}
                                            </div>

                                            <button className="btn btn-primary btn-full" onClick={() => handleConfirmPayment(b._id)}>
                                                ✅ I Have Paid the Deposit
                                            </button>
                                        </div>
                                    )}

                                    {/* Payment Confirmed — Waiting for owner */}
                                    {b.status === "payment_confirmed" && (
                                        <div className="sb-accepted-info" style={{ background: "#EEF2FF", borderColor: "#C7D2FE" }}>
                                            <p style={{ color: "#4338CA" }}>💸 Payment confirmation sent! Waiting for owner to verify and confirm your booking.</p>
                                        </div>
                                    )}

                                    {/* Confirmed — Booking complete */}
                                    {b.status === "confirmed" && (
                                        <div className="sb-accepted-info">
                                            <h4>🎉 Booking Confirmed!</h4>
                                            <p>Your room is booked. Contact the owner for move-in details.</p>
                                            {b.owner?.phone && <p>📞 {b.owner.phone}</p>}
                                            {b.owner?.email && <p>📧 {b.owner.email}</p>}
                                        </div>
                                    )}

                                    {b.status === "rejected" && (
                                        <p className="sb-rejected">This request was declined by the owner.</p>
                                    )}

                                    {/* Delete/Cancel Button */}
                                    <button
                                        onClick={() => handleDelete(b._id)}
                                        style={{
                                            width: '100%', marginTop: '0.75rem', padding: '0.5rem',
                                            background: 'transparent', border: '1px solid #FCA5A5',
                                            color: '#DC2626', borderRadius: '4px', cursor: 'pointer',
                                            fontSize: '0.8rem', fontWeight: '500'
                                        }}
                                    >
                                        🗑️ Cancel / Delete Request
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyBookings;
