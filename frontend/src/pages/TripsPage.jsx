/**
 * Trips Page
 * Browse and filter available trips
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { tripAPI } from '../services/api';
import { HiPlus, HiSearch, HiLocationMarker, HiCalendar, HiUsers } from 'react-icons/hi';

const TripsPage = () => {
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        destination: '',
        budgetType: '',
        status: 'open'
    });
    const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

    useEffect(() => {
        fetchTrips();
    }, [filters]);

    const fetchTrips = async (page = 1) => {
        setLoading(true);
        try {
            const params = { ...filters, page, limit: 12 };
            Object.keys(params).forEach(key => !params[key] && delete params[key]);

            const response = await tripAPI.getTrips(params);
            setTrips(response.data.data.trips || []);
            setPagination(response.data.data.pagination || { page: 1, pages: 1, total: 0 });
        } catch (error) {
            console.error('Error fetching trips:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    return (
        <div className="container-custom py-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Explore Trips</h1>
                    <p className="text-gray-600">Find and join exciting group adventures</p>
                </div>
                <Link to="/trips/create" className="btn-primary mt-4 md:mt-0 inline-flex items-center">
                    <HiPlus className="w-5 h-5 mr-2" />
                    Create Trip
                </Link>
            </div>

            {/* Filters */}
            <div className="card mb-8">
                <div className="grid md:grid-cols-4 gap-4">
                    <div className="relative">
                        <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            name="destination"
                            value={filters.destination}
                            onChange={handleFilterChange}
                            placeholder="Search destination..."
                            className="input pl-10"
                        />
                    </div>
                    <select name="budgetType" value={filters.budgetType} onChange={handleFilterChange} className="input">
                        <option value="">All Budgets</option>
                        <option value="budget">Budget</option>
                        <option value="moderate">Moderate</option>
                        <option value="luxury">Luxury</option>
                    </select>
                    <select name="status" value={filters.status} onChange={handleFilterChange} className="input">
                        <option value="open">Open for Joining</option>
                        <option value="planning">Planning</option>
                        <option value="full">Full</option>
                    </select>
                    <button onClick={() => fetchTrips()} className="btn-secondary">
                        Apply Filters
                    </button>
                </div>
            </div>

            {/* Trips Grid */}
            {loading ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="card animate-pulse">
                            <div className="h-40 bg-gray-200 rounded-lg mb-4"></div>
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        </div>
                    ))}
                </div>
            ) : trips.length > 0 ? (
                <>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {trips.map((trip) => (
                            <Link
                                key={trip.id}
                                to={`/trips/${trip.id}`}
                                className="card hover:shadow-lg transition-shadow group"
                            >
                                {/* Cover Image */}
                                <div className="h-40 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                                    {trip.coverImage && trip.coverImage !== '/uploads/default-trip.jpg' ? (
                                        <img src={trip.coverImage} alt={trip.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <img src="/images/himalayas/scenery.jpg" alt="Default Trip Cover" className="w-full h-full object-cover" />
                                    )}
                                </div>

                                {/* Content */}
                                <div className="space-y-2">
                                    <div className="flex items-start justify-between">
                                        <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2">
                                            {trip.title}
                                        </h3>
                                        <span className={`badge ${trip.status === 'open' ? 'badge-success' : 'badge-warning'} capitalize`}>
                                            {trip.status}
                                        </span>
                                    </div>

                                    <p className="flex items-center text-gray-600 text-sm">
                                        <HiLocationMarker className="w-4 h-4 mr-1 flex-shrink-0" />
                                        {trip.destination}
                                    </p>

                                    <div className="flex items-center justify-between text-sm text-gray-500">
                                        <span className="flex items-center">
                                            <HiCalendar className="w-4 h-4 mr-1" />
                                            {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                                        <span className="flex items-center text-sm text-gray-600">
                                            <HiUsers className="w-4 h-4 mr-1" />
                                            {trip.currentMembers}/{trip.maxGroupSize}
                                        </span>
                                        <span className="flex items-center text-sm text-gray-600">
                                            <span className="font-semibold mr-1">Rs.</span>
                                            <span className="capitalize">{trip.budgetType}</span>
                                        </span>
                                    </div>

                                    {/* Creator */}
                                    <div className="flex items-center pt-2">
                                        <img
                                            src={trip.creator?.profile?.profilePicture || `https://ui-avatars.com/api/?name=${trip.creator?.profile?.fullName}`}
                                            alt=""
                                            className="w-6 h-6 rounded-full mr-2"
                                        />
                                        <span className="text-xs text-gray-500">
                                            by {trip.creator?.profile?.fullName}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* Pagination */}
                    {pagination.pages > 1 && (
                        <div className="flex justify-center mt-8 space-x-2">
                            {[...Array(pagination.pages)].map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => fetchTrips(i + 1)}
                                    className={`px-4 py-2 rounded-lg ${pagination.page === i + 1
                                        ? 'bg-primary-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                    )}
                </>
            ) : (
                <div className="text-center py-16">
                    <HiLocationMarker className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No trips found</h3>
                    <p className="text-gray-600 mb-6">Be the first to create a trip to this destination!</p>
                    <Link to="/trips/create" className="btn-primary inline-flex items-center">
                        <HiPlus className="w-5 h-5 mr-2" />
                        Create a Trip
                    </Link>
                </div>
            )}
        </div>
    );
};

export default TripsPage;
