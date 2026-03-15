/**
 * Services Page
 * Browse Bus, Hotel, and Trekking services with category tabs
 */

import { useState } from 'react';
import { HiTruck, HiOfficeBuilding, HiFlag } from 'react-icons/hi';
import { busServices, hotelServices, trekServices } from '../data/servicesData';
import ServiceCard from '../components/ServiceCard';
import BookingModal from '../components/BookingModal';
import useBooking from '../hooks/useBooking';

const tabs = [
    { key: 'bus', label: 'Bus & Transport', icon: HiTruck, data: busServices },
    { key: 'hotel', label: 'Hotels & Stays', icon: HiOfficeBuilding, data: hotelServices },
    { key: 'trek', label: 'Trekking Packages', icon: HiFlag, data: trekServices },
];

const ServicesPage = () => {
    const [activeTab, setActiveTab] = useState('bus');
    const { handleBookNow, bookingItem, showModal, closeModal, confirmBooking } = useBooking();

    const currentTab = tabs.find((t) => t.key === activeTab);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero */}
            <section className="relative overflow-hidden bg-gradient-to-br from-primary-700 via-primary-600 to-accent-dark py-16 lg:py-24">
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-primary-400/20 rounded-full blur-3xl" />

                <div className="container-custom relative z-10 text-center">
                    <p className="inline-block text-sm font-semibold tracking-wider text-primary-200 uppercase mb-4 bg-white/10 px-4 py-1.5 rounded-full">
                        Everything you need
                    </p>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4">
                        Our Services
                    </h1>
                    <p className="text-lg md:text-xl text-primary-100 max-w-2xl mx-auto">
                        Book buses, find the best hotels, and choose from curated trekking
                        packages — all in one place.
                    </p>
                </div>
            </section>

            {/* Tabs + Content */}
            <section className="py-12 lg:py-16">
                <div className="container-custom">
                    {/* Category Tabs */}
                    <div className="flex flex-wrap justify-center gap-2 mb-10">
                        {tabs.map((tab) => {
                            const isActive = activeTab === tab.key;
                            return (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key)}
                                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-medium text-sm transition-all
                                        ${isActive
                                            ? 'bg-primary-600 text-white shadow-lg shadow-primary-200'
                                            : 'bg-white text-gray-600 border border-gray-200 hover:border-primary-300 hover:text-primary-600'
                                        }`}
                                >
                                    <tab.icon className="w-5 h-5" />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* Card Grid */}
                    {currentTab && currentTab.data.length > 0 ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {currentTab.data.map((service) => (
                                <ServiceCard
                                    key={service.id}
                                    service={service}
                                    type={activeTab}
                                    onBookNow={handleBookNow}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20">
                            <p className="text-gray-400 text-lg">No services available in this category yet.</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Booking Modal */}
            {showModal && (
                <BookingModal
                    item={bookingItem}
                    onClose={closeModal}
                    onConfirm={confirmBooking}
                />
            )}
        </div>
    );
};

export default ServicesPage;
