const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const { mapDBToModel } = require('../../utils');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationError = require('../../exceptions/AuthorizationError');

class NotesService {
  #pool; #collaborationsService; #cacheService;

  constructor(collaborationsService, cacheService) {
    this.#pool = new Pool();
    this.#collaborationsService = collaborationsService;
    this.#cacheService = cacheService;
  }

  addNote = async ({
    title, body, tags, owner,
  }) => {
    const id = nanoid(16);
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    const query = {
      text: 'INSERT INTO notes VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      values: [id, title, body, tags, createdAt, updatedAt, owner],
    };

    const result = await this.#pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Catatan gagal ditambahkan');
    }

    await this.#cacheService.delete(`notes:${owner}`);
    return result.rows[0].id;
  };

  getNotes = async (owner) => {
    try {
      const result = await this.#cacheService.get(`notes:${owner}`);
      return JSON.parse(result);
    } catch (error) {
      const query = {
        text: `SELECT notes.* FROM notes
        LEFT JOIN collaborations ON collaborations.note_id = notes.id
        WHERE notes.owner = $1 OR collaborations.user_id = $1
        GROUP BY notes.id`,
        values: [owner],
      };

      const result = await this.#pool.query(query);
      const mappedResult = result.rows.map(mapDBToModel);

      await this.#cacheService.set(`notes:${owner}`, JSON.stringify(mappedResult));
      return mappedResult;
    }
  };

  getNoteById = async (id) => {
    const query = {
      text: `SELECT notes.*, users.username
      FROM notes
      LEFT JOIN users ON notes.owner=users.id
      WHERE notes.id = $1`,
      values: [id],
    };

    const result = await this.#pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Catatan tidak ditemukan');
    }

    return result.rows.map(mapDBToModel)[0];
  };

  editNoteById = async (id, { title, body, tags }) => {
    const updatedAt = new Date().toISOString();

    const query = {
      text: 'UPDATE notes SET title = $1, body = $2, tags = $3, updated_at = $4 WHERE id = $5 RETURNING id, owner',
      values: [title, body, tags, updatedAt, id],
    };

    const result = await this.#pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui catatan. Id tidak ditemukan');
    }

    const { owner } = result.rows[0];
    await this.#cacheService.delete(`notes:${owner}`);
  };

  deleteNoteById = async (id) => {
    const query = {
      text: 'DELETE FROM notes WHERE id = $1 RETURNING id, owner',
      values: [id],
    };
    const result = await this.#pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Catatan gagal dihapus. Id tidak ditemukan');
    }

    const { owner } = result.rows[0];
    await this.#cacheService.delete(`notes:${owner}`);
  };

  verifyNoteOwner = async (id, owner) => {
    const query = {
      text: 'SELECT * FROM notes WHERE id = $1',
      values: [id],
    };

    const result = await this.#pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Catatan tidak ditemukan');
    }

    const note = result.rows[0];

    if (note.owner !== owner) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  };

  verifyNoteAccess = async (noteId, userId) => {
    try {
      await this.verifyNoteOwner(noteId, userId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      try {
        await this.#collaborationsService.verifyCollaborator(noteId, userId);
      } catch {
        throw error;
      }
    }
  };
}

module.exports = NotesService;
