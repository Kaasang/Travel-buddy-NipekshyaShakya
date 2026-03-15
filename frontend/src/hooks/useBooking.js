/**
 * useBooking Hook
 * Handles the "Book Now" action — checks auth, redirects to login or opens booking modal
 */

import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const useBooking = () => {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [bookingItem, setBookingItem] = useState(null);
    const [showModal, setShowModal] = useState(false);

    /**
     * Call this when the user clicks "Book Now"
     * @param {Object} service - The service object
     * @param {string} type - 'bus' | 'hotel' | 'trek'
     */
    const handleBookNow = (service, type) => {
        if (!isAuthenticated) {
            // Save return path in both location.state and localStorage (fallback)
            const returnTo = location.pathname;
            localStorage.setItem(
                'bookingRedirect',
                JSON.stringify({ from: returnTo, serviceType: type, serviceId: service.id })
            );
            navigate('/login', { state: { from: returnTo } });
            return;
        }

        // User is authenticated — open booking modal
        setBookingItem({ ...service, serviceType: type });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setBookingItem(null);
    };

    const confirmBooking = () => {
        if (!bookingItem) return;

        // Save to localStorage
        const existing = JSON.parse(localStorage.getItem('myBookings') || '[]');
        const booking = {
            id: `BK-${Date.now()}`,
            serviceId: bookingItem.id,
            serviceType: bookingItem.serviceType,
            title: bookingItem.title,
            price: bookingItem.price,
            bookedAt: new Date().toISOString(),
        };
        existing.push(booking);
        localStorage.setItem('myBookings', JSON.stringify(existing));

        closeModal();
        return booking;
    };

    return { handleBookNow, bookingItem, showModal, closeModal, confirmBooking };
};

export default useBooking;
