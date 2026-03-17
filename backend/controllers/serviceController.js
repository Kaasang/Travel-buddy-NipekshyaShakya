const { Service } = require('../models');

// Get all services with optional filtering by type
exports.getAllServices = async (req, res) => {
    try {
        const { type } = req.query;
        let whereClause = {};

        if (type && ['bus', 'hotel', 'trek', 'recommended'].includes(type)) {
            whereClause.type = type;
        }

        const services = await Service.findAll({
            where: whereClause,
            order: [['createdAt', 'DESC']]
        });

        res.status(200).json({
            success: true,
            count: services.length,
            data: services
        });
    } catch (error) {
        console.error('Error fetching services:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching services'
        });
    }
};

// Get single service by ID
exports.getService = async (req, res) => {
    try {
        const service = await Service.findByPk(req.params.id);

        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Service not found'
            });
        }

        res.status(200).json({
            success: true,
            data: service
        });
    } catch (error) {
        console.error('Error fetching service:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching service'
        });
    }
};

// Create a new service (Admin only)
exports.createService = async (req, res) => {
    try {
        const { type, title, description, overview, price, image, location, duration, ...metadata } = req.body;

        const service = await Service.create({
            type,
            title,
            description,
            overview,
            price: price || 0,
            image,
            location,
            duration,
            metadata
        });

        res.status(201).json({
            success: true,
            message: 'Service created successfully',
            data: service
        });
    } catch (error) {
        console.error('Error creating service:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while creating service',
            error: error.message
        });
    }
};

// Update a service (Admin only)
exports.updateService = async (req, res) => {
    try {
        let service = await Service.findByPk(req.params.id);

        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Service not found'
            });
        }

        const { type, title, description, overview, price, image, location, duration, ...metadata } = req.body;

        service = await service.update({
            type: type || service.type,
            title: title || service.title,
            description: description || service.description,
            overview: overview !== undefined ? overview : service.overview,
            price: price !== undefined ? price : service.price,
            image: image || service.image,
            location: location || service.location,
            duration: duration || service.duration,
            metadata: Object.keys(metadata).length > 0 ? { ...service.metadata, ...metadata } : service.metadata
        });

        res.status(200).json({
            success: true,
            message: 'Service updated successfully',
            data: service
        });
    } catch (error) {
        console.error('Error updating service:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating service',
            error: error.message
        });
    }
};

// Delete a service (Admin only)
exports.deleteService = async (req, res) => {
    try {
        const service = await Service.findByPk(req.params.id);

        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Service not found'
            });
        }

        await service.destroy();

        res.status(200).json({
            success: true,
            message: 'Service deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting service:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while deleting service'
        });
    }
};
