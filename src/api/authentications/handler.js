class AuthenticationsHandler {
  #authenticationsService; #usersService; #tokenManager; #validator;

  constructor(authenticationsService, usersService, tokenManager, validator) {
    this.#authenticationsService = authenticationsService;
    this.#usersService = usersService;
    this.#tokenManager = tokenManager;
    this.#validator = validator;
  }

  postAuthenticationHandler = async (request, h) => {
    this.#validator.validatePostAuthenticationPayload(request.payload);

    // Login
    const { username, password } = request.payload;
    const id = await this.#usersService.verifyUsersCredential(username, password);

    // Generate Token
    const accessToken = this.#tokenManager.generateAccessToken({ id });
    const refreshToken = this.#tokenManager.generateRefreshToken({ id });

    // Save refreshToken to database
    await this.#authenticationsService.addRefreshToken(refreshToken);

    const response = h.response({
      status: 'success',
      message: 'Authentication berhasil ditambahkan',
      data: {
        accessToken,
        refreshToken,
      },
    });
    response.code(201);
    return response;
  };

  putAuthenticationHandler = async (request) => {
    this.#validator.validatePutAuthenticationPayload(request.payload);

    // Verify refresh token
    const { refreshToken } = request.payload;
    await this.#authenticationsService.verifyRefreshToken(refreshToken);
    const { id } = this.#tokenManager.verifyRefreshToken(refreshToken);

    // Generate access token
    const accessToken = this.#tokenManager.generateAccessToken({ id });

    return {
      status: 'success',
      message: 'Access Token berhasil diperbarui',
      data: {
        accessToken,
      },
    };
  };

  deleteAuthenticationHandler = async (request) => {
    this.#validator.validateDeleteAuthenticationPayload(request.payload);

    const { refreshToken } = request.payload;
    await this.#authenticationsService.verifyRefreshToken(refreshToken);
    await this.#authenticationsService.deleteRefreshToken(refreshToken);

    return {
      status: 'success',
      message: 'Refresh token berhasil dihapus',
    };
  };
}

module.exports = AuthenticationsHandler;
