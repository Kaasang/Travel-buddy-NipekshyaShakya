/**
 * App Component
 * Main application with routing setup
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// Layout components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Page components
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import EditProfilePage from './pages/EditProfilePage';
import TripsPage from './pages/TripsPage';
import TripDetailsPage from './pages/TripDetailsPage';
import CreateTripPage from './pages/CreateTripPage';
import MatchesPage from './pages/MatchesPage';
import MessagesPage from './pages/MessagesPage';
import UserProfilePage from './pages/UserProfilePage';
import AdminDashboard from './pages/admin/AdminDashboard';
import RecommendationsPage from './pages/RecommendationsPage';
import BlogPage from './pages/BlogPage';

// Protected Route wrapper
const ProtectedRoute = ({ children, adminOnly = false }) => {
    const { isAuthenticated, isAdmin, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (adminOnly && !isAdmin) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

// Public Route wrapper (redirect if authenticated)
const PublicRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

// Layout wrapper
const Layout = ({ children, showFooter = true }) => {
    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            <main className="flex-grow">
                {children}
            </main>
            {showFooter && <Footer />}
        </div>
    );
};

function AppRoutes() {
    return (
        <Routes>
            {/* Public routes */}
            <Route path="/" element={
                <PublicRoute>
                    <Layout><HomePage /></Layout>
                </PublicRoute>
            } />
            <Route path="/login" element={
                <PublicRoute>
                    <Layout showFooter={false}><LoginPage /></Layout>
                </PublicRoute>
            } />
            <Route path="/register" element={
                <PublicRoute>
                    <Layout showFooter={false}><RegisterPage /></Layout>
                </PublicRoute>
            } />

            {/* Protected routes */}
            <Route path="/dashboard" element={
                <ProtectedRoute>
                    <Layout><DashboardPage /></Layout>
                </ProtectedRoute>
            } />
            <Route path="/profile" element={
                <ProtectedRoute>
                    <Layout><ProfilePage /></Layout>
                </ProtectedRoute>
            } />
            <Route path="/profile/edit" element={
                <ProtectedRoute>
                    <Layout><EditProfilePage /></Layout>
                </ProtectedRoute>
            } />
            <Route path="/users/:id" element={
                <ProtectedRoute>
                    <Layout><UserProfilePage /></Layout>
                </ProtectedRoute>
            } />
            <Route path="/recommendations" element={
                <ProtectedRoute>
                    <Layout><RecommendationsPage /></Layout>
                </ProtectedRoute>
            } />
            <Route path="/blog" element={
                <ProtectedRoute>
                    <Layout><BlogPage /></Layout>
                </ProtectedRoute>
            } />
            <Route path="/trips" element={
                <ProtectedRoute>
                    <Layout><TripsPage /></Layout>
                </ProtectedRoute>
            } />
            <Route path="/trips/create" element={
                <ProtectedRoute>
                    <Layout><CreateTripPage /></Layout>
                </ProtectedRoute>
            } />
            <Route path="/trips/:id" element={
                <ProtectedRoute>
                    <Layout><TripDetailsPage /></Layout>
                </ProtectedRoute>
            } />
            <Route path="/matches" element={
                <ProtectedRoute>
                    <Layout><MatchesPage /></Layout>
                </ProtectedRoute>
            } />
            <Route path="/messages" element={
                <ProtectedRoute>
                    <Layout showFooter={false}><MessagesPage /></Layout>
                </ProtectedRoute>
            } />
            <Route path="/messages/:userId" element={
                <ProtectedRoute>
                    <Layout showFooter={false}><MessagesPage /></Layout>
                </ProtectedRoute>
            } />

            {/* Admin routes */}
            <Route path="/admin/*" element={
                <ProtectedRoute adminOnly>
                    <Layout><AdminDashboard /></Layout>
                </ProtectedRoute>
            } />

            {/* 404 */}
            <Route path="*" element={
                <Layout>
                    <div className="min-h-[60vh] flex items-center justify-center">
                        <div className="text-center">
                            <h1 className="text-6xl font-bold text-primary-600">404</h1>
                            <p className="text-xl text-gray-600 mt-4">Page not found</p>
                            <a href="/" className="btn-primary inline-block mt-6">Go Home</a>
                        </div>
                    </div>
                </Layout>
            } />
        </Routes>
    );
}

function App() {
    return (
        <Router>
            <AuthProvider>
                <AppRoutes />
                <Toaster
                    position="top-right"
                    toastOptions={{
                        duration: 4000,
                        style: {
                            background: '#fff',
                            color: '#374151',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                            borderRadius: '0.75rem',
                            padding: '1rem',
                        },
                        success: {
                            iconTheme: {
                                primary: '#10b981',
                                secondary: '#fff',
                            },
                        },
                        error: {
                            iconTheme: {
                                primary: '#ef4444',
                                secondary: '#fff',
                            },
                        },
                    }}
                />
            </AuthProvider>
        </Router>
    );
}

export default App;
