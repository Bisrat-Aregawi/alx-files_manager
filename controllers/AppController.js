/**
 * @module AppController
 */
import redisClient from '../utils/redis';
import dbClient from '../utils/db';

/**
 * AppController class defining 2 endpoint methods
 */
export default class AppController {
  /**
   * @function getStatus
   * @summary Determine system's connection availability by checking
   * both redis and mongodb using their respective `isAlive` methods
   * @param {object} request request object of express app
   * @param {object} response response object of express app
   */
  static getStatus(_, response) {
    response.status(200).json(
      { redis: redisClient.isAlive(), db: dbClient.isAlive() },
    );
  }

  /**
   * @function getStats
   * @summary Respond with number of users and files in database
   * @param {object} request request object of express app
   * @param {object} response response object of express app
   */
  static async getStats(_, response) {
    response.status(200).json(
      {
        users: await dbClient.nbUsers(),
        files: await dbClient.nbFiles(),
      },
    );
  }
}
