class CollaborationsHandler {
  #collaborationsService; #notesService; #validator;

  constructor(collaborationsService, notesService, validator) {
    this.#collaborationsService = collaborationsService;
    this.#notesService = notesService;
    this.#validator = validator;
  }

  postCollaborationHandler = async (request, h) => {
    this.#validator.validateCollaborationPayload(request.payload);
    const { noteId, userId } = request.payload;
    const { id: credentialId } = request.auth.credentials;

    await this.#notesService.verifyNoteOwner(noteId, credentialId);
    const collaborationId = await this.#collaborationsService.addCollaboration(noteId, userId);

    const response = h.response({
      status: 'success',
      message: 'Kolaborasi berhasil ditambahkan',
      data: {
        collaborationId,
      },
    });
    response.code(201);
    return response;
  };

  deleteCollaborationHandler = async (request) => {
    this.#validator.validateCollaborationPayload(request.payload);
    const { noteId, userId } = request.payload;
    const { id: credentialId } = request.auth.credentials;

    await this.#notesService.verifyNoteOwner(noteId, credentialId);
    await this.#collaborationsService.deleteCollaboration(noteId, userId);

    return {
      status: 'success',
      message: 'Kolaborasi berhasil dihapus',
    };
  };
}

module.exports = CollaborationsHandler;
