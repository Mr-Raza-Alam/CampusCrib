// API service — centralized API calls to Express backend
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3300/api";

const api = axios.create({
    baseURL: API_BASE,
    headers: {
        "Content-Type": "application/json",
    },
});

// Add auth token to requests if available
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// ---- Listings ----
export const getListings = (params) => api.get("/listings", { params });
export const getListing = (id) => api.get(`/listings/${id}`);
export const createListing = (formData) =>
    api.post("/listings", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
export const updateListing = (id, formData) =>
    api.put(`/listings/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
export const deleteListing = (id) => api.delete(`/listings/${id}`);
export const getMyListings = () => api.get("/listings/my");

// ---- Auth ----
export const registerUser = (data) => api.post("/auth/register", data);
export const getMe = () => api.get("/auth/me");
export const updateProfile = (data) => api.put("/auth/profile", data);
export const uploadQRCode = (formData) =>
    api.put("/auth/profile/qr-code", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });

// ---- Reviews ----
export const addReview = (listingId, data) => api.post(`/reviews/${listingId}`, data);
export const deleteReview = (reviewId) => api.delete(`/reviews/${reviewId}`);

// ---- Bookings ----
export const createBooking = (listingId, data) => api.post(`/bookings/${listingId}`, data);
export const getMyBookings = () => api.get("/bookings/my");
export const respondToBooking = (id, status) => api.put(`/bookings/${id}/respond`, { status });
export const confirmPayment = (id) => api.put(`/bookings/${id}/confirm-payment`);
export const deleteBooking = (id) => api.delete(`/bookings/${id}`);

// ---- Admin ----
export const getAdminStats = () => api.get("/admin/stats");
export const getAdminUsers = (params) => api.get("/admin/users", { params });
export const verifyOwner = (id, status) => api.put(`/admin/users/${id}/verify`, { status });
export const getAdminListings = (params) => api.get("/admin/listings", { params });
export const approveListing = (id, status) => api.put(`/admin/listings/${id}/approve`, { status });
export const adminDeleteListing = (id) => api.delete(`/admin/listings/${id}`);
export const adminDeleteReview = (id) => api.delete(`/admin/reviews/${id}`);

// ---- Health Check ----
export const healthCheck = () => api.get("/health");

export default api;
