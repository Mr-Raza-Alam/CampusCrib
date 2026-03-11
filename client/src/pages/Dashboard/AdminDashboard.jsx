// Admin Dashboard — manage users, listings, reviews
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
    getAdminStats,
    getAdminUsers,
    verifyOwner,
    getAdminListings,
    approveListing,
    adminDeleteListing,
    adminDeleteReview,
} from "../../services/api";
import "./Dashboard.css";

const AdminDashboard = () => {
    const { userProfile } = useAuth();
    const [activeTab, setActiveTab] = useState("overview");
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userFilter, setUserFilter] = useState("");
    const [userSearch, setUserSearch] = useState("");
    const [listingFilter, setListingFilter] = useState("");

    // Fetch stats on mount
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await getAdminStats();
                setStats(res.data.stats);
            } catch (err) {
                console.error("Stats error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    // Fetch users when tab opens
    useEffect(() => {
        if (activeTab === "users") fetchUsers();
        if (activeTab === "listings") fetchListings();
    }, [activeTab, userFilter, listingFilter]);

    const fetchUsers = async () => {
        try {
            const params = {};
            if (userFilter) params.role = userFilter;
            if (userSearch) params.search = userSearch;
            const res = await getAdminUsers(params);
            setUsers(res.data.users || []);
        } catch (err) {
            console.error("Fetch users error:", err);
        }
    };

    const fetchListings = async () => {
        try {
            const params = {};
            if (listingFilter) params.approvalStatus = listingFilter;
            const res = await getAdminListings(params);
            setListings(res.data.listings || []);
        } catch (err) {
            console.error("Fetch listings error:", err);
        }
    };

    const handleVerifyOwner = async (userId, status) => {
        try {
            await verifyOwner(userId, status);
            setUsers((prev) =>
                prev.map((u) =>
                    u._id === userId
                        ? { ...u, verificationStatus: status, isVerified: status === "approved" }
                        : u
                )
            );
        } catch (err) {
            alert("Failed to update owner status");
        }
    };

    const handleApproveListing = async (listingId, status) => {
        try {
            await approveListing(listingId, status);
            setListings((prev) =>
                prev.map((l) =>
                    l._id === listingId ? { ...l, approvalStatus: status } : l
                )
            );
        } catch (err) {
            alert("Failed to update listing");
        }
    };

    const handleDeleteListing = async (listingId) => {
        if (!window.confirm("Delete this listing permanently?")) return;
        try {
            await adminDeleteListing(listingId);
            setListings((prev) => prev.filter((l) => l._id !== listingId));
        } catch (err) {
            alert("Failed to delete listing");
        }
    };

    if (loading) {
        return <div className="spinner-wrapper"><div className="spinner"></div></div>;
    }

    return (
        <div className="dashboard">
            <div className="dashboard-container">
                {/* Header */}
                <div className="dash-header">
                    <div>
                        <h1 className="dash-title">Admin Panel</h1>
                        <p className="dash-subtitle">Manage CampusCrib platform</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="dash-tabs">
                    {["overview", "users", "listings"].map((tab) => (
                        <button
                            key={tab}
                            className={`dash-tab ${activeTab === tab ? "active" : ""}`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            {tab === "listings" && stats?.pendingListings > 0 && (
                                <span className="tab-badge">{stats.pendingListings}</span>
                            )}
                            {tab === "users" && stats?.pendingOwners > 0 && (
                                <span className="tab-badge">{stats.pendingOwners}</span>
                            )}
                        </button>
                    ))}
                </div>

                {/* ───── Overview Tab ───── */}
                {activeTab === "overview" && stats && (
                    <div className="dash-overview">
                        <div className="stat-cards">
                            <div className="dash-stat-card">
                                <span className="dash-stat-icon">👥</span>
                                <div>
                                    <span className="dash-stat-value">{stats.totalUsers}</span>
                                    <span className="dash-stat-label">Total Users</span>
                                </div>
                            </div>
                            <div className="dash-stat-card">
                                <span className="dash-stat-icon">🏠</span>
                                <div>
                                    <span className="dash-stat-value">{stats.totalOwners}</span>
                                    <span className="dash-stat-label">Owners</span>
                                </div>
                            </div>
                            <div className="dash-stat-card">
                                <span className="dash-stat-icon">🎓</span>
                                <div>
                                    <span className="dash-stat-value">{stats.totalStudents}</span>
                                    <span className="dash-stat-label">Students</span>
                                </div>
                            </div>
                            <div className="dash-stat-card">
                                <span className="dash-stat-icon">📋</span>
                                <div>
                                    <span className="dash-stat-value">{stats.totalListings}</span>
                                    <span className="dash-stat-label">Total Listings</span>
                                </div>
                            </div>
                        </div>
                        <div className="stat-cards">
                            <div className="dash-stat-card">
                                <span className="dash-stat-icon">⏳</span>
                                <div>
                                    <span className="dash-stat-value">{stats.pendingListings}</span>
                                    <span className="dash-stat-label">Pending Listings</span>
                                </div>
                            </div>
                            <div className="dash-stat-card">
                                <span className="dash-stat-icon">🔑</span>
                                <div>
                                    <span className="dash-stat-value">{stats.pendingOwners}</span>
                                    <span className="dash-stat-label">Pending Owners</span>
                                </div>
                            </div>
                            <div className="dash-stat-card">
                                <span className="dash-stat-icon">📝</span>
                                <div>
                                    <span className="dash-stat-value">{stats.totalBookings}</span>
                                    <span className="dash-stat-label">Total Bookings</span>
                                </div>
                            </div>
                            <div className="dash-stat-card">
                                <span className="dash-stat-icon">⭐</span>
                                <div>
                                    <span className="dash-stat-value">{stats.totalReviews}</span>
                                    <span className="dash-stat-label">Reviews</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ───── Users Tab ───── */}
                {activeTab === "users" && (
                    <div className="dash-section">
                        <div className="dash-section-header">
                            <h3>Manage Users ({users.length})</h3>
                            <div className="admin-filters">
                                <select
                                    value={userFilter}
                                    onChange={(e) => setUserFilter(e.target.value)}
                                    className="admin-select"
                                >
                                    <option value="">All Roles</option>
                                    <option value="student">Students</option>
                                    <option value="owner">Owners</option>
                                    <option value="admin">Admins</option>
                                </select>
                                <input
                                    type="text"
                                    placeholder="Search by name or email..."
                                    value={userSearch}
                                    onChange={(e) => setUserSearch(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && fetchUsers()}
                                    className="admin-search"
                                />
                            </div>
                        </div>

                        {users.length === 0 ? (
                            <div className="empty-state"><p>No users found.</p></div>
                        ) : (
                            <div className="admin-table-wrap">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Email</th>
                                            <th>Role</th>
                                            <th>Verified</th>
                                            <th>Joined</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map((user) => (
                                            <tr key={user._id}>
                                                <td className="td-bold">{user.name}</td>
                                                <td>{user.email}</td>
                                                <td>
                                                    <span className={`role-pill role-${user.role}`}>{user.role}</span>
                                                </td>
                                                <td>
                                                    <span className={`status-badge ${user.verificationStatus || "none"}`}>
                                                        {user.verificationStatus || "n/a"}
                                                    </span>
                                                </td>
                                                <td className="td-date">
                                                    {new Date(user.createdAt).toLocaleDateString("en-IN", {
                                                        year: "numeric", month: "short", day: "numeric",
                                                    })}
                                                </td>
                                                <td>
                                                    {user.role === "owner" && user.verificationStatus === "pending" && (
                                                        <div className="td-actions">
                                                            <button className="btn-sm btn-accept" onClick={() => handleVerifyOwner(user._id, "approved")}>
                                                                Approve
                                                            </button>
                                                            <button className="btn-sm btn-reject" onClick={() => handleVerifyOwner(user._id, "rejected")}>
                                                                Reject
                                                            </button>
                                                        </div>
                                                    )}
                                                    {user.role === "owner" && user.verificationStatus === "approved" && (
                                                        <span className="verified-check">✓ Verified</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* ───── Listings Tab ───── */}
                {activeTab === "listings" && (
                    <div className="dash-section">
                        <div className="dash-section-header">
                            <h3>Manage Listings ({listings.length})</h3>
                            <div className="admin-filters">
                                <select
                                    value={listingFilter}
                                    onChange={(e) => setListingFilter(e.target.value)}
                                    className="admin-select"
                                >
                                    <option value="">All Status</option>
                                    <option value="pending">Pending</option>
                                    <option value="approved">Approved</option>
                                    <option value="rejected">Rejected</option>
                                </select>
                            </div>
                        </div>

                        {listings.length === 0 ? (
                            <div className="empty-state"><p>No listings found.</p></div>
                        ) : (
                            <div className="admin-table-wrap">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Room</th>
                                            <th>Owner</th>
                                            <th>Price</th>
                                            <th>Location</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {listings.map((listing) => (
                                            <tr key={listing._id}>
                                                <td>
                                                    <div className="td-room">
                                                        <img
                                                            src={listing.image?.url || "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=80"}
                                                            alt={listing.title}
                                                            className="td-room-img"
                                                        />
                                                        <div>
                                                            <span className="td-bold">{listing.title}</span>
                                                            <span className="td-sub">{listing.roomType}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>{listing.owner?.name || "Unknown"}</td>
                                                <td className="td-bold">₹{listing.price?.toLocaleString("en-IN")}</td>
                                                <td>{listing.location}</td>
                                                <td>
                                                    <span className={`approval-badge ${listing.approvalStatus}`}>
                                                        {listing.approvalStatus}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="td-actions">
                                                        {listing.approvalStatus === "pending" && (
                                                            <>
                                                                <button className="btn-sm btn-accept" onClick={() => handleApproveListing(listing._id, "approved")}>
                                                                    Approve
                                                                </button>
                                                                <button className="btn-sm btn-reject" onClick={() => handleApproveListing(listing._id, "rejected")}>
                                                                    Reject
                                                                </button>
                                                            </>
                                                        )}
                                                        {listing.approvalStatus === "approved" && (
                                                            <Link to={`/listings/${listing._id}`} className="btn-sm btn-view">View</Link>
                                                        )}
                                                        {listing.approvalStatus === "rejected" && (
                                                            <button className="btn-sm btn-accept" onClick={() => handleApproveListing(listing._id, "approved")}>
                                                                Approve
                                                            </button>
                                                        )}
                                                        <button className="btn-sm btn-delete" onClick={() => handleDeleteListing(listing._id)}>
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
