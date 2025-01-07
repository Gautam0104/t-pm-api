const db = require('../config/db');

async function logSession(sessionId, userId, expireTime) {
    const query = `INSERT INTO session_log (session_id, user_id, expire_time) VALUES (?, ?, ?)`;
    await db.execute(query, [sessionId, userId, expireTime]);
}

module.exports = {
    logSession,
};
