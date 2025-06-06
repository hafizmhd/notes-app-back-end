const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const bcrypt = require('bcrypt');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthenticationError = require('../../exceptions/AuthenticationError');

class UsersService {
  #pool;

  constructor() {
    this.#pool = new Pool();
  }

  addUser = async ({ username, password, fullname }) => {
    // Verify if the username already exists.
    await this.verifyNewUsername(username);

    const id = `user-${nanoid(16)}`;
    const hashedPassword = await bcrypt.hash(password, 10);

    const query = {
      text: 'INSERT INTO users VALUES($1, $2, $3, $4) RETURNING id',
      values: [id, username, hashedPassword, fullname],
    };

    const result = await this.#pool.query(query);

    if (!result.rows[0]) {
      throw new InvariantError('User gagal ditambahkan');
    }

    return result.rows[0].id;
  };

  verifyNewUsername = async (username) => {
    const query = {
      text: 'SELECT * FROM users WHERE username = $1',
      values: [username],
    };

    const result = await this.#pool.query(query);

    if (result.rows.length) {
      throw new InvariantError('Gagal menambahkan user. Username sudah digunakan.');
    }
  };

  getUserById = async (userId) => {
    const query = {
      text: 'SELECT id, username, fullname FROM users WHERE id = $1',
      values: [userId],
    };

    const result = await this.#pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('User tidak ditemukan');
    }

    return result.rows[0];
  };

  verifyUsersCredential = async (username, password) => {
    const query = {
      text: 'SELECT id, password FROM users WHERE username = $1',
      values: [username],
    };

    const result = await this.#pool.query(query);

    if (!result.rows.length) {
      throw new AuthenticationError('Kredensial yang Anda berikan salah');
    }

    const { id, password: hashedPassword } = result.rows[0];

    const match = await bcrypt.compare(password, hashedPassword);

    if (!match) {
      throw new AuthenticationError('Kredensial yang Anda berikan salah');
    }

    return id;
  };

  getUsersByUsername = async (username) => {
    const query = {
      text: 'SELECT * FROM users WHERE username LIKE $1',
      values: [`%${username}%`],
    };

    const result = await this.#pool.query(query);

    return result.rows;
  };
}

module.exports = UsersService;
