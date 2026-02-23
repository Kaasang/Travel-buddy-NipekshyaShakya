/**
 * Profile Page
 * View own profile with ratings and trips
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ratingAPI, tripAPI } from '../services/api';
import {
    HiPencil, HiLocationMarker, HiCalendar, HiUsers,
    HiStar, HiBadgeCheck, HiGlobe
} from 'react-icons/hi';

const ProfilePage = () => {
    const { user } = useAuth();
    const [ratings, setRatings] = useState({ ratings: [], stats: {} });
    const [trips, setTrips] = useState({ created: [], joined: [] });
    const [activeTab, setActiveTab] = useState('about');

    useEffect(() => {
        fetchProfileData();
    }, []);

    const fetchProfileData = async () => {
        try {
            const [ratingsRes, tripsRes] = await Promise.all([
                ratingAPI.getMyRatings(),
                tripAPI.getMyTrips()
            ]);
            setRatings(ratingsRes.data.data || { ratings: [], stats: {} });
            setTrips(tripsRes.data.data || { created: [], joined: [] });
        } catch (error) {
            console.error('Error fetching profile data:', error);
        }
    };

    const profile = user?.profile || {};
    const destinations = profile.preferredDestinations || [];

    return (
        <div className="container-custom py-8">
            {/* Profile Header */}
            <div className="card mb-6">
                <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
                    {/* Avatar */}
                    <div className="relative">
                        <img
                            src={profile.profilePicture || `https://ui-avatars.com/api/?name=${profile.fullName}&size=128`}
                            alt={profile.fullName}
                            className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                        />
                        {user?.isVerified && (
                            <div className="absolute bottom-0 right-0 bg-green-500 rounded-full p-1">
                                <HiBadgeCheck className="w-6 h-6 text-white" />
                            </div>
                        )}
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                            <h1 className="text-2xl font-bold text-gray-900">{profile.fullName || 'Unknown'}</h1>
                            {user?.isVerified && (
                                <span className="badge-success">Verified</span>
                            )}
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-4">
                            {profile.nationality && (
                                <span className="flex items-center">
                                    <HiLocationMarker className="w-4 h-4 mr-1" />
                                    {profile.nationality}
                                </span>
                            )}
                            {profile.age && (
                                <span>{profile.age} years old</span>
                            )}
                            {profile.travelStyle && (
                                <span className="badge-primary capitalize">{profile.travelStyle} traveler</span>
                            )}
                        </div>

                        {/* Stats */}
                        <div className="flex items-center space-x-6">
                            <div className="text-center">
                                <div className="text-xl font-bold text-gray-900">
                                    {(trips.created?.length || 0) + (trips.joined?.length || 0)}
                                </div>
                                <div className="text-sm text-gray-600">Trips</div>
                            </div>
                            <div className="text-center">
                                <div className="text-xl font-bold text-gray-900 flex items-center">
                                    <HiStar className="w-5 h-5 text-yellow-500 mr-1" />
                                    {profile.averageRating || '—'}
                                </div>
                                <div className="text-sm text-gray-600">Rating</div>
                            </div>
                            <div className="text-center">
                                <div className="text-xl font-bold text-gray-900">{profile.totalRatings || 0}</div>
                                <div className="text-sm text-gray-600">Reviews</div>
                            </div>
                        </div>
                    </div>

                    {/* Edit Button */}
                    <Link to="/profile/edit" className="btn-secondary flex items-center">
                        <HiPencil className="w-4 h-4 mr-2" />
                        Edit Profile
                    </Link>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
                <nav className="flex space-x-8">
                    {['about', 'trips', 'reviews'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${activeTab === tab
                                    ? 'border-primary-600 text-primary-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Tab Content */}
            {activeTab === 'about' && (
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Bio */}
                    <div className="card">
                        <h3 className="font-semibold text-gray-900 mb-3">About Me</h3>
                        <p className="text-gray-600">
                            {profile.bio || 'No bio added yet. Tell others about yourself!'}
                        </p>
                    </div>

                    {/* Travel Preferences */}
                    <div className="card">
                        <h3 className="font-semibold text-gray-900 mb-3">Travel Preferences</h3>
                        <div className="space-y-3">
                            {profile.travelStyle && (
                                <div className="flex items-center text-gray-600">
                                    <HiGlobe className="w-5 h-5 mr-2 text-primary-500" />
                                    <span className="capitalize">{profile.travelStyle} travel style</span>
                                </div>
                            )}
                            {profile.groupSizePreference && (
                                <div className="flex items-center text-gray-600">
                                    <HiUsers className="w-5 h-5 mr-2 text-primary-500" />
                                    <span>Prefers groups of {profile.groupSizePreference}</span>
                                </div>
                            )}
                            {(profile.availabilityStart && profile.availabilityEnd) && (
                                <div className="flex items-center text-gray-600">
                                    <HiCalendar className="w-5 h-5 mr-2 text-primary-500" />
                                    <span>
                                        Available: {new Date(profile.availabilityStart).toLocaleDateString()} - {new Date(profile.availabilityEnd).toLocaleDateString()}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Destinations */}
                    <div className="card md:col-span-2">
                        <h3 className="font-semibold text-gray-900 mb-3">Dream Destinations</h3>
                        {destinations.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {destinations.map((dest, index) => (
                                    <span key={index} className="badge-primary">
                                        {dest}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500">No destinations added yet</p>
                        )}
                    </div>

                    {/* Interests */}
                    <div className="card md:col-span-2">
                        <h3 className="font-semibold text-gray-900 mb-3">Travel Interests</h3>
                        {user?.interests?.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {user.interests.map((interest) => (
                                    <span key={interest.id} className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm">
                                        {interest.icon} {interest.name}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500">No interests added yet</p>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'trips' && (
                <div className="space-y-6">
                    <h3 className="font-semibold text-gray-900">Created Trips</h3>
                    {trips.created?.length > 0 ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {trips.created.map((trip) => (
                                <Link key={trip.id} to={`/trips/${trip.id}`} className="card hover:shadow-lg">
                                    <h4 className="font-semibold text-gray-900">{trip.title}</h4>
                                    <p className="text-sm text-gray-600 flex items-center mt-1">
                                        <HiLocationMarker className="w-4 h-4 mr-1" />
                                        {trip.destination}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-2">
                                        {new Date(trip.startDate).toLocaleDateString()}
                                    </p>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500">No trips created yet</p>
                    )}

                    <h3 className="font-semibold text-gray-900 mt-8">Joined Trips</h3>
                    {trips.joined?.length > 0 ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {trips.joined.map((trip) => (
                                <Link key={trip.id} to={`/trips/${trip.id}`} className="card hover:shadow-lg">
                                    <h4 className="font-semibold text-gray-900">{trip.title}</h4>
                                    <p className="text-sm text-gray-600 flex items-center mt-1">
                                        <HiLocationMarker className="w-4 h-4 mr-1" />
                                        {trip.destination}
                                    </p>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500">No trips joined yet</p>
                    )}
                </div>
            )}

            {activeTab === 'reviews' && (
                <div>
                    {ratings.received?.length > 0 ? (
                        <div className="space-y-4">
                            {ratings.received.map((rating) => (
                                <div key={rating.id} className="card">
                                    <div className="flex items-start space-x-4">
                                        <img
                                            src={rating.rater?.profile?.profilePicture || 'https://ui-avatars.com/api/?name=User'}
                                            alt=""
                                            className="w-10 h-10 rounded-full"
                                        />
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-2">
                                                <span className="font-medium">{rating.rater?.profile?.fullName}</span>
                                                <div className="flex text-yellow-500">
                                                    {[...Array(5)].map((_, i) => (
                                                        <HiStar key={i} className={`w-4 h-4 ${i < rating.rating ? 'fill-current' : 'opacity-30'}`} />
                                                    ))}
                                                </div>
                                            </div>
                                            {rating.review && (
                                                <p className="text-gray-600 mt-1">{rating.review}</p>
                                            )}
                                            <p className="text-xs text-gray-400 mt-2">
                                                Trip: {rating.Trip?.title}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <HiStar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500">No reviews yet</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ProfilePage;
