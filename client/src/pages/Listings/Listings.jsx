// Listings page — browse all available rooms with search, filters, sort, and map/grid views
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { getListings } from "../../services/api";
import RoomCard from "../../components/RoomCard/RoomCard";
import MapView from "../../components/MapView/MapView";
import "./Listings.css";

const AMENITY_OPTIONS = [
    { key: "wifi", label: "WiFi" },
    { key: "ac", label: "AC" },
    { key: "food", label: "Meals" },
    { key: "laundry", label: "Laundry" },
    { key: "parking", label: "Parking" },
    { key: "power_backup", label: "Power Backup" },
    { key: "water", label: "24/7 Water" },
    { key: "furnished", label: "Furnished" },
    { key: "gym", label: "Gym" },
    { key: "security", label: "Security" },
];

const SORT_OPTIONS = [
    { value: "newest", label: "Newest First" },
    { value: "price_asc", label: "Price: Low → High" },
    { value: "price_desc", label: "Price: High → Low" },
];

const Listings = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState("grid"); // "grid" or "map"
    const [showFilters, setShowFilters] = useState(false);

    // Read filter state from URL params
    const search = searchParams.get("search") || "";
    const roomType = searchParams.get("roomType") || "";
    const minPrice = searchParams.get("minPrice") || "";
    const maxPrice = searchParams.get("maxPrice") || "";
    const sort = searchParams.get("sort") || "newest";
    const amenities = searchParams.get("amenities")?.split(",").filter(Boolean) || [];

    const updateParam = (key, value) => {
        const params = new URLSearchParams(searchParams);
        if (value && value.length > 0) {
            params.set(key, Array.isArray(value) ? value.join(",") : value);
        } else {
            params.delete(key);
        }
        setSearchParams(params, { replace: true });
    };

    const fetchListings = async () => {
        setLoading(true);
        try {
            const params = {};
            if (search) params.search = search;
            if (roomType) params.roomType = roomType;
            if (minPrice) params.minPrice = minPrice;
            if (maxPrice) params.maxPrice = maxPrice;
            if (sort) params.sort = sort;
            if (amenities.length > 0) params.amenities = amenities.join(",");

            const res = await getListings(params);
            setListings(res.data.listings);
        } catch (err) {
            console.error("Error fetching listings:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchListings();
    }, [searchParams.toString()]);

    const handleSearch = (e) => {
        e.preventDefault();
        // search param is already bound via URL state — just triggers re-fetch
    };

    const toggleAmenity = (key) => {
        const updated = amenities.includes(key)
            ? amenities.filter((a) => a !== key)
            : [...amenities, key];
        updateParam("amenities", updated);
    };

    const removeFilter = (key) => {
        const params = new URLSearchParams(searchParams);
        params.delete(key);
        setSearchParams(params, { replace: true });
    };

    const clearFilters = () => {
        setSearchParams({}, { replace: true });
    };

    // Collect active filters for pill display
    const activeFilters = [];
    if (search) activeFilters.push({ key: "search", label: `"${search}"` });
    if (roomType) activeFilters.push({ key: "roomType", label: roomType });
    if (minPrice) activeFilters.push({ key: "minPrice", label: `Min ₹${minPrice}` });
    if (maxPrice) activeFilters.push({ key: "maxPrice", label: `Max ₹${maxPrice}` });
    if (sort && sort !== "newest") activeFilters.push({ key: "sort", label: SORT_OPTIONS.find((s) => s.value === sort)?.label });
    amenities.forEach((a) => {
        const label = AMENITY_OPTIONS.find((opt) => opt.key === a)?.label || a;
        activeFilters.push({ key: `amenity:${a}`, label });
    });

    const handleRemoveFilter = (filterKey) => {
        if (filterKey.startsWith("amenity:")) {
            const amenityKey = filterKey.replace("amenity:", "");
            toggleAmenity(amenityKey);
        } else {
            removeFilter(filterKey);
        }
    };

    return (
        <div className="listings-page">
            {/* Search & Filter Bar */}
            <div className="search-section">
                <div className="container">
                    <h1 className="listings-heading">Browse Rooms</h1>
                    <p className="listings-subheading">Find your ideal accommodation near campus</p>

                    <form className="search-bar" onSubmit={handleSearch}>
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Search by college, city, or keyword..."
                            value={search}
                            onChange={(e) => updateParam("search", e.target.value)}
                        />
                        <select
                            className="filter-select"
                            value={roomType}
                            onChange={(e) => updateParam("roomType", e.target.value)}
                        >
                            <option value="">All Types</option>
                            <option value="single">Single Room</option>
                            <option value="shared">Shared Room</option>
                            <option value="pg">PG</option>
                            <option value="apartment">Apartment</option>
                            <option value="hostel">Hostel</option>
                        </select>
                        <input
                            type="number"
                            className="filter-price"
                            placeholder="Min ₹"
                            value={minPrice}
                            onChange={(e) => updateParam("minPrice", e.target.value)}
                        />
                        <input
                            type="number"
                            className="filter-price"
                            placeholder="Max ₹"
                            value={maxPrice}
                            onChange={(e) => updateParam("maxPrice", e.target.value)}
                        />
                        <select
                            className="filter-select sort-select"
                            value={sort}
                            onChange={(e) => updateParam("sort", e.target.value)}
                        >
                            {SORT_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                        <button
                            type="button"
                            className={`btn btn-amenity-toggle ${showFilters ? "active" : ""}`}
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            ☰ Amenities
                        </button>
                        <button type="button" className="btn btn-outline" onClick={clearFilters}>Clear</button>
                    </form>

                    {/* Amenity Filters Panel */}
                    {showFilters && (
                        <div className="amenity-filter-panel">
                            {AMENITY_OPTIONS.map((a) => (
                                <label key={a.key} className={`amenity-filter-chip ${amenities.includes(a.key) ? "active" : ""}`}>
                                    <input
                                        type="checkbox"
                                        checked={amenities.includes(a.key)}
                                        onChange={() => toggleAmenity(a.key)}
                                    />
                                    {a.label}
                                </label>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Results */}
            <div className="container results-section">
                {/* Active Filters + View Toggle */}
                <div className="results-toolbar">
                    <div className="results-left">
                        {!loading && <p className="results-count">{listings.length} rooms available</p>}
                        {activeFilters.length > 0 && (
                            <div className="active-filters">
                                {activeFilters.map((f) => (
                                    <span key={f.key} className="filter-pill">
                                        {f.label}
                                        <button onClick={() => handleRemoveFilter(f.key)}>×</button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="view-toggle">
                        <button
                            className={`view-btn ${viewMode === "grid" ? "active" : ""}`}
                            onClick={() => setViewMode("grid")}
                            title="Grid View"
                        >
                            ▦
                        </button>
                        <button
                            className={`view-btn ${viewMode === "map" ? "active" : ""}`}
                            onClick={() => setViewMode("map")}
                            title="Map View"
                        >
                            🗺️
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="spinner-wrapper">
                        <div className="spinner"></div>
                    </div>
                ) : listings.length === 0 ? (
                    <div className="no-results">
                        <h3>No rooms found</h3>
                        <p>Try adjusting your search or filters</p>
                    </div>
                ) : viewMode === "map" ? (
                    <MapView listings={listings} />
                ) : (
                    <div className="listings-grid">
                        {listings.map((listing) => (
                            <RoomCard key={listing._id} listing={listing} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Listings;
