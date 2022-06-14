/**
 * @module redis
 */
import { createClient } from 'redis';
import { promisify } from 'util';

/**
 * Class representing a redis client
 */
class RedisClient {
  /**
   * @function constructor
   * @summary Creates a client to Redis.
   */
  constructor() {
    this.client = createClient();
    this.connected = true;

    this.client.on('error', (err) => {
      console.log(err.message);
      this.connected = false;
    });
    this.client.on('connect', () => {
      this.connected = true;
    });
  }

  /**
   * @function isAlive
   * @summary Return boolean about the connection state of the redis client
   */
  isAlive() {
    return this.connected;
  }

  /**
   * @function get
   * @summary Async function returns value stored in key
   * @param {string} key - Redis string key
   * @returns {PromiseLike} A resolved or rejected promise
   */
  async get(key) {
    const getAsync = promisify(this.client.GET).bind(this.client);
    return getAsync(key);
  }

  /**
   * @function set
   * @summary Async function sets a value for a set amount of time
   * @param {string} key - Redis string key to set value on
   * @param {string} value - Redis string value set on `key`
   * @param {number} duration - Duration in seconds that `value` is set on `key`
   * @returns {PromiseLike} A resolved or rejected promise
   */
  async set(key, value, duration) {
    const setAsync = promisify(this.client.SET).bind(this.client);
    return setAsync(key, value, 'EX', duration);
  }

  /**
   * @function del
   * @summary Async function deletes value on `key`
   * @param {string} key - Redis string key to delete value from
   */
  async del(key) {
    const delAsync = promisify(this.client.DEL).bind(this.client);
    delAsync(key);
  }
}
const redisClient = new RedisClient();

export default redisClient;
