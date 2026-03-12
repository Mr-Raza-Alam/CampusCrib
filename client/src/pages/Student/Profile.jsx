// Profile Page — edit name, phone, college info + owner payment info + QR code upload
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { updateProfile as updateProfileAPI, uploadQRCode } from "../../services/api";
import "../Dashboard/Dashboard.css";

const Profile = () => {
    const { currentUser, userProfile, setUserProfile } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({
        name: "",
        phone: "",
        collegeName: "",
    });
    const [paymentForm, setPaymentForm] = useState({
        upiId: "",
        bankName: "",
        accountNumber: "",
        ifscCode: "",
    });
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [qrPreview, setQrPreview] = useState("");
    const [qrFile, setQrFile] = useState(null);
    const [uploadingQR, setUploadingQR] = useState(false);

    const isOwner = userProfile?.role === "owner";

    useEffect(() => {
        if (userProfile) {
            setForm({
                name: userProfile.name || "",
                phone: userProfile.phone || "",
                collegeName: userProfile.collegeName || "",
            });
            if (userProfile.paymentInfo) {
                setPaymentForm({
                    upiId: userProfile.paymentInfo.upiId || "",
                    bankName: userProfile.paymentInfo.bankName || "",
                    accountNumber: userProfile.paymentInfo.accountNumber || "",
                    ifscCode: userProfile.paymentInfo.ifscCode || "",
                });
                if (userProfile.paymentInfo.qrCodeImage) {
                    setQrPreview(userProfile.paymentInfo.qrCodeImage);
                }
            }
        }
    }, [userProfile]);

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handlePaymentChange = (e) => {
        setPaymentForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleQRSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setQrFile(file);
            setQrPreview(URL.createObjectURL(file));
        }
    };

    const handleQRUpload = async () => {
        if (!qrFile) return;
        setUploadingQR(true);
        setMessage("");
        try {
            const fd = new FormData();
            fd.append("qrCodeImage", qrFile);
            const res = await uploadQRCode(fd);
            setUserProfile(res.data.user);
            setQrFile(null);
            setQrPreview(res.data.qrCodeUrl);
            setMessage("QR code uploaded successfully!");
        } catch (err) {
            setMessage("Failed to upload QR code.");
        } finally {
            setUploadingQR(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage("");
        try {
            const data = { ...form };
            if (isOwner) {
                data.paymentInfo = paymentForm;
            }
            const res = await updateProfileAPI(data);
            setUserProfile(res.data.user);
            setMessage("Profile updated successfully!");
        } catch (err) {
            setMessage("Failed to update profile.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="dashboard">
            <div className="dashboard-container add-listing-form">
                <button className="back-btn" onClick={() => navigate(-1)} style={{ marginBottom: "1rem" }}>
                    ← Back
                </button>
                <div className="form-card">
                    <h2>My Profile</h2>

                    {message && (
                        <div className={message.includes("success") ? "form-success" : "form-error"}>
                            {message}
                        </div>
                    )}

                    {/* Profile Header */}
                    <div className="profile-header">
                        <div className="profile-avatar-lg">
                            {currentUser?.photoURL ? (
                                <img src={currentUser.photoURL} alt="Profile" className="profile-avatar-img" />
                            ) : (
                                <span>{(userProfile?.name || "U").charAt(0).toUpperCase()}</span>
                            )}
                        </div>
                        <div>
                            <h3 className="profile-name">{userProfile?.name}</h3>
                            <p className="profile-email">{userProfile?.email}</p>
                            <span className={`role-pill role-${userProfile?.role}`}>{userProfile?.role}</span>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Full Name</label>
                            <input name="name" value={form.name} onChange={handleChange} placeholder="Your name" />
                        </div>
                        <div className="form-group">
                            <label>Phone Number</label>
                            <input name="phone" value={form.phone} onChange={handleChange} placeholder="10-digit mobile" />
                        </div>
                        {!isOwner && (
                            <div className="form-group">
                                <label>College Name</label>
                                <input name="collegeName" value={form.collegeName} onChange={handleChange} placeholder="e.g. IIT Delhi" />
                            </div>
                        )}

                        {/* Owner Payment Info */}
                        {isOwner && (
                            <>
                                <div className="form-section-divider">
                                    <h3>💳 Payment Details</h3>
                                    <p className="form-section-hint">Students will see these details after you accept their booking request.</p>
                                </div>

                                <div className="form-group">
                                    <label>UPI ID</label>
                                    <input name="upiId" value={paymentForm.upiId} onChange={handlePaymentChange} placeholder="e.g. yourname@upi" />
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Bank Name</label>
                                        <input name="bankName" value={paymentForm.bankName} onChange={handlePaymentChange} placeholder="e.g. State Bank of India" />
                                    </div>
                                    <div className="form-group">
                                        <label>IFSC Code</label>
                                        <input name="ifscCode" value={paymentForm.ifscCode} onChange={handlePaymentChange} placeholder="e.g. SBIN0001234" />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Account Number</label>
                                    <input name="accountNumber" value={paymentForm.accountNumber} onChange={handlePaymentChange} placeholder="Bank account number" />
                                </div>

                                {/* QR Code Upload */}
                                <div className="form-group">
                                    <label>📱 Payment QR Code (Google Pay / Paytm / PhonePe)</label>
                                    <p style={{ fontSize: "0.75rem", color: "#6B7280", marginBottom: "0.5rem" }}>
                                        Upload your payment app QR code so students can easily scan and pay the security deposit.
                                    </p>
                                    <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start", flexWrap: "wrap" }}>
                                        {qrPreview && (
                                            <div style={{ 
                                                border: "2px solid #D1FAE5", borderRadius: "8px", 
                                                padding: "0.5rem", background: "#F0FDF4" 
                                            }}>
                                                <img
                                                    src={qrPreview}
                                                    alt="QR Code Preview"
                                                    style={{ width: "150px", height: "150px", objectFit: "contain", borderRadius: "4px" }}
                                                />
                                            </div>
                                        )}
                                        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                                            <input
                                                type="file"
                                                accept="image/png,image/jpg,image/jpeg,image/webp"
                                                onChange={handleQRSelect}
                                                style={{ fontSize: "0.8rem" }}
                                            />
                                            {qrFile && (
                                                <button
                                                    type="button"
                                                    className="btn btn-primary btn-sm"
                                                    onClick={handleQRUpload}
                                                    disabled={uploadingQR}
                                                    style={{ width: "fit-content" }}
                                                >
                                                    {uploadingQR ? "Uploading..." : "📤 Upload QR Code"}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        <div className="form-submit">
                            <button type="submit" className="btn btn-primary btn-full" disabled={saving}>
                                {saving ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Profile;
