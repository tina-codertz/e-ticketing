const pool = require('../database/db');

const UserModel = {
  createUser: async (name, email, passwordHash, role = 'user') => {
    const result = await pool.query(
      'INSERT INTO users (name, email, password_hash, role, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING user_id, name, email, role',
      [name, email, passwordHash, role]
    );
    return result.rows[0];
  },

  findUserByEmail: async (email) => {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0];
  },

  findUserById: async (userId) => {
    const result = await pool.query('SELECT user_id, name, email, role FROM users WHERE user_id = $1', [userId]);
    return result.rows[0];
  },

  getAllUsers: async () => {
    const result = await pool.query('SELECT user_id, name, email, role FROM users');
    return result.rows;
  }
};

module.exports = UserModel;