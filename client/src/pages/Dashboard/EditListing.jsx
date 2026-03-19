// Edit Listing — form for owners to update existing room listings
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getListing, updateListing, generateDescription } from "../../services/api";
import imageCompression from "browser-image-compression";
import { useAuth } from "../../context/AuthContext";
import "./Dashboard.css";

const AMENITY_OPTIONS = [
    { key: "wifi", label: "WiFi" },
    { key: "ac", label: "AC" },
    { key: "food", label: "Meals Included" },
    { key: "laundry", label: "Laundry" },
    { key: "parking", label: "Parking" },
    { key: "power_backup", label: "Power Backup" },
    { key: "water", label: "24/7 Water" },
    { key: "furnished", label: "Fully Furnished" },
    { key: "gym", label: "Gym Access" },
    { key: "security", label: "Security/CCTV" },
];

const RULE_OPTIONS = [
    { key: "no_smoking", label: "No smoking on premises" },
    { key: "no_alcohol", label: "No alcohol allowed" },
    { key: "gate_closing", label: "Gate closes at 10:30 PM" },
    { key: "no_guests_late", label: "No guests after 10 PM" },
    { key: "cleanliness", label: "Maintain cleanliness in common areas" },
    { key: "id_required", label: "Valid college ID required" },
    { key: "noise_curfew", label: "No loud noise after 10 PM" },
    { key: "no_pets", label: "No pets allowed" },
    { key: "no_cooking", label: "No cooking in rooms" },
    { key: "damage_charge", label: "Property damage charges apply" },
];

const REFUND_OPTIONS = [
    "Full refund with 30-day notice",
    "Full refund with 15-day notice",
    "50% refund with 15-day notice",
    "No refund after move-in",
    "Custom (mentioned in rules)",
];

