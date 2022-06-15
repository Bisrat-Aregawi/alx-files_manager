/**
 * @module FilesController
 */
import mongo from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import { writeFile } from 'fs/promises';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

export default class FilesController {
  /**
   * @function postUpload
   * @summary create new file in the database
   *
   * @param {object} request - request object of an express app
   * @param {object} response - response object of an express app
   * @returns {object} undefined
   */
  static async postUpload(request, response) {
    const verification = await FilesController.verification(request.body, response);
    if (verification === 'passed') {
      const usrId = await redisClient.get(`auth_${request.get('X-Token')}`);
      if (usrId !== null) {
        const file = {
          name: request.body.name,
          type: request.body.type,
        };
        // Assign a parent id if passed else a 0 (parentId verified using verification method)
        if (Object.hasOwn(request.body, 'parentId') === true) {
          file.parentId = mongo.ObjectID(request.body.parentId);
        } else file.parentId = 0;
        // Save file content to file system if type is `file` or `image`
        if (request.body.type !== 'folder') {
          // Create a UUID file name
          const fileName = uuidv4();

          // Add localPath property to file/folder
          if (process.env.FOLDER_PATH !== undefined) {
            file.localPath = `${process.env.FOLDER_PATH}/${fileName}`;
          } else file.localPath = `/tmp/files_manager/${fileName}`;

          // Create a local file in FOLDER_PATH and persist the data
          const decodedData = Buffer.from(request.body.data, 'base64').toString('utf-8');
          await writeFile(file.localPath, decodedData);
        }
        // Add a user id property to file document
        file.userId = mongo.ObjectID(usrId);

        // Add isPublic property if provided
        if (Object.hasOwn(request.body, 'isPublic') === true) file.isPublic = request.body.isPublic;
        else file.isPublic = false;

        // Persist file to database
        await dbClient.database.collection('files').insertOne(file);

        // Respond to user request
        response.status(201).json(
          {
            id: file._id,
            userId: file.userId,
            name: file.name,
            type: file.type,
            isPublic: file.isPublic,
            parentId: file.parentId,
          },
        );
      } else response.status(401).json({ error: 'Unauthorized' });
    }
  }

  /**
   * @function verification
   * @summary verify file attributes are as expected
   *
   * @param {object} request data sent
   * @param {object} response - response object of an express app
   * @returns {object} undefined
   */
  static async verification(data, response) {
    // Check if name of file is passed
    if (Object.hasOwn(data, 'name') === false) {
      response.status(400).json({ error: 'Missing name' });
      return 'failed';
    }
    // Check if type of file is passed and is among three expected
    if (Object.hasOwn(data, 'type') === true) {
      if (['folder', 'file', 'image'].some((type) => data.type === type) === false) {
        response.status(400).json({ error: 'Missing type' });
        return 'failed';
      }
    } else {
      response.status(400).json({ error: 'Missing type' });
      return 'failed';
    }
    // Check if data is passed for file types other than `folder`
    if (Object.hasOwn(data, 'data') === false && data.type !== 'folder') {
      response.status(400).json({ error: 'Missing data' });
      return 'failed';
    }
    // Check if parent file exists
    if (Object.hasOwn(data, 'parentId') === true) {
      const usr = await dbClient.database.collection('files').findOne(
        { _id: mongo.ObjectID(data.parentId) },
      );
      if (usr === null) {
        response.status(400).json({ error: 'Parent not found' });
        return 'failed';
      }
      if (usr.type !== 'folder') {
        response.status(400).json({ error: 'Parent is not a folder' });
      }
    }
    return 'passed';
  }
}
