const db = require('../config/db');

async function createUser(username, password, first_name, last_name, role_id) {
    const query = 'INSERT INTO users (username, password, first_name, last_name, role_id) VALUES (?, ?, ?, ?, ?)';
    await db.execute(query, [username, password, first_name, last_name, role_id]);
}

async function findUserByUsername(username) {
    const query = `SELECT * FROM users WHERE username = ?`;
    const [users] = await db.execute(query, [username]);
    return users[0];
}

module.exports = {
    createUser,
    findUserByUsername,
};
