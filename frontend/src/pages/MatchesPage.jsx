/**
 * Matches Page - Find compatible travel buddies
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { matchAPI } from '../services/api';
import { HiSearch, HiLocationMarker, HiStar, HiChat, HiFilter } from 'react-icons/hi';

const MatchesPage = () => {
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ minScore: 20, destination: '', travelStyle: '' });
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => { fetchMatches(); }, []);

    const fetchMatches = async () => {
        setLoading(true);
        try {
            const params = { ...filters };
            Object.keys(params).forEach(key => !params[key] && delete params[key]);
            const response = await matchAPI.getMatches(params);
            setMatches(response.data.data.matches || []);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const getMatchColor = (score) => {
        if (score >= 70) return 'from-green-400 to-green-600';
        if (score >= 50) return 'from-primary-400 to-primary-600';
        return 'from-yellow-400 to-yellow-600';
    };

    return (
        <div className="container-custom py-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Find Travel Buddies</h1>
                    <p className="text-gray-600">Discover travelers who match your interests</p>
                </div>
                <button onClick={() => setShowFilters(!showFilters)} className="btn-secondary mt-4 md:mt-0">
                    <HiFilter className="w-5 h-5 mr-2 inline" /> Filters
                </button>
            </div>

            {showFilters && (
                <div className="card mb-8">
                    <div className="grid md:grid-cols-4 gap-4">
                        <select name="minScore" value={filters.minScore} onChange={(e) => setFilters({ ...filters, minScore: e.target.value })} className="input">
                            <option value="0">All matches</option>
                            <option value="40">40%+</option>
                            <option value="60">60%+</option>
                        </select>
                        <input type="text" placeholder="Destination" value={filters.destination} onChange={(e) => setFilters({ ...filters, destination: e.target.value })} className="input" />
                        <select value={filters.travelStyle} onChange={(e) => setFilters({ ...filters, travelStyle: e.target.value })} className="input">
                            <option value="">Any style</option>
                            <option value="budget">Budget</option>
                            <option value="moderate">Moderate</option>
                            <option value="luxury">Luxury</option>
                        </select>
                        <button onClick={fetchMatches} className="btn-primary">Apply</button>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => <div key={i} className="card animate-pulse h-48"></div>)}
                </div>
            ) : matches.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {matches.map((match) => (
                        <div key={match.user.id} className="card hover:shadow-lg">
                            <div className="flex items-start space-x-4">
                                <img src={match.user.profile?.profilePicture || `https://ui-avatars.com/api/?name=${match.user.profile?.fullName}`} alt="" className="w-14 h-14 rounded-full" />
                                <div className="flex-1">
                                    <div className="flex justify-between">
                                        <h3 className="font-semibold">{match.user.profile?.fullName}</h3>
                                        <span className={`match-score text-sm w-10 h-10 bg-gradient-to-br ${getMatchColor(match.matchScore)}`}>{match.matchScore}%</span>
                                    </div>
                                    <p className="text-sm text-gray-600 flex items-center"><HiLocationMarker className="w-4 h-4 mr-1" />{match.user.profile?.nationality || 'Unknown'}</p>
                                </div>
                            </div>
                            <p className="text-sm text-gray-600 mt-3 line-clamp-2">{match.user.profile?.bio || 'No bio'}</p>
                            <div className="flex space-x-2 mt-4 pt-3 border-t">
                                <Link to={`/users/${match.user.id}`} className="btn-secondary flex-1 text-center text-sm">Profile</Link>
                                <Link to={`/messages/${match.user.id}`} className="btn-primary flex-1 text-center text-sm"><HiChat className="w-4 h-4 inline mr-1" />Chat</Link>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16">
                    <HiSearch className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">No matches found. Complete your profile for better matches!</p>
                    <Link to="/profile/edit" className="btn-primary mt-4 inline-block">Update Profile</Link>
                </div>
            )}
        </div>
    );
};

export default MatchesPage;
