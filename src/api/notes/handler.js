const ClientError = require('../../exceptions/ClientError');

class NotesHandler {
  // eslint-disable-next-line lines-between-class-members
  #service; #validator;

  constructor(service, validator) {
    this.#service = service;
    this.#validator = validator;
  }

  postNoteHandler = (request, h) => {
    try {
      this.#validator.validateNotePayload(request.payload);
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
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      response.code(500);
      console.error(error);
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
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      // Server Error
      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  };

  putNoteByIdHandler = (request, h) => {
    try {
      this.#validator.validateNotePayload(request.payload);

      const { id } = request.params;
      this.#service.editNoteById(id, request.payload);

      return {
        status: 'success',
        message: 'Catatan berhasil diperbarui',
      };
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      // Server Error
      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      response.code(500);
      console.error(error);
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
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      // Server Error
      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  };
}

module.exports = NotesHandler;
