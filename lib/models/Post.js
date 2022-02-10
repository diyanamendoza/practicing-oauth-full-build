const pool = require('../utils/pool');

module.exports = class Post {
  id;
  post;
  username;

  constructor(row) {
    this.id = row.id;
    this.post = row.post;
    this.username = row.username;
  }

  static async getAll() {
    const { rows } = await pool.query('SELECT * FROM posts;');
    const posts = rows.map((row) => new Post(row));

    return posts;
  }

  static async insert({ post, username }) {
    const { rows } = await pool.query(
      `INSERT INTO posts (post, username) VALUES ($1, $2) RETURNING *`,
      [post, username]
    );
    return new Post(rows[0]);
  }
};
