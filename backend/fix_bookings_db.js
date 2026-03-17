const { sequelize } = require('./config/database');

async function fixDB() {
    try {
        console.log('Altering Bookings table...');
        
        await sequelize.query("ALTER TABLE bookings ADD COLUMN payment_status ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending';");
        console.log('Added payment_status column');

        await sequelize.query("ALTER TABLE bookings ADD COLUMN payment_receipt VARCHAR(255) NULL;");
        console.log('Added payment_receipt column');

        console.log('Successfully altered bookings table!');
    } catch (error) {
        console.error('Error altering table:', error);
    }
    process.exit(0);
}

fixDB();
