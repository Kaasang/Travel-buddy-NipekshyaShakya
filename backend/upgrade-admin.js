const bcrypt = require('bcryptjs');
const { User, Profile } = require('./models');

async function upgradeUserToAdmin() {
    try {
        const email = 'test@gmail.com';

        // Find the user
        const user = await User.findOne({
            where: { email }
        });

        if (!user) {
            console.log(`User ${email} not found in database! Creating instead...`);

            // Create user since they don't exist
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('123456', salt);

            const newUser = await User.create({
                email,
                password: hashedPassword,
                role: 'admin',
                isVerified: true
            });

            await Profile.create({
                userId: newUser.id,
                fullName: 'Hari Limbu',
                bio: 'Main Platform Administrator'
            });

            console.log(`Successfully created new admin: ${email}`);
            process.exit(0);
        }

        // Upgrade existing user
        console.log(`Found existing user: ${email}. Promoting to admin...`);

        await user.update({
            role: 'admin',
            password: '123456' // Handled by Sequelize beforeUpdate hook
        });

        console.log(`Successfully upgraded ${email} to admin role with new password.`);
        process.exit(0);

    } catch (error) {
        console.error('Error updating user:', error);
        process.exit(1);
    }
}

upgradeUserToAdmin();
