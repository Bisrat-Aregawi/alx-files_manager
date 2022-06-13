/**
 * @module db
 */
import { MongoClient } from 'mongodb';

/**
 * Class representing a MongoDB client
 */
class DBClient {
  /**
   * @function constructor
   * @summary Creates a client to MongoDb
   */
  constructor() {
    this.connected = false;
    const url = `mongodb://${process.env.DB_HOST || 'localhost'}:`
      + `${process.env.DB_PORT || 27017}`;

    const db = process.env.DB_DATABASE || 'files_manager';
    this.client = new MongoClient(url, { useUnifiedTopology: true });

    this.client.connect((err, client) => {
      if (err) console.log('Error just occured');
      this.connected = true;
      this.database = client.db(db);
    });
  }

  /**
   * @function isAlive
   * @summary Return boolean about the connection state of thie MongoDB client
   */
  isAlive() {
    return this.connected;
  }

  /**
   * @function nbUsers
   * @summary return number of documents in `users` collection
   */
  async nbUsers() {
    return this.database.collection('users').countDocuments({});
  }

  /**
   * @function nbFiles
   * @summary return number of documents in `files` collection
   */
  async nbFiles() {
    return this.database.collection('files').countDocuments({});
  }
}

const dbClient = new DBClient();
export default dbClient;
