// MapView — reusable Mapbox GL map component
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import "./MapView.css";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const MapView = ({ listings = [], center = [78.9629, 20.5937], zoom = 4.5, singleMarker = false }) => {
    const mapContainer = useRef(null);
    const mapRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (mapRef.current) return; // already initialized

        mapRef.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: "mapbox://styles/mapbox/streets-v12",
            center: center,
            zoom: zoom,
        });

        mapRef.current.addControl(new mapboxgl.NavigationControl(), "top-right");

        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, []);

    // Add markers when listings change
    useEffect(() => {
        if (!mapRef.current) return;

        // Wait for map to be loaded
        const addMarkers = () => {
            // Remove existing markers
            const existingMarkers = document.querySelectorAll(".mapbox-marker");
            existingMarkers.forEach((m) => m.remove());

            if (!listings || listings.length === 0) return;

            const bounds = new mapboxgl.LngLatBounds();

            listings.forEach((listing) => {
                if (!listing.geometry?.coordinates) return;

                const [lng, lat] = listing.geometry.coordinates;
                if (!lng || !lat) return;

                // Create custom marker element
                const markerEl = document.createElement("div");
                markerEl.className = "mapbox-marker";
                markerEl.innerHTML = `<span>₹${(listing.price / 1000).toFixed(0)}K</span>`;

                // Popup HTML
                const popupHTML = `
                    <div class="map-popup">
                        <img src="${listing.image?.url || 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=300'}" alt="${listing.title}" />
                        <div class="map-popup-body">
                            <h4>${listing.title}</h4>
                            <p class="map-popup-location">${listing.location}</p>
                            <div class="map-popup-footer">
                                <strong>₹${listing.price?.toLocaleString("en-IN")}</strong>
                                <span>/month</span>
                            </div>
                        </div>
                    </div>
                `;

                const popup = new mapboxgl.Popup({
                    offset: 25,
                    closeButton: true,
                    maxWidth: "260px",
                });
                popup.setHTML(popupHTML);

                // Navigate on popup click
                popup.on("open", () => {
                    const popupEl = popup.getElement();
                    if (popupEl) {
                        popupEl.style.cursor = "pointer";
                        popupEl.addEventListener("click", (e) => {
                            if (!e.target.closest(".mapboxgl-popup-close-button")) {
                                navigate(`/listings/${listing._id}`);
                            }
                        });
                    }
                });

                new mapboxgl.Marker(markerEl)
                    .setLngLat([lng, lat])
                    .setPopup(popup)
                    .addTo(mapRef.current);

                bounds.extend([lng, lat]);
            });

            // Fit map to bounds
            if (listings.length > 1) {
                mapRef.current.fitBounds(bounds, { padding: 60, maxZoom: 14 });
            } else if (listings.length === 1 && listings[0].geometry?.coordinates) {
                mapRef.current.flyTo({
                    center: listings[0].geometry.coordinates,
                    zoom: singleMarker ? 14 : 12,
                });
            }
        };

        if (mapRef.current.loaded()) {
            addMarkers();
        } else {
            mapRef.current.on("load", addMarkers);
        }
    }, [listings, navigate, singleMarker]);

    return (
        <div className={`map-container ${singleMarker ? "map-mini" : "map-full"}`}>
            <div ref={mapContainer} className="map-canvas" />
        </div>
    );
};

export default MapView;