const EditListing = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { userProfile } = useAuth();
    
    const [fetchingData, setFetchingData] = useState(true);
    const [form, setForm] = useState({
        title: "",
        description: "",
        price: "",
        location: "",
        country: "India",
        roomType: "Single",
        maxOccupancy: 1,
        availableRooms: 1,
        nearbyCollege: "",
        distanceFromCollege: "",
        amenities: [],
        securityDeposit: "",
        refundPolicy: "Full refund with 30-day notice",
        propertyRules: [],
        customRules: "",
    });

    const [image, setImage] = useState(null); // only set if user picks a *new* image
    const [imagePreview, setImagePreview] = useState(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);
    const [generatingAI, setGeneratingAI] = useState(false);

    // Guard: redirect unverified owners
    useEffect(() => {
        if (userProfile && !userProfile.isVerified) {
            alert("Your account must be verified by an admin before you can edit listings.");
            navigate("/owner/dashboard");
        }
    }, [userProfile, navigate]);

    // Fetch existing listing data
    useEffect(() => {
        const fetchExisting = async () => {
            try {
                const res = await getListing(id);
                const data = res.data.listing;
                setForm({
                    title: data.title || "",
                    description: data.description || "",
                    price: data.price || "",
                    location: data.location || "",
                    country: data.country || "India",
                    roomType: data.roomType || "Single",
                    maxOccupancy: data.maxOccupancy || 1,
                    availableRooms: data.availableRooms || 1,
                    nearbyCollege: data.nearbyCollege || "",
                    distanceFromCollege: data.distanceFromCollege || "",
                    amenities: data.amenities || [],
                    securityDeposit: data.securityDeposit !== undefined ? data.securityDeposit : "",
                    refundPolicy: data.refundPolicy || "Full refund with 30-day notice",
                    propertyRules: data.propertyRules || [],
                    customRules: data.customRules || "",
                });
                if (data.image && data.image.url) {
                    setImagePreview(data.image.url); // Show existing cloud image
                }
            } catch (err) {
                console.error(err);
                setError("Failed to fetch property details.");
            } finally {
                setFetchingData(false);
            }
        };
        fetchExisting();
    }, [id]);

    const handleGenerateAI = async () => {
        if (!form.location || !form.roomType) {
            setError("Please fill in Room Type and Location first to help AI write a better description.");
            window.scrollTo(0, 0);
            return;
        }
        setGeneratingAI(true);
        setError("");
        try {
            const res = await generateDescription({
                keywords: form.description,
                location: form.location,
                roomType: form.roomType,
                amenities: form.amenities,
                price: form.price,
            });
            setForm((prev) => ({ ...prev, description: res.data.description }));
        } catch (err) {
            setError(err.response?.data?.error || "Failed to generate description.");
            window.scrollTo(0, 0);
        } finally {
            setGeneratingAI(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleAmenityToggle = (key) => {
        setForm((prev) => ({
            ...prev,
            amenities: prev.amenities.includes(key)
                ? prev.amenities.filter((a) => a !== key)
                : [...prev.amenities, key],
        }));
    };

    const handleRuleToggle = (key) => {
        setForm((prev) => ({
            ...prev,
            propertyRules: prev.propertyRules.includes(key)
                ? prev.propertyRules.filter((r) => r !== key)
                : [...prev.propertyRules, key],
        }));
    };

    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp"];

    const validateFile = (file) => {
        if (!ALLOWED_TYPES.includes(file.type)) {
            setError("Only PNG, JPG, JPEG, and WebP images are allowed.");
            return false;
        }
        if (file.size > MAX_FILE_SIZE) {
            setError("Image must be smaller than 5MB.");
            return false;
        }
        return true;
    };

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (file && validateFile(file)) {
            await compressAndSetImage(file);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.classList.add("drag-active");
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.classList.remove("drag-active");
    };

    const handleDrop = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.classList.remove("drag-active");
        const file = e.dataTransfer.files[0];
        if (file && validateFile(file)) {
            await compressAndSetImage(file);
        }
    };

    const compressAndSetImage = async (file) => {
        try {
            const options = {
                maxSizeMB: 1, // Max 1MB
                maxWidthOrHeight: 1920, // HD max
                useWebWorker: true,
            };
            const compressedFile = await imageCompression(file, options);
            setImage(compressedFile);
            setImagePreview(URL.createObjectURL(compressedFile));
            setError("");
        } catch (err) {
            console.error("Compression error:", err);
            setError("Failed to compress image. Please try another one.");
            window.scrollTo(0, 0);
        }
    };

    const removeImage = (e) => {
        e.stopPropagation();
        setImage(null);
        setImagePreview(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!form.title || !form.description || !form.price || !form.location) {
            setError("Please fill in all required fields.");
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            Object.entries(form).forEach(([key, value]) => {
                if (key === "amenities" || key === "propertyRules") {
                    value.forEach((a) => formData.append(key, a));
                } else {
                    formData.append(key, value);
                }
            });
            // Only append an image if the owner selected a NEW one
            if (image) {
                formData.append("image", image);
            }

            await updateListing(id, formData);
            setSuccess("Listing updated successfully!");
            setTimeout(() => navigate("/owner/dashboard"), 1500);
        } catch (err) {
            setError(err.response?.data?.error || "Failed to edit listing.");
            window.scrollTo(0, 0);
        } finally {
            setLoading(false);
        }
    };

    if (fetchingData) {
        return <div className="spinner-wrapper"><div className="spinner"></div></div>;
    }

    return (
        <div className="dashboard">
            <div className="dashboard-container add-listing-form">
                <button className="back-btn" onClick={() => navigate(-1)} style={{ marginBottom: "1rem" }}>
                    ← Back
                </button>
                <div className="form-card">
                    <h2>Edit Listing</h2>

                    {error && <div className="form-error">{error}</div>}
                    {success && <div className="form-success">{success}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Room Title *</label>
                            <input name="title" value={form.title} onChange={handleChange} placeholder="e.g. Furnished Room Near IIT Delhi" />
                        </div>

                        <div className="form-group">
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                                <label>Description *</label>
                                <button
                                    type="button"
                                    onClick={handleGenerateAI}
                                    disabled={generatingAI}
                                    className="btn btn-primary btn-sm-pad"
                                    style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem" }}
                                >
                                    {generatingAI ? "Generating..." : "Generate with AI"}
                                </button>
                            </div>
                            <textarea
                                name="description"
                                value={form.description}
                                onChange={handleChange}
                                placeholder="Write a short description, or type some rough keywords and click 'Generate with AI'..."
                                style={{ marginTop: "0.5rem" }}
                                rows="4"
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Price (₹/month) *</label>
                                <input type="number" name="price" value={form.price} onChange={handleChange} placeholder="8000" />
                            </div>
                            <div className="form-group">
                                <label>Room Type</label>
                                <select name="roomType" value={form.roomType} onChange={handleChange}>
                                    <option value="Single">Single</option>
                                    <option value="Shared">Shared</option>
                                    <option value="PG">PG</option>
                                    <option value="Apartment">Apartment</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Location *</label>
                                <input name="location" value={form.location} onChange={handleChange} placeholder="Area, City" />
                            </div>
                            <div className="form-group">
                                <label>Country</label>
                                <input name="country" value={form.country} onChange={handleChange} placeholder="India" />
                            </div>
                        </div>

                        <div className="form-row-3">
                            <div className="form-group">
                                <label>Max Occupancy</label>
                                <input type="number" name="maxOccupancy" value={form.maxOccupancy} onChange={handleChange} min="1" />
                            </div>
                            <div className="form-group">
                                <label>Available Rooms</label>
                                <input type="number" name="availableRooms" value={form.availableRooms} onChange={handleChange} min="1" />
                            </div>
                            <div className="form-group">
                                <label>Distance from College</label>
                                <input name="distanceFromCollege" value={form.distanceFromCollege} onChange={handleChange} placeholder="e.g. 500m" />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Nearby College</label>
                            <input name="nearbyCollege" value={form.nearbyCollege} onChange={handleChange} placeholder="e.g. IIT Delhi" />
                        </div>

                        <div className="form-group">
                            <label>Amenities</label>
                            <div className="amenities-checkboxes">
                                {AMENITY_OPTIONS.map((a) => (
                                    <label key={a.key}>
                                        <input
                                            type="checkbox"
                                            checked={form.amenities.includes(a.key)}
                                            onChange={() => handleAmenityToggle(a.key)}
                                        />
                                        {a.label}
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Property Rules & Deposit */}
                        <div className="form-section-divider">
                            <h3>📋 Property Rules & Security Deposit</h3>
                            <p className="form-section-hint">These details will be visible to students before they book.</p>
                        </div>

                        <div className="form-group">
                            <label>Standard Rules (select all that apply)</label>
                            <div className="amenities-checkboxes">
                                {RULE_OPTIONS.map((r) => (
                                    <label key={r.key}>
                                        <input
                                            type="checkbox"
                                            checked={form.propertyRules.includes(r.key)}
                                            onChange={() => handleRuleToggle(r.key)}
                                        />
                                        {r.label}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Additional Rules (optional)</label>
                            <textarea name="customRules" value={form.customRules} onChange={handleChange} placeholder="Any additional rules or important information for students..." />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Security Deposit (₹)</label>
                                <input type="number" name="securityDeposit" value={form.securityDeposit} onChange={handleChange} placeholder="e.g. 5000" min="0" />
                            </div>
                            <div className="form-group">
                                <label>Refund Policy</label>
                                <select name="refundPolicy" value={form.refundPolicy} onChange={handleChange}>
                                    {REFUND_OPTIONS.map((opt) => (
                                        <option key={opt} value={opt}>{opt}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Room Image (Leave blank to keep existing image)</label>
                            <div
                                className="image-upload"
                                onClick={() => document.getElementById("listing-image").click()}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                            >
                                <input id="listing-image" type="file" accept="image/png,image/jpeg,image/jpg,image/webp" onChange={handleImageChange} />
                                {imagePreview ? (
                                    <div className="image-preview-wrap">
                                        <img src={imagePreview} alt="Preview" className="image-preview" />
                                        <button type="button" className="image-remove-btn" onClick={removeImage}>×</button>
                                        <span className="image-file-info">
                                            {image ? `${image.name} (${(image.size / 1024).toFixed(0)} KB)` : "Existing Cloudinary Image"}
                                        </span>
                                    </div>
                                ) : (
                                    <div className="upload-placeholder">
                                        <span className="upload-icon">📷</span>
                                        <p>Click or drag new image here</p>
                                        <span className="upload-hint">PNG, JPG, WebP — max 5MB</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="form-submit">
                            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                                {loading ? "Saving Updates..." : "Save Updates"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditListing;
