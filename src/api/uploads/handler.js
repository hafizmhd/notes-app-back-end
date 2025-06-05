class UploadsHandler {
  #service; #validator;

  constructor(service, validator) {
    this.#service = service;
    this.#validator = validator;
  }

  postUploadImageHandler = async (request, h) => {
    const { data } = request.payload;
    this.#validator.validateImageHeaders(data.hapi.headers);

    const filename = await this.#service.writeFile(data, data.hapi);

    const response = h.response({
      status: 'success',
      data: {
        fileLocation: `http://${process.env.HOST}:${process.env.PORT}/upload/images/${filename}`,
      },
    });
    response.code(201);
    return response;
  };
}

module.exports = UploadsHandler;
