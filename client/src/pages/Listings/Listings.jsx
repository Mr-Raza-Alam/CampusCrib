// Listings page — browse all available rooms
import { useState, useEffect } from "react";
import { getListings } from "../../services/api";
import RoomCard from "../../components/RoomCard/RoomCard";
import "./Listings.css";

const Listings = () => {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [roomType, setRoomType] = useState("");
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");

    const fetchListings = async () => {
        setLoading(true);
        try {
            const params = {};
            if (search) params.search = search;
            if (roomType) params.roomType = roomType;
            if (minPrice) params.minPrice = minPrice;
            if (maxPrice) params.maxPrice = maxPrice;

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
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchListings();
    };

    const clearFilters = () => {
        setSearch("");
        setRoomType("");
        setMinPrice("");
        setMaxPrice("");
        setTimeout(() => fetchListings(), 0);
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
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <select
                            className="filter-select"
                            value={roomType}
                            onChange={(e) => setRoomType(e.target.value)}
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
                            placeholder="Min Price"
                            value={minPrice}
                            onChange={(e) => setMinPrice(e.target.value)}
                        />
                        <input
                            type="number"
                            className="filter-price"
                            placeholder="Max Price"
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(e.target.value)}
                        />
                        <button type="submit" className="btn btn-primary">Search</button>
                        <button type="button" className="btn btn-outline" onClick={clearFilters}>Clear</button>
                    </form>
                </div>
            </div>

            {/* Results */}
            <div className="container results-section">
                {loading ? (
                    <div className="spinner-wrapper">
                        <div className="spinner"></div>
                    </div>
                ) : listings.length === 0 ? (
                    <div className="no-results">
                        <h3>No rooms found</h3>
                        <p>Try adjusting your search or filters</p>
                    </div>
                ) : (
                    <>
                        <p className="results-count">{listings.length} rooms available</p>
                        <div className="listings-grid">
                            {listings.map((listing) => (
                                <RoomCard key={listing._id} listing={listing} />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Listings;
