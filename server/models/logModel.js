const pool = require('../database/db');

const LogModel = {
  createLog: async (userId, action) => {
    await pool.query(
      'INSERT INTO activity_logs (user_id, action, timestamp) VALUES ($1, $2, NOW())',
      [userId, action]
    );
  },

  getAllLogs: async () => {
    const result = await pool.query('SELECT * FROM activity_logs ORDER BY timestamp DESC');
    return result.rows;
  }
};

module.exports = LogModel;