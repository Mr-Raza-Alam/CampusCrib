// RoomCard component — displays a listing preview
import { Link } from "react-router-dom";
import "./RoomCard.css";

const amenityIcons = {
    wifi: "WiFi",
    ac: "AC",
    food: "Meals",
    laundry: "Laundry",
    parking: "Parking",
    power_backup: "Power",
    water: "Water",
    furnished: "Furnished",
    gym: "Gym",
    security: "Security",
};

const RoomCard = ({ listing }) => {
    const { _id, title, image, price, location, roomType, amenities, nearbyCollege, distanceFromCollege, availableRooms } = listing;

    return (
        <Link to={`/listings/${_id}`} className="room-card card">
            <div className="room-card-img-wrap">
                <img
                    src={image?.url || "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=400"}
                    alt={title}
                    className="room-card-img"
                />
                <span className="room-card-type">{roomType}</span>
                {availableRooms <= 2 && (
                    <span className="room-card-urgent">Only {availableRooms} left!</span>
                )}
            </div>

            <div className="room-card-body">
                <h3 className="room-card-title">{title}</h3>
                <p className="room-card-location">{location}</p>

                {nearbyCollege && (
                    <div className="room-card-college">
                        <span className="college-name">{nearbyCollege}</span>
                        {distanceFromCollege && <span className="college-dist">{distanceFromCollege}</span>}
                    </div>
                )}

                {amenities && amenities.length > 0 && (
                    <div className="room-card-amenities">
                        {amenities.slice(0, 4).map((a) => (
                            <span key={a} className="amenity-tag">{amenityIcons[a] || a}</span>
                        ))}
                        {amenities.length > 4 && (
                            <span className="amenity-tag amenity-more">+{amenities.length - 4}</span>
                        )}
                    </div>
                )}

                <div className="room-card-footer">
                    <span className="room-card-price">
                        <strong>&#8377;{price?.toLocaleString("en-IN")}</strong>
                        <small>/month</small>
                    </span>
                    <span className="room-card-view">View Details</span>
                </div>
            </div>
        </Link>
    );
};

export default RoomCard;
