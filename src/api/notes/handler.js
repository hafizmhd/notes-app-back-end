class NotesHandler {
  #service;

  constructor(service) {
    this.#service = service;
  }

  postNoteHandler = (request, h) => {
    try {
      const { title = 'untitled', tags, body } = request.payload;

      const noteId = this.#service.addNote({ title, tags, body });

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
    } catch (error) {
      const response = h.response({
        status: 'fail',
        message: error.message,
      });
      response.code(400);
      return response;
    }
  };

  getNotesHandler = () => {
    const notes = this.#service.getNotes();

    // Tidak pakai h.response() karena tidak customisasi response code dsb.
    return {
      status: 'success',
      data: {
        notes,
      },
    };
  };

  getNoteByIdHandler = (request, h) => {
    try {
      const { id } = request.params;
      const note = this.#service.getNoteById(id);

      return {
        status: 'success',
        data: {
          note,
        },
      };
    } catch (error) {
      const response = h.response({
        status: 'fail',
        message: error.message,
      });
      response.code(404);
      return response;
    }
  };

  putNoteByIdHandler = (request, h) => {
    try {
      const { id } = request.params;
      this.#service.editNoteById(id, request.payload);

      return {
        status: 'success',
        message: 'Catatan berhasil diperbarui',
      };
    } catch (error) {
      const response = h.response({
        status: 'fail',
        message: error.message,
      });
      response.code(404);
      return response;
    }
  };

  deleteNoteByIdHandler = (request, h) => {
    try {
      const { id } = request.params;

      this.#service.deleteNoteById(id);

      return {
        status: 'success',
        message: 'Catatan berhasil dihapus',
      };
    } catch (error) {
      const response = h.response({
        status: 'fail',
        message: error.message,
      });
      response.code(404);
      return response;
    }
  };
}

module.exports = NotesHandler;
