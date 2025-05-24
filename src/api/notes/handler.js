class NotesHandler {
  // eslint-disable-next-line lines-between-class-members
  #service; #validator;

  constructor(service, validator) {
    this.#service = service;
    this.#validator = validator;
  }

  postNoteHandler = async (request, h) => {
    this.#validator.validateNotePayload(request.payload);
    const { title = 'untitled', tags, body } = request.payload;

    const noteId = await this.#service.addNote({ title, tags, body });

    // Create a response
    const response = h.response({
      status: 'success',
      message: 'Catatan berhasil ditambahkan',
      data: {
        noteId,
      },
    });
    response.code(201);
    return response;
  };

  getNotesHandler = async () => {
    const notes = await this.#service.getNotes();

    // Tidak pakai h.response() karena tidak customisasi response code dsb.
    return {
      status: 'success',
      data: {
        notes,
      },
    };
  };

  getNoteByIdHandler = async (request) => {
    const { id } = request.params;
    const note = await this.#service.getNoteById(id);

    return {
      status: 'success',
      data: {
        note,
      },
    };
  };

  putNoteByIdHandler = async (request) => {
    this.#validator.validateNotePayload(request.payload);
    const { id } = request.params;

    await this.#service.editNoteById(id, request.payload);

    return {
      status: 'success',
      message: 'Catatan berhasil diperbarui',
    };
  };

  deleteNoteByIdHandler = async (request) => {
    const { id } = request.params;

    await this.#service.deleteNoteById(id);

    return {
      status: 'success',
      message: 'Catatan berhasil dihapus',
    };
  };
}

module.exports = NotesHandler;
