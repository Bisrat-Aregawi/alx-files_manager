/**
 * @module AuthController
 */
import sha1 from 'sha1';
import { v4 as uuidv4 } from 'uuid';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

export default class AuthController {
  /**
   * @function getConnect
   * @summary Sign in user and generate a 24 hr token after verifying
   * the user exists in the database
   *
   * @param {object} request request object of express app
   * @param {object} response response object ofalse express app
   * @returns {object} undefined
   */
  static async getConnect(request, response) {
    // Get user's email:password combo from `Authorization` field
    const authHeaderVal = request.get('Authorization');
    if (authHeaderVal === undefined) {
      response.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const emailPwdB64 = authHeaderVal.split(' ')[1];

    // Decode to utf-8
    const emailPwdCombo = Buffer.from(emailPwdB64, 'base64')
      .toString('utf-8');

    // Separate credentials accounting for ':' happening in the password
    const credObj = {};
    emailPwdCombo.split(':').forEach((field) => {
      if (credObj.email === undefined) credObj.email = field;
      else if (credObj.password === undefined) credObj.password = field;
      else credObj.password = [credObj.password, field].join(':');
    });

    // Hash the password for search convenience
    credObj.password = sha1(credObj.password);

    // Verify existance of the user in database
    const userIs = await dbClient.database.collection('users').findOne(
      credObj,
    );
    if (userIs === null) {
      response.status(401).json(
        { error: 'Unauthorized' },
      );
    } else {
      // Generate a 24 hour token and save to redis database
      const tokenFor24H = uuidv4();
      await redisClient.set(`auth_${tokenFor24H}`, userIs._id, 24 * 3600);
      // Respond with the created token to the user
      response.status(200).json(
        { token: tokenFor24H },
      );
    }
  }

  /**
   * @function getDisconnect
   * @summary Sign out user and remove associated token from redis database
   *
   * @param {object} request request object of express app
   * @param {object} response response object ofalse express app
   * @returns {object} undefined
   */
  static async getDisconnect(request, response) {
    // Check if the token has not expired yet
    const token = request.get('X-Token');
    if (token === undefined) response.status(401).json({ error: 'Unauthorized' });
    else {
      // Remove the token from redis database explicitly
      await redisClient.del(`auth_${token}`);
      response.status(204).send();
    }
  }
}
