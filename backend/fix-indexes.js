/**
 * Cleanup script to remove duplicate indexes from the users table
 * Run this once: node fix-indexes.js
 */
require('dotenv').config();
const { sequelize } = require('./config/database');

async function fixIndexes() {
    try {
        await sequelize.authenticate();
        console.log('✅ Connected to database');

        // Get all indexes on the users table
        const [indexes] = await sequelize.query(
            `SHOW INDEX FROM users WHERE Key_name != 'PRIMARY'`
        );

        console.log(`Found ${indexes.length} non-primary index entries on users table`);

        // Group by index name
        const indexNames = [...new Set(indexes.map(i => i.Key_name))];
        console.log(`Unique index names: ${indexNames.length}`);
        console.log('Indexes:', indexNames.join(', '));

        // Find duplicate-pattern indexes (e.g. email_2, email_3, email_4...)
        const duplicatePattern = /^(.+)_(\d+)$/;
        const toDrop = indexNames.filter(name => duplicatePattern.test(name));

        if (toDrop.length === 0) {
            console.log('✅ No duplicate indexes found!');
        } else {
            console.log(`\n🔧 Dropping ${toDrop.length} duplicate indexes...`);
            for (const indexName of toDrop) {
                try {
                    await sequelize.query(`DROP INDEX \`${indexName}\` ON \`users\``);
                    console.log(`  ✅ Dropped: ${indexName}`);
                } catch (err) {
                    console.log(`  ⚠️  Could not drop ${indexName}: ${err.message}`);
                }
            }
            console.log('\n✅ Cleanup complete!');
        }

        // Also check other tables
        const tables = ['profiles', 'trips', 'trip_members', 'bookings', 'notifications', 'messages', 'conversations'];
        for (const table of tables) {
            try {
                const [tableIndexes] = await sequelize.query(
                    `SHOW INDEX FROM \`${table}\` WHERE Key_name != 'PRIMARY'`
                );
                const tableIndexNames = [...new Set(tableIndexes.map(i => i.Key_name))];
                const tableDups = tableIndexNames.filter(name => duplicatePattern.test(name));
                if (tableDups.length > 0) {
                    console.log(`\n🔧 Dropping ${tableDups.length} duplicate indexes from ${table}...`);
                    for (const indexName of tableDups) {
                        try {
                            await sequelize.query(`DROP INDEX \`${indexName}\` ON \`${table}\``);
                            console.log(`  ✅ Dropped: ${indexName}`);
                        } catch (err) {
                            console.log(`  ⚠️  Could not drop ${indexName}: ${err.message}`);
                        }
                    }
                }
            } catch (err) {
                // Table might not exist, skip
            }
        }

        await sequelize.close();
        console.log('\n🎉 Done! You can now restart the server.');
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

fixIndexes();
