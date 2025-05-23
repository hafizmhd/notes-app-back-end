const { nanoid } = require('nanoid');

class NotesService {
  #notes;

  constructor() {
    this.#notes = [];
  }

  addNote({ title, body, tags }) {
    const id = nanoid(16);
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    const newNotes = {
      title,
      tags,
      body,
      id,
      createdAt,
      updatedAt,
    };

    this.#notes.push(newNotes);

    const isSuccess = this.#notes.filter((note) => note.id === id).length > 0;

    if (!isSuccess) {
      throw new Error('Catatan gagal ditambahkan');
    }

    return id;
  }

  getNotes() {
    return this.#notes;
  }

  getNoteById(id) {
    const note = this.#notes.filter((n) => n.id === id)[0];

    // Cek apakah note ditemukan atau tidak
    if (!note) {
      throw new Error('Catatan tidak ditemukan');
    }

    return note;
  }

  editNoteById(id, { title, body, tags }) {
    const index = this.#notes.findIndex((note) => note.id === id);

    if (index === -1) {
      throw new Error('Gagal memperbarui catatan. Id tidak ditemukan');
    }

    const updatedAt = new Date().toISOString();

    this.#notes[index] = {
      ...this.#notes[index],
      title,
      tags,
      body,
      updatedAt,
    };
  }

  deleteNoteById(id) {
    const index = this.#notes.findIndex((note) => note.id === id);

    if (index === -1) {
      throw new Error('Catatan gagal dihapus. Id tidak ditemukan');
    }

    this.#notes.splice(index, 1);
  }
}

module.exports = NotesService;
