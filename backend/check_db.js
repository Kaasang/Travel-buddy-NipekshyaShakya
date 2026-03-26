const { Sequelize } = require('sequelize');
const sequelize = new Sequelize('travel_buddy', 'root', '1234', { host: 'localhost', dialect: 'mysql', logging: false });

async function check() {
    try {
        const [results, metadata] = await sequelize.query("DESCRIBE verification_requests;");
        console.log(JSON.stringify(results, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}
check();
