const pool = require('../utils/pool');

module.exports = class GithubUser {
  username;
  email;
  avatar;

  constructor(row) {
    this.username = row.username;
    this.email = row.email;
    this.avatar = row.avatar;
  }

  static async insert({ username, email, avatar }) {
    if (!username) throw new Error('Username is required');

    const { rows } = await pool.query(
      `
      INSERT INTO ghusers (username, email, avatar)
      VALUES ($1, $2, $3)
      RETURNING *
    `,
      [username, email, avatar]
    );

    return new GithubUser(rows[0]);
  }

  static async findByUsername(username) {
    const { rows } = await pool.query(
      `
      SELECT *
      FROM ghusers
      WHERE username=$1
      `,
      [username]
    );

    if (!rows[0]) return null;

    return new GithubUser(rows[0]);
  }

  toJSON() {
    return { ...this };
  }
};
