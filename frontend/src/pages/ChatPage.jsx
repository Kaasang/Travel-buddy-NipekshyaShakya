import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { chatMockAPI } from '../services/mockApi';
import { useAuth } from '../context/AuthContext';
import { HiPaperAirplane, HiOutlineChat, HiOutlineUserCircle, HiArrowLeft } from 'react-icons/hi';
import toast from 'react-hot-toast';

const ChatPage = () => {
    const { user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const messagesEndRef = useRef(null);

    const [chats, setChats] = useState([]);
    const [activeChat, setActiveChat] = useState(null);
    const [messages, setMessages] = useState([]);
    
    // States
    const [loadingChats, setLoadingChats] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);
    
    // Mobile view state (show sidebar vs show chat)
    const [showSidebarOnMobile, setShowSidebarOnMobile] = useState(true);

    /**
     * Transform backend inbox response into a normalised chat object.
     * Backend returns: { userId, user: { id, profile: { fullName, profilePicture } }, lastMessage, unreadCount }
     * We normalise to: { id, participants: [{ id, fullName, profilePicture }], lastMessage, updatedAt, unreadCount }
     */
    const normaliseInboxItem = (item) => {
        const otherId = item.userId;
        const otherProfile = item.user?.profile || {};
        return {
            id: otherId,
            participants: [
                { id: user?.id || user?._id, fullName: user?.fullName || user?.profile?.fullName || 'Me' },
                { id: otherId, fullName: otherProfile.fullName || 'User', profilePicture: otherProfile.profilePicture }
            ],
            lastMessage: item.lastMessage ? { content: item.lastMessage.content, createdAt: item.lastMessage.createdAt } : null,
            updatedAt: item.lastMessage?.createdAt || new Date().toISOString(),
            unreadCount: item.unreadCount || 0
        };
    };

    // Initial Load & Handle Location State (from "Chat with Poster" button)
    useEffect(() => {
        const loadInitialData = async () => {
            setLoadingChats(true);
            try {
                // 1. Fetch all existing chats from backend
                const res = await chatMockAPI.getUserChats(user?.id || user?._id);
                const rawInbox = res.data?.data || res.data?.chats || [];
                let fetchedChats = Array.isArray(rawInbox) ? rawInbox.map(normaliseInboxItem) : [];
                
                // 2. Check if we need to start a NEW conversation from location.state
                const state = location.state;
                if (state && state.recipientId) {
                    const existingChat = fetchedChats.find(c => 
                        c.participants.some(p => p.id === state.recipientId || p._id === state.recipientId)
                    );
                    
                    if (existingChat) {
                        // Chat exists, select it
                        selectChat(existingChat);
                    } else {
                        // Create a temporary "new" chat object for the UI
                        const tempChat = {
                            id: state.recipientId,
                            isTemporary: true,
                            participants: [
                                { id: user.id || user._id, fullName: user?.fullName || user?.profile?.fullName || 'Me' },
                                { id: state.recipientId, fullName: state.recipientName || 'Trek Poster' }
                            ],
                            lastMessage: null,
                            updatedAt: new Date().toISOString()
                        };
                        fetchedChats = [tempChat, ...fetchedChats];
                        selectChat(tempChat);
                        
                        // Prefill message if provided
                        if (state.prefilledMsg) {
                            setNewMessage(state.prefilledMsg);
                        }
                    }
                    
                    // Clear state so refresh doesn't trigger this again
                    window.history.replaceState({}, document.title);
                } else if (fetchedChats.length > 0) {
                    // Just select the first chat normally
                    selectChat(fetchedChats[0]);
                }
                
                setChats(fetchedChats);
            } catch (error) {
                console.error('Failed to load chats:', error);
                toast.error('Failed to load chats');
            } finally {
                setLoadingChats(false);
            }
        };

        loadInitialData();
    }, [location.state, user]);

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const selectChat = async (chat) => {
        setActiveChat(chat);
        setShowSidebarOnMobile(false);
        
        if (chat.isTemporary) {
            setMessages([]);
            return;
        }

        setLoadingMessages(true);
        try {
            const res = await chatMockAPI.getChatMessages(chat.id);
            // Backend returns { data: { messages, otherUser, pagination } }
            const rawMessages = res.data?.data?.messages || res.data?.messages || [];
            // Normalise message shape: ensure senderId is a plain number
            const normalisedMessages = rawMessages.map(m => ({
                ...m,
                senderId: m.senderId || m.sender?.id,
                content: m.content || m.text
            }));
            setMessages(normalisedMessages);
        } catch (error) {
            console.error('Failed to load messages:', error);
            toast.error('Failed to load messages');
        } finally {
            setLoadingMessages(false);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || sending || !activeChat) return;

        setSending(true);
        try {
            // Determine recipient
            const currentUserId = user.id || user._id;
            const recipient = activeChat.participants.find(p => p.id !== currentUserId && p._id !== currentUserId);
            const recipientId = recipient ? (recipient.id || recipient._id) : activeChat.id;

            if (!recipientId) throw new Error('Recipient not found');

            const res = await chatMockAPI.sendMessage(recipientId, currentUserId, newMessage.trim());

            // Build a local message object for immediate UI update
            const sentMsg = res.data?.data || res.data?.message || {
                senderId: currentUserId,
                content: newMessage.trim(),
                createdAt: new Date().toISOString()
            };
            const normalisedSent = {
                ...sentMsg,
                senderId: sentMsg.senderId || sentMsg.sender?.id || currentUserId,
                content: sentMsg.content || newMessage.trim()
            };

            if (activeChat.isTemporary) {
                // Refresh the chat list from server
                const updatedRes = await chatMockAPI.getUserChats(currentUserId);
                const rawInbox = updatedRes.data?.data || updatedRes.data?.chats || [];
                const newChatList = Array.isArray(rawInbox) ? rawInbox.map(normaliseInboxItem) : [];
                setChats(newChatList);

                const theNewRealChat = newChatList.find(c =>
                    c.participants.some(p => p.id === recipientId || p._id === recipientId)
                );

                if (theNewRealChat) {
                    setActiveChat(theNewRealChat);
                    const msgRes = await chatMockAPI.getChatMessages(theNewRealChat.id);
                    const rawMsgs = msgRes.data?.data?.messages || msgRes.data?.messages || [];
                    setMessages(rawMsgs.map(m => ({ ...m, senderId: m.senderId || m.sender?.id, content: m.content || m.text })));
                }
            } else {
                // Normal flow — append message locally
                setMessages(prev => [...prev, normalisedSent]);

                // Update chat list lastMessage
                setChats(prev => prev.map(c => {
                    if (c.id === activeChat.id) {
                        return { ...c, lastMessage: normalisedSent, updatedAt: new Date().toISOString() };
                    }
                    return c;
                }).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)));
            }

            setNewMessage('');
        } catch (error) {
            console.error('Failed to send message:', error);
            toast.error('Failed to send message');
        } finally {
            setSending(false);
        }
    };

    // Helper to get the "other" person in the chat
    const getOtherParticipant = (chat) => {
        if (!chat || !chat.participants) return { fullName: 'Unknown' };
        const currentUserId = user?.id || user?._id;
        return chat.participants.find(p => p.id !== currentUserId && p._id !== currentUserId) || chat.participants[0];
    };

    return (
        <div className="flex h-[calc(100vh-64px)] bg-white max-w-7xl mx-auto border-x border-gray-200 shadow-sm">
            
            {/* Sidebar (Chat List) */}
            <div className={`w-full md:w-1/3 border-r border-gray-200 flex flex-col bg-gray-50 ${showSidebarOnMobile ? 'block' : 'hidden md:flex'}`}>
                
                <div className="p-4 border-b border-gray-200 bg-white">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <HiOutlineChat className="w-6 h-6 text-primary-600" /> Messages
                    </h2>
                </div>

                <div className="flex-1 overflow-y-auto hide-scrollbar">
                    {loadingChats ? (
                        <div className="p-4 space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="flex gap-3 animate-pulse">
                                    <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                                    <div className="flex-1 space-y-2 py-1">
                                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                        <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : chats.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            <HiOutlineChat className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                            <p>No messages yet.</p>
                            <p className="text-sm mt-1">Start a conversation from a trek post!</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {chats.map(chat => {
                                const otherPerson = getOtherParticipant(chat);
                                const isSelected = activeChat?.id === chat.id;
                                
                                return (
                                    <button 
                                        key={chat.id}
                                        onClick={() => selectChat(chat)}
                                        className={`w-full text-left p-4 hover:bg-white transition-colors flex items-start gap-4 ${isSelected ? 'bg-primary-50 hover:bg-primary-50 border-l-4 border-primary-600' : 'border-l-4 border-transparent'}`}
                                    >
                                        <div className="relative">
                                            {otherPerson.profilePicture ? (
                                                <img src={otherPerson.profilePicture} alt="" className="w-12 h-12 rounded-full object-cover" />
                                            ) : (
                                                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                                                    <HiOutlineUserCircle className="w-8 h-8" />
                                                </div>
                                            )}
                                            {chat.unreadCount > 0 && (
                                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                                    {chat.unreadCount > 9 ? '9+' : chat.unreadCount}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-baseline mb-1">
                                                <h3 className="font-semibold text-gray-900 truncate pr-2">{otherPerson.fullName}</h3>
                                                {chat.lastMessage && (
                                                    <span className="text-xs text-gray-400 whitespace-nowrap">
                                                        {new Date(chat.lastMessage.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                    </span>
                                                )}
                                            </div>
                                            <p className={`text-sm truncate ${chat.isTemporary ? 'text-primary-600 italic' : 'text-gray-500'}`}>
                                                {chat.isTemporary ? 'New Conversation' : (chat.lastMessage?.content || '')}
                                            </p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className={`w-full md:w-2/3 flex flex-col bg-white ${!showSidebarOnMobile ? 'block' : 'hidden md:flex'}`}>
                
                {activeChat ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 border-b border-gray-200 flex items-center gap-3 bg-white shadow-sm z-10">
                            <button 
                                onClick={() => setShowSidebarOnMobile(true)}
                                className="md:hidden p-2 -ml-2 text-gray-500 hover:text-gray-900"
                            >
                                <HiArrowLeft className="w-5 h-5" />
                            </button>
                            
                            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
                                {getOtherParticipant(activeChat).fullName.charAt(0)}
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">{getOtherParticipant(activeChat).fullName}</h3>
                                <p className="text-xs text-gray-500">Travel Buddy</p>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 p-4 overflow-y-auto bg-gray-50 space-y-4">
                            {loadingMessages ? (
                                <div className="flex justify-center items-center h-full">
                                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="h-full flex flex-col justify-center items-center text-gray-400">
                                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-3 shadow-sm">
                                        <HiOutlineChat className="w-8 h-8 text-primary-300" />
                                    </div>
                                    <p className="text-sm">Start the conversation!</p>
                                </div>
                            ) : (
                                messages.map((msg, idx) => {
                                    const isMe = msg.senderId === user?.id || msg.senderId === user?._id;
                                    return (
                                        <div key={msg.id || idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                            <div className={`max-w-[75%] px-4 py-3 rounded-2xl ${
                                                isMe 
                                                ? 'bg-primary-600 text-white rounded-tr-sm shadow-md shadow-primary-600/20' 
                                                : 'bg-white text-gray-800 border border-gray-100 rounded-tl-sm shadow-sm'
                                            }`}>
                                                <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                                            </div>
                                            <span className="text-[10px] text-gray-400 mt-1 px-1">
                                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-white border-t border-gray-200">
                            <form onSubmit={handleSendMessage} className="flex gap-2">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type a message..."
                                    className="flex-1 input bg-gray-50 border-transparent focus:bg-white focus:border-primary-500 transition-colors"
                                    disabled={sending}
                                />
                                <button 
                                    type="submit" 
                                    disabled={!newMessage.trim() || sending}
                                    className="px-5 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 disabled:hover:bg-primary-600 transition-colors shadow-sm flex items-center justify-center"
                                >
                                    <HiPaperAirplane className="w-5 h-5 rotate-90" />
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="h-full flex flex-col justify-center items-center text-gray-400 bg-gray-50/50">
                        <HiOutlineChat className="w-16 h-16 mb-4 text-gray-300" />
                        <h3 className="text-xl font-medium text-gray-600">Your Messages</h3>
                        <p className="text-sm mt-2">Select a conversation from the sidebar to start chatting.</p>
                    </div>
                )}
            </div>

        </div>
    );
};

export default ChatPage;
