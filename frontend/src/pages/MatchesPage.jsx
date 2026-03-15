/**
 * Find Buddies Page — Trek Feed + AI Buddy Matches
 * Accessible to all visitors; posting and chatting require verification.
 */
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { matchAPI } from '../services/api';
import { trekMockAPI } from '../services/mockApi';
import { HiSearch, HiLocationMarker, HiFilter, HiPlus, HiX } from 'react-icons/hi';
import TrekCard from '../components/findBuddies/TrekCard';
import { useAuth } from '../context/AuthContext';

const DIFFICULTY_OPTIONS = ['Easy', 'Moderate', 'Challenging', 'Strenuous'];
const REGION_OPTIONS = ['Annapurna', 'Everest', 'Langtang', 'Manaslu', 'Kanchenjunga', 'Upper Mustang', 'Dolpo'];

const MatchesPage = () => {
    const { isAuthenticated, isVerified } = useAuth();
    const navigate = useNavigate();
    
    // Tab State
    const [activeTab, setActiveTab] = useState('treks'); // 'treks' or 'buddies'
    
    // Buddies State
    const [matches, setMatches] = useState([]);
    const [loadingMatches, setLoadingMatches] = useState(false);
    
    // Treks State
    const [treks, setTreks] = useState([]);
    const [loadingTreks, setLoadingTreks] = useState(true);

    // Trek-specific filters
    const [trekFilters, setTrekFilters] = useState({ region: '', difficulty: '' });
    const [showTrekFilters, setShowTrekFilters] = useState(false);

    // Buddy filters
    const [buddyFilters, setBuddyFilters] = useState({ minScore: 20, destination: '', travelStyle: '' });
    const [showBuddyFilters, setShowBuddyFilters] = useState(false);

    useEffect(() => { 
        if (activeTab === 'buddies') {
            fetchMatches(); 
        } else {
            fetchTreks();
        }
    }, [activeTab]);

    const fetchMatches = async () => {
        setLoadingMatches(true);
        try {
            const params = { ...buddyFilters };
            Object.keys(params).forEach(key => !params[key] && delete params[key]);
            const response = await matchAPI.getMatches(params);
            setMatches(response.data.data.matches || []);
        } catch (error) {
            console.error('Error fetching matches:', error);
        } finally {
            setLoadingMatches(false);
        }
    };

    const fetchTreks = async (filters = trekFilters) => {
        setLoadingTreks(true);
        try {
            const params = {};
            if (filters.region) params.region = filters.region;
            if (filters.difficulty) params.difficulty = filters.difficulty;

            const response = await trekMockAPI.getAllTreks(params);
            // Backend returns { success, count, data: [] }
            const trekList = response.data?.data || response.data?.treks || [];
            setTreks(Array.isArray(trekList) ? trekList : []);
        } catch (error) {
            console.error('Error fetching treks:', error);
        } finally {
            setLoadingTreks(false);
        }
    };

    const handleTrekFilterApply = () => {
        fetchTreks(trekFilters);
    };

    const handleTrekFilterClear = () => {
        const cleared = { region: '', difficulty: '' };
        setTrekFilters(cleared);
        fetchTreks(cleared);
    };

    const hasActiveTrekFilters = trekFilters.region || trekFilters.difficulty;

    const handlePostTrekClick = () => {
        if (!isAuthenticated) {
            navigate('/login', { state: { from: '/treks/create' } });
            return;
        }
        if (!isVerified) {
            navigate('/verify', { state: { from: '/treks/create' } });
            return;
        }
        navigate('/treks/create');
    };

    const getMatchColor = (score) => {
        if (score >= 70) return 'from-green-400 to-green-600';
        if (score >= 50) return 'from-primary-400 to-primary-600';
        return 'from-yellow-400 to-yellow-600';
    };

    return (
        <div className="container-custom py-8">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-8 pb-4 border-b border-gray-200 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Find Buddies</h1>
                    <p className="text-gray-600 mt-1">Join a trek or discover travelers who match your interests</p>
                </div>
                
                <div className="flex flex-wrap items-center gap-3">
                    {activeTab === 'treks' && (
                        <button 
                            onClick={() => setShowTrekFilters(!showTrekFilters)} 
                            className={`btn-secondary flex items-center ${hasActiveTrekFilters ? 'ring-2 ring-primary-300' : ''}`}
                        >
                            <HiFilter className="w-5 h-5 mr-2" /> 
                            Filters {hasActiveTrekFilters && <span className="ml-1 w-2 h-2 bg-primary-500 rounded-full"></span>}
                        </button>
                    )}
                    {activeTab === 'buddies' && (
                        <button onClick={() => setShowBuddyFilters(!showBuddyFilters)} className="btn-secondary">
                            <HiFilter className="w-5 h-5 mr-2 inline" /> Filters
                        </button>
                    )}
                    <button onClick={handlePostTrekClick} className="btn-primary flex items-center gap-2">
                        <HiPlus className="w-5 h-5" /> Post a Trek
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex space-x-2 mb-8 bg-gray-100/50 p-1.5 rounded-xl w-max">
                <button
                    onClick={() => setActiveTab('treks')}
                    className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                        activeTab === 'treks' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
                    }`}
                >
                    Trek Posts Feed
                </button>
                <button
                    onClick={() => setActiveTab('buddies')}
                    className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                        activeTab === 'buddies' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
                    }`}
                >
                    AI Buddy Matches
                </button>
            </div>

            {/* Trek Filters Panel */}
            {showTrekFilters && activeTab === 'treks' && (
                <div className="card mb-8 animate-fade-in">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-900">Filter Treks</h3>
                        {hasActiveTrekFilters && (
                            <button onClick={handleTrekFilterClear} className="text-sm text-red-500 hover:text-red-700 flex items-center gap-1">
                                <HiX className="w-4 h-4" /> Clear All
                            </button>
                        )}
                    </div>
                    <div className="grid md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Region</label>
                            <select 
                                value={trekFilters.region} 
                                onChange={(e) => setTrekFilters(prev => ({ ...prev, region: e.target.value }))} 
                                className="input w-full"
                            >
                                <option value="">All Regions</option>
                                {REGION_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Difficulty</label>
                            <select 
                                value={trekFilters.difficulty} 
                                onChange={(e) => setTrekFilters(prev => ({ ...prev, difficulty: e.target.value }))} 
                                className="input w-full"
                            >
                                <option value="">Any Difficulty</option>
                                {DIFFICULTY_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>
                        <div className="flex items-end">
                            <button onClick={handleTrekFilterApply} className="btn-primary w-full">Apply Filters</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Buddy Filters Panel */}
            {showBuddyFilters && activeTab === 'buddies' && (
                <div className="card mb-8 animate-fade-in">
                    <div className="grid md:grid-cols-4 gap-4">
                        <select name="minScore" value={buddyFilters.minScore} onChange={(e) => setBuddyFilters({ ...buddyFilters, minScore: e.target.value })} className="input">
                            <option value="0">All matches</option>
                            <option value="40">40%+</option>
                            <option value="60">60%+</option>
                        </select>
                        <input type="text" placeholder="Destination" value={buddyFilters.destination} onChange={(e) => setBuddyFilters({ ...buddyFilters, destination: e.target.value })} className="input" />
                        <select value={buddyFilters.travelStyle} onChange={(e) => setBuddyFilters({ ...buddyFilters, travelStyle: e.target.value })} className="input">
                            <option value="">Any style</option>
                            <option value="budget">Budget</option>
                            <option value="moderate">Moderate</option>
                            <option value="luxury">Luxury</option>
                        </select>
                        <button onClick={fetchMatches} className="btn-primary">Apply</button>
                    </div>
                </div>
            )}

            {/* TREKS TAB CONTENT */}
            {activeTab === 'treks' && (
                <>
                    {loadingTreks ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3].map(i => <div key={i} className="card animate-pulse h-64 bg-gray-100"></div>)}
                        </div>
                    ) : treks.length > 0 ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {treks.map(trek => (
                                <TrekCard key={trek.id} trek={trek} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 bg-gray-50 rounded-2xl">
                            <HiSearch className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-600 font-medium">
                                {hasActiveTrekFilters ? 'No treks match your filters.' : 'No treks found. Be the first to post!'}
                            </p>
                            {hasActiveTrekFilters ? (
                                <button onClick={handleTrekFilterClear} className="btn-secondary mt-6">Clear Filters</button>
                            ) : (
                                <button onClick={handlePostTrekClick} className="btn-primary mt-6">Post a Trek</button>
                            )}
                        </div>
                    )}
                </>
            )}

            {/* BUDDIES TAB CONTENT */}
            {activeTab === 'buddies' && (
                <>
                    {loadingMatches ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3].map(i => <div key={i} className="card animate-pulse h-48 bg-gray-100"></div>)}
                        </div>
                    ) : matches.length > 0 ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {matches.map(({ user: matchUser, matchScore }) => (
                                <div key={matchUser.id} className="card hover:shadow-lg transition-all group overflow-hidden border border-gray-100 relative">
                                    <div className="flex items-start space-x-4 relative z-10">
                                        <img src={matchUser.profile?.profilePicture || `https://ui-avatars.com/api/?name=${matchUser.profile?.fullName}`} alt="" className="w-14 h-14 rounded-full border-2 border-white shadow-sm" />
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <h3 className="font-bold text-gray-900">{matchUser.profile?.fullName}</h3>
                                                <span className={`match-score text-xs px-2 py-1 rounded-full text-white font-bold bg-gradient-to-r ${getMatchColor(matchScore)}`}>{matchScore}% Match</span>
                                            </div>
                                            <p className="text-sm text-gray-500 flex items-center mt-1"><HiLocationMarker className="w-3.5 h-3.5 mr-1" />{matchUser.profile?.nationality || 'Unknown Location'}</p>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-4 line-clamp-2 relative z-10">{matchUser.profile?.bio || 'No bio available'}</p>
                                    <div className="flex space-x-2 mt-5 pt-4 border-t border-gray-100 relative z-10">
                                        <Link to={`/users/${matchUser.id}`} className="btn-secondary flex-1 text-center text-sm py-2">View Profile</Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 bg-gray-50 rounded-2xl">
                            <HiSearch className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-600 font-medium">No buddy matches found.</p>
                            <p className="text-sm text-gray-500 mt-1">Complete your profile for better AI personalized matches!</p>
                            <Link to="/profile/edit" className="btn-primary mt-6 inline-block">Update My Profile</Link>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default MatchesPage;
