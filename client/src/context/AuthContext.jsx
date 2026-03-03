// AuthContext — manages Firebase auth state + user profile from our API
import { createContext, useContext, useState, useEffect } from "react";
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    signOut,
    updateProfile,
} from "firebase/auth";
import { auth, googleProvider } from "../config/firebase";
import { registerUser, getMe } from "../services/api";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null); // Firebase user
    const [userProfile, setUserProfile] = useState(null); // MongoDB user
    const [loading, setLoading] = useState(true);

    // Listen to Firebase auth state
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setCurrentUser(firebaseUser);

            if (firebaseUser) {
                // Store token for API calls
                const token = await firebaseUser.getIdToken();
                localStorage.setItem("authToken", token);

                // Fetch user profile from our backend
                try {
                    const res = await getMe();
                    setUserProfile(res.data.user);
                } catch (err) {
                    // User exists in Firebase but not in our DB yet — that's okay
                    setUserProfile(null);
                }
            } else {
                localStorage.removeItem("authToken");
                setUserProfile(null);
            }

            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Email/Password Signup
    const signup = async (email, password, name, extraData = {}) => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);

        // Update Firebase display name
        await updateProfile(userCredential.user, { displayName: name });

        // Store token
        const token = await userCredential.user.getIdToken(true);
        localStorage.setItem("authToken", token);

        // Register in our MongoDB
        const res = await registerUser({
            name,
            ...extraData,
        });
        setUserProfile(res.data.user);

        return res.data.user;
    };

    // Email/Password Login
    const login = async (email, password) => {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);

        const token = await userCredential.user.getIdToken();
        localStorage.setItem("authToken", token);

        // Fetch profile
        try {
            const res = await getMe();
            setUserProfile(res.data.user);
            return res.data.user;
        } catch (err) {
            return null;
        }
    };

    // Google Login/Signup
    const googleLogin = async (extraData = {}) => {
        const result = await signInWithPopup(auth, googleProvider);

        const token = await result.user.getIdToken();
        localStorage.setItem("authToken", token);

        // Check if user exists in our DB, if not register
        try {
            const res = await getMe();
            setUserProfile(res.data.user);
            return { user: res.data.user, isNew: false };
        } catch (err) {
            // New user — register in our DB
            const res = await registerUser({
                name: result.user.displayName || "User",
                ...extraData,
            });
            setUserProfile(res.data.user);
            return { user: res.data.user, isNew: true };
        }
    };

    // Logout
    const logout = async () => {
        await signOut(auth);
        localStorage.removeItem("authToken");
        setCurrentUser(null);
        setUserProfile(null);
    };

    const value = {
        currentUser,
        userProfile,
        loading,
        signup,
        login,
        googleLogin,
        logout,
        setUserProfile,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
