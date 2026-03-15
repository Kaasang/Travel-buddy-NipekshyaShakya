/**
 * Auth Context
 * Manages authentication state across the application
 */

import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Clear auth state (synchronous helper)
    const clearAuthState = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('role');
        sessionStorage.clear();
        setUser(null);
        setIsAuthenticated(false);
    };

    // Check for existing session on mount
    useEffect(() => {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (token && storedUser) {
            try {
                setUser(JSON.parse(storedUser));
                setIsAuthenticated(true);
                // Verify token is still valid
                fetchCurrentUser();
            } catch (error) {
                clearAuthState();
            }
        }
        setLoading(false);
    }, []);

    // Fetch current user data
    const fetchCurrentUser = async () => {
        try {
            const response = await authAPI.getMe();
            const userData = response.data.data;
            
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
        } catch (error) {
            logout();
        }
    };

    // Register new user
    const register = async (email, password, fullName) => {
        const response = await authAPI.register({ email, password, fullName });
        const { user: userData, token } = response.data.data;

        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('role', userData.role || 'user');
        setUser(userData);
        setIsAuthenticated(true);

        return response.data;
    };

    // Login user
    const login = async (email, password) => {
        const response = await authAPI.login({ email, password });
        const { user: userData, token } = response.data.data;

        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('role', userData.role || 'user');
        setUser(userData);
        setIsAuthenticated(true);

        return response.data;
    };

    // Logout user
    const logout = async () => {
        try {
            // Call backend logout endpoint
            await authAPI.logout();
        } catch (error) {
            console.error('Logout error:', error);
        }
        // Always clear local state
        clearAuthState();
    };

    // Update user data
    const updateUser = (userData) => {
        setUser(prev => ({ ...prev, ...userData }));
        localStorage.setItem('user', JSON.stringify({ ...user, ...userData }));
    };

    const value = {
        user,
        loading,
        isAuthenticated,
        isAdmin: user?.role === 'admin',
        isVerified: user?.verificationStatus === 'approved',
        register,
        login,
        logout,
        updateUser,
        fetchCurrentUser
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;
