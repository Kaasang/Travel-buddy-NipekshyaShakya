/**
 * User Profile Page - View another user's profile
 */
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userAPI, matchAPI, ratingAPI } from '../services/api';
import { HiLocationMarker, HiStar, HiChat, HiFlag, HiCalendar, HiUsers, HiBadgeCheck } from 'react-icons/hi';

const UserProfilePage = () => {
    const { id } = useParams();
    const { user: currentUser } = useAuth();
    const [userData, setUserData] = useState(null);
    const [matchData, setMatchData] = useState(null);
    const [ratings, setRatings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchUserData(); }, [id]);

    const fetchUserData = async () => {
        try {
            const [userRes, matchRes, ratingsRes] = await Promise.all([
                userAPI.getUser(id),
                matchAPI.getMatchWithUser(id),
                ratingAPI.getUserRatings(id)
            ]);
            setUserData(userRes.data.data);
            setMatchData(matchRes.data.data);
            setRatings(ratingsRes.data.data.ratings || []);
        } catch (error) { console.error('Error:', error); }
        finally { setLoading(false); }
    };

    if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary-600"></div></div>;
    if (!userData) return <div className="container-custom py-8 text-center"><p>User not found</p></div>;

    const profile = userData.profile || {};
    const isOwnProfile = currentUser?.id === parseInt(id);

    return (
        <div className="container-custom py-8">
            <div className="grid lg:grid-cols-3 gap-8">
                {/* Main Profile */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="card">
                        <div className="flex items-start space-x-6">
                            <div className="relative">
                                <img src={profile.profilePicture || `https://ui-avatars.com/api/?name=${profile.fullName}&size=128`} alt="" className="w-24 h-24 rounded-full object-cover" />
                                {userData.isVerified && <div className="absolute bottom-0 right-0 bg-green-500 rounded-full p-1"><HiBadgeCheck className="w-5 h-5 text-white" /></div>}
                            </div>
                            <div className="flex-1">
                                <h1 className="text-2xl font-bold text-gray-900">{profile.fullName}</h1>
                                <div className="flex flex-wrap items-center gap-3 text-gray-600 mt-2">
                                    {profile.nationality && <span className="flex items-center"><HiLocationMarker className="w-4 h-4 mr-1" />{profile.nationality}</span>}
                                    {profile.age && <span>{profile.age} years old</span>}
                                    {profile.travelStyle && <span className="badge-primary capitalize">{profile.travelStyle}</span>}
                                </div>
                                <div className="flex items-center space-x-4 mt-3">
                                    <span className="flex items-center"><HiStar className="w-5 h-5 text-yellow-500 mr-1" />{profile.averageRating || '—'}</span>
                                    <span className="text-gray-500">({profile.totalRatings || 0} reviews)</span>
                                </div>
                            </div>
                        </div>

                        {profile.bio && (
                            <div className="mt-6 pt-6 border-t">
                                <h3 className="font-semibold mb-2">About</h3>
                                <p className="text-gray-600">{profile.bio}</p>
                            </div>
                        )}
                    </div>

                    {/* Interests */}
                    {userData.interests?.length > 0 && (
                        <div className="card">
                            <h3 className="font-semibold mb-4">Interests</h3>
                            <div className="flex flex-wrap gap-2">
                                {userData.interests.map(i => <span key={i.id} className="px-3 py-1 bg-gray-100 rounded-full text-sm">{i.icon} {i.name}</span>)}
                            </div>
                        </div>
                    )}

                    {/* Reviews */}
                    <div className="card">
                        <h3 className="font-semibold mb-4">Reviews ({ratings.length})</h3>
                        {ratings.length > 0 ? (
                            <div className="space-y-4">
                                {ratings.slice(0, 5).map(r => (
                                    <div key={r.id} className="flex space-x-3 pb-4 border-b last:border-0">
                                        <img src={r.rater?.profile?.profilePicture || 'https://ui-avatars.com/api/?name=U'} alt="" className="w-10 h-10 rounded-full" />
                                        <div>
                                            <div className="flex items-center space-x-2">
                                                <span className="font-medium">{r.rater?.profile?.fullName}</span>
                                                <div className="flex text-yellow-500">{[...Array(5)].map((_, i) => <HiStar key={i} className={`w-4 h-4 ${i < r.rating ? '' : 'opacity-30'}`} />)}</div>
                                            </div>
                                            {r.review && <p className="text-gray-600 text-sm mt-1">{r.review}</p>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : <p className="text-gray-500">No reviews yet</p>}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Match Score */}
                    {matchData && !isOwnProfile && (
                        <div className="card text-center">
                            <div className="match-score w-20 h-20 text-2xl mx-auto mb-3">{matchData.matchScore}%</div>
                            <p className="text-gray-600">Match with you</p>
                            {matchData.breakdown?.commonInterests?.length > 0 && (
                                <p className="text-sm text-gray-500 mt-2">Common: {matchData.breakdown.commonInterests.slice(0, 3).join(', ')}</p>
                            )}
                        </div>
                    )}

                    {/* Actions */}
                    {!isOwnProfile && (
                        <div className="card space-y-3">
                            <Link to={`/messages/${id}`} className="btn-primary w-full flex items-center justify-center"><HiChat className="w-5 h-5 mr-2" />Send Message</Link>
                            <button className="btn-ghost w-full flex items-center justify-center"><HiFlag className="w-5 h-5 mr-2" />Report User</button>
                        </div>
                    )}

                    {/* Travel Preferences */}
                    <div className="card">
                        <h3 className="font-semibold mb-3">Travel Info</h3>
                        <div className="space-y-2 text-sm text-gray-600">
                            {profile.groupSizePreference && <p className="flex items-center"><HiUsers className="w-4 h-4 mr-2" />Groups of {profile.groupSizePreference}</p>}
                            {profile.availabilityStart && <p className="flex items-center"><HiCalendar className="w-4 h-4 mr-2" />Available from {new Date(profile.availabilityStart).toLocaleDateString()}</p>}
                        </div>
                    </div>

                    {/* Destinations */}
                    {profile.preferredDestinations?.length > 0 && (
                        <div className="card">
                            <h3 className="font-semibold mb-3">Dream Destinations</h3>
                            <div className="flex flex-wrap gap-2">{profile.preferredDestinations.map((d, i) => <span key={i} className="badge-primary">{d}</span>)}</div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserProfilePage;
