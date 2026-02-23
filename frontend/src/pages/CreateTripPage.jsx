/**
 * Create Trip Page
 * Form to create a new trip
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { tripAPI } from '../services/api';
import toast from 'react-hot-toast';
import { HiArrowLeft } from 'react-icons/hi';

const CreateTripPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        destination: '',
        startDate: '',
        endDate: '',
        budget: '',
        budgetType: 'moderate',
        maxGroupSize: 5,
        description: '',
        isPublic: true
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate dates
        if (new Date(formData.startDate) >= new Date(formData.endDate)) {
            toast.error('End date must be after start date');
            return;
        }

        if (new Date(formData.startDate) < new Date()) {
            toast.error('Start date cannot be in the past');
            return;
        }

        setLoading(true);
        try {
            const response = await tripAPI.createTrip(formData);
            toast.success('Trip created successfully!');
            navigate(`/trips/${response.data.data.id}`);
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to create trip';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container-custom py-8">
            <div className="max-w-2xl mx-auto">
                {/* Back button */}
                <button onClick={() => navigate(-1)} className="flex items-center text-gray-600 hover:text-gray-900 mb-6">
                    <HiArrowLeft className="w-5 h-5 mr-2" />
                    Back
                </button>

                <h1 className="text-2xl font-bold text-gray-900 mb-2">Create a New Trip</h1>
                <p className="text-gray-600 mb-8">Fill in the details to create your group adventure</p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Info */}
                    <div className="card">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Trip Details</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="label">Trip Title *</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    required
                                    minLength={5}
                                    maxLength={200}
                                    className="input"
                                    placeholder="e.g., Weekend in Paris, Backpacking through Thailand"
                                />
                            </div>

                            <div>
                                <label className="label">Destination *</label>
                                <input
                                    type="text"
                                    name="destination"
                                    value={formData.destination}
                                    onChange={handleChange}
                                    required
                                    className="input"
                                    placeholder="e.g., Paris, France"
                                />
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Start Date *</label>
                                    <input
                                        type="date"
                                        name="startDate"
                                        value={formData.startDate}
                                        onChange={handleChange}
                                        required
                                        min={new Date().toISOString().split('T')[0]}
                                        className="input"
                                    />
                                </div>
                                <div>
                                    <label className="label">End Date *</label>
                                    <input
                                        type="date"
                                        name="endDate"
                                        value={formData.endDate}
                                        onChange={handleChange}
                                        required
                                        min={formData.startDate || new Date().toISOString().split('T')[0]}
                                        className="input"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="label">Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows={5}
                                    className="input"
                                    placeholder="Describe your trip, activities planned, what you're looking for in travel buddies..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Budget & Group Size */}
                    <div className="card">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Budget & Group</h2>

                        <div className="grid md:grid-cols-3 gap-4">
                            <div>
                                <label className="label">Budget Type *</label>
                                <select
                                    name="budgetType"
                                    value={formData.budgetType}
                                    onChange={handleChange}
                                    className="input"
                                >
                                    <option value="budget">Budget</option>
                                    <option value="moderate">Moderate</option>
                                    <option value="luxury">Luxury</option>
                                </select>
                            </div>
                            <div>
                                <label className="label">Estimated Budget (Rs.)</label>
                                <input
                                    type="number"
                                    name="budget"
                                    value={formData.budget}
                                    onChange={handleChange}
                                    min="0"
                                    className="input"
                                    placeholder="e.g., 1500"
                                />
                            </div>
                            <div>
                                <label className="label">Max Group Size *</label>
                                <input
                                    type="number"
                                    name="maxGroupSize"
                                    value={formData.maxGroupSize}
                                    onChange={handleChange}
                                    required
                                    min="2"
                                    max="50"
                                    className="input"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Visibility */}
                    <div className="card">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Visibility</h2>
                        <label className="flex items-center space-x-3">
                            <input
                                type="checkbox"
                                name="isPublic"
                                checked={formData.isPublic}
                                onChange={handleChange}
                                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 w-5 h-5"
                            />
                            <div>
                                <span className="font-medium text-gray-900">Public Trip</span>
                                <p className="text-sm text-gray-500">Anyone can find and request to join this trip</p>
                            </div>
                        </label>
                    </div>

                    {/* Submit */}
                    <div className="flex justify-end space-x-4">
                        <button type="button" onClick={() => navigate('/trips')} className="btn-secondary">
                            Cancel
                        </button>
                        <button type="submit" disabled={loading} className="btn-primary">
                            {loading ? 'Creating...' : 'Create Trip'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateTripPage;
