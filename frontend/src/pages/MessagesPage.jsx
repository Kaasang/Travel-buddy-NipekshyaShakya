/**
 * Messages Page - Chat interface with inbox
 */
import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { messageAPI } from '../services/api';
import { HiPaperAirplane, HiArrowLeft, HiChat } from 'react-icons/hi';

const MessagesPage = () => {
    const { userId, tripId } = useParams();
    const { user } = useAuth();
    const [conversations, setConversations] = useState([]);
    const [messages, setMessages] = useState([]);
    const [otherUser, setOtherUser] = useState(null);
    const [tripInfo, setTripInfo] = useState(null);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef(null);

    useEffect(() => { fetchInbox(); }, []);
    useEffect(() => { 
        if (userId) fetchConversation(userId); 
        else if (tripId) fetchTripConversation(tripId);
    }, [userId, tripId]);
    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

    const fetchInbox = async () => {
        try {
            const response = await messageAPI.getInbox();
            setConversations(response.data.data || []);
        } catch (error) { console.error('Error:', error); }
        finally { setLoading(false); }
    };

    const fetchConversation = async (id) => {
        try {
            const response = await messageAPI.getConversation(id);
            setMessages(response.data.data.messages || []);
            setOtherUser(response.data.data.otherUser);
            setTripInfo(null);
        } catch (error) { console.error('Error:', error); }
    };

    const fetchTripConversation = async (id) => {
        try {
            const response = await messageAPI.getTripMessages(id);
            setMessages(response.data.data.messages || []);
            setTripInfo(response.data.data.trip);
            setOtherUser(null);
        } catch (error) { console.error('Error:', error); }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;
        if (!userId && !tripId) return;

        try {
            if (tripId) {
                await messageAPI.sendMessage({ tripId, content: newMessage });
                fetchTripConversation(tripId);
            } else {
                await messageAPI.sendMessage({ receiverId: userId, content: newMessage });
                fetchConversation(userId);
            }
            setNewMessage('');
        } catch (error) { console.error('Error:', error); }
    };

    return (
        <div className="container-custom py-4">
            <div className="grid md:grid-cols-3 gap-4 h-[calc(100vh-140px)]">
                {/* Sidebar */}
                <div className={`card overflow-hidden ${userId ? 'hidden md:block' : ''}`}>
                    <h2 className="font-semibold text-gray-900 p-4 border-b">Messages</h2>
                    <div className="overflow-y-auto h-full">
                        {conversations.length > 0 ? conversations.map((conv) => (
                            <Link key={conv.userId} to={`/messages/${conv.userId}`}
                                className={`flex items-center space-x-3 p-4 hover:bg-gray-50 border-b ${userId == conv.userId ? 'bg-primary-50' : ''}`}>
                                <img src={conv.user?.profile?.profilePicture || `https://ui-avatars.com/api/?name=${conv.user?.profile?.fullName}`} alt="" className="w-10 h-10 rounded-full" />
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-gray-900 truncate">{conv.user?.profile?.fullName}</p>
                                    <p className="text-sm text-gray-500 truncate">{conv.lastMessage?.content}</p>
                                </div>
                                {conv.unreadCount > 0 && <span className="bg-primary-600 text-white text-xs px-2 py-1 rounded-full">{conv.unreadCount}</span>}
                            </Link>
                        )) : (
                            <div className="p-4 text-center text-gray-500">
                                <HiChat className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                                <p>No conversations yet</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Chat Area */}
                <div className="md:col-span-2 card flex flex-col overflow-hidden">
                    {(userId && otherUser) || (tripId && tripInfo) ? (
                        <>
                            {/* Header */}
                            <div className="flex items-center space-x-3 p-4 border-b">
                                <Link to="/messages" className="md:hidden"><HiArrowLeft className="w-5 h-5" /></Link>
                                
                                {tripId ? (
                                    <>
                                        <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-lg">
                                            {tripInfo?.title?.charAt(0) || 'T'}
                                        </div>
                                        <div>
                                            <p className="font-medium">{tripInfo?.title || 'Trip Group Chat'}</p>
                                            <Link to={`/trips/${tripId}`} className="text-sm text-primary-600">View trip details</Link>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <img src={otherUser?.profile?.profilePicture || `https://ui-avatars.com/api/?name=${otherUser?.profile?.fullName}`} alt="" className="w-10 h-10 rounded-full" />
                                        <div>
                                            <p className="font-medium">{otherUser?.profile?.fullName}</p>
                                            <Link to={`/users/${otherUser?.id}`} className="text-sm text-primary-600">View profile</Link>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-3 chat-scrollbar">
                                {messages.map((msg) => (
                                    <div key={msg.id} className={`flex ${msg.senderId === user.id ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[70%] px-4 py-2 rounded-2xl ${msg.senderId === user.id ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-900'}`}>
                                            {tripId && msg.senderId !== user.id && (
                                                <p className="text-xs font-semibold text-primary-600 mb-1">{msg.sender?.profile?.fullName}</p>
                                            )}
                                            <p>{msg.content}</p>
                                            <p className={`text-xs mt-1 ${msg.senderId === user.id ? 'text-primary-200' : 'text-gray-400'}`}>
                                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input */}
                            <form onSubmit={handleSend} className="p-4 border-t flex space-x-2">
                                <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type a message..." className="input flex-1" />
                                <button type="submit" disabled={!newMessage.trim()} className="btn-primary"><HiPaperAirplane className="w-5 h-5" /></button>
                            </form>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-gray-500">
                            <div className="text-center">
                                <HiChat className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                                <p>Select a conversation to start messaging</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MessagesPage;
