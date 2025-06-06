const redis = require('redis');

class CacheService {
  #client;

  constructor() {
    this.#client = redis.createClient({
      socket: {
        host: process.env.REDIS_SERVER,
      },
    });

    this.#client.on('error', (error) => {
      console.error(error);
    });

    this.#client.connect();
  }

  set = async (key, value, expirationInSecond = 3600) => {
    await this.#client.set(key, value, {
      expiration: {
        type: 'EX',
        value: expirationInSecond,
      },
    });
  };

  get = async (key) => {
    const result = await this.#client.get(key);

    if (result == null) throw new Error('Cache tidak ditemukan');

    return result;
  };

  delete = (key) => this.#client.del(key);
}

module.exports = CacheService;
