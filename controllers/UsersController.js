/**
 * @module UsersController
 */
import sha1 from 'sha1';
import mongo from 'mongodb';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

export default class UsersController {
  /**
   * @function postNew
   * @summary Save new user to mongo database
   *
   * @param {object} request request object of express app
   * @param {object} response response object of express app
   * @returns {object} undefined
   */
  static async postNew(request, response) {
    // Check if email is passed before database query
    const { email } = request.body;
    if (email === undefined) {
      response.status(400).json(
        { error: 'Missing email' },
      );
      return;
    }
    // Check if password is passed before database query
    let passwd = request.body.password;
    if (passwd === undefined) {
      response.status(400).json(
        { error: 'Missing password' },
      );
      return;
    }
    // Check if user already exists in database
    const dbEmail = await dbClient.database.collection('users').findOne(
      { email },
    );
    // Register new user to database
    if (dbEmail === null) {
      passwd = sha1(passwd);
      const newUser = await dbClient.database.collection('users').insertOne(
        { email, password: passwd },
      );
      response.status(201).send(
        { id: newUser.insertedId, email },
      );
    } else {
      response.status(400).json(
        { error: 'Already exist' },
      );
    }
  }

  /**
   * @function getMe
   * @summary Retrieve the user based on the token provided
   *
   * @param {object} request request object of express app
   * @param {object} response response object of express app
   * @returns {object} undefined
   */
  static async getMe(request, response) {
    // Check if the token is provided
    const token = request.get('X-Token');
    if (token !== undefined) {
      const usrId = await redisClient.get(`auth_${token}`);
      if (usrId !== null) {
        const usr = await dbClient.database.collection('users')
          .findOne({ _id: mongo.ObjectID(usrId) });
        response.status(200).json(
          { id: usrId, email: usr.email },
        );
      } else response.status(401).json({ error: 'Unauthorized' });
    } else response.status(401).json({ error: 'Unauthorized' });
  }
}
