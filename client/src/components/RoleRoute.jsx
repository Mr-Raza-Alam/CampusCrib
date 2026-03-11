// RoleRoute — restricts access to specific roles (owner, admin, student)
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const RoleRoute = ({ children, roles = [] }) => {
    const { currentUser, userProfile, loading } = useAuth();

    if (loading) {
        return (
            <div className="spinner-wrapper">
                <div className="spinner"></div>
            </div>
        );
    }

    if (!currentUser) {
        return <Navigate to="/login" replace />;
    }

    // If user profile is loaded but role doesn't match
    if (userProfile && roles.length > 0 && !roles.includes(userProfile.role)) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default RoleRoute;
