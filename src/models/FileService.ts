import mongoose, { Document, Schema, Model } from "mongoose";
import fs from 'fs';
import path from 'path';
const { randomUUID } = require('crypto');
import mime from 'mime';
//A buffer is an entire file in memory, a readable stream is a stream of chunks of data
import { Readable } from "stream";
import { stat } from 'fs/promises';

//Purely for typescript to do type checking
export interface IFile extends Document {
  fileKey: string;
  originalName: string;
  contentType: string;
  fileSize: number;
  ownerId: string;
  createdAt: Date;
  isActive: boolean;
}


//Our actual schema
const FileSchema = new Schema<IFile>({
  fileKey: { type: String, required: true, index: true },
  originalName: { type: String, required: true },
  contentType: { type: String, required: true },
  fileSize: { type: Number, required: true },
  ownerId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true }
});

const FileModel = mongoose.model<IFile>("File", FileSchema);

interface UploadOptions {
  data: Readable | Buffer;
  contentType?: string;
  ownerId: string;
  filename: string;
}

interface UpdateOptions {
  data?: Readable | Buffer;
  contentType?: string;
  ownerId?: string;
  isActive?: boolean;
}

class FileService {
  private readonly STORAGE_DIR = path.join(__dirname, '../../storage');

  //All of these operations are fully atomic.


  /**
   * Return a URL or a unique key to identify the file.
   * Returns an error if the upload fails
   * @param key 
   * @param data 
   * @param contentType 
   * @returns 
   */
  async uploadFile(options: UploadOptions): Promise<string> {
    if (mongoose.connection.readyState != 1) {
      throw new Error("Database not connected");
    }
    if (!options.filename) {
      throw new Error("Filename required");
    }
    if (!options.data) {
      throw new Error("Data required");
    }
    if (!options.ownerId) {
      throw new Error("Owner ID required");
    }
    //Generate the key
    const uuid = randomUUID().replace(/-/g, '');
    const extension = path.extname(options.filename);
    const key = `${uuid}${extension}`;

    //Determine the content type
    if (!options.contentType) {
      const contentType = options.contentType ?? mime.getType(options.filename) ?? 'application/octet-stream';
      options.contentType = contentType;
    }

    //Determine the full path
    const fullPath = path.join(this.STORAGE_DIR, key);
    let fileCreated = false;

    try {
      // 1. Ensure the directory exists
      await fs.promises.mkdir(path.dirname(fullPath), { recursive: true });

      // 2. Write the bytes to the local filesystem (Throws an error if it fails)
      await fs.promises.writeFile(fullPath, options.data);
      //Get the information after the write
      const stats = await fs.promises.stat(fullPath);
      const fileSize = stats.size;
      fileCreated = true;

      // 3. Save metadata to MongoDB IF successful
      const fileMetadata = new FileModel({
        fileKey: key,
        originalName: options.filename,
        contentType: options.contentType,
        fileSize: fileSize,
        ownerId: options.ownerId,
        createdAt: new Date(),
        isActive: true
      });
      await fileMetadata.save();

      console.log(`File saved: ${key}\ncontentType: ${options.contentType}\nsize: ${fileSize} bytes`);
      return key; // Return the key to store in your main business logic

    } catch (e) {
      console.error(e);
      if (fileCreated) {
        try {
          await fs.promises.unlink(fullPath);
        } catch (e) {
          console.error(e);
        }
      }
      throw e;
    }
  }


  async fileExists(filePath: string): Promise<boolean> {
    try {
      const stats = await stat(filePath);
      return stats.isFile(); // Ensures it's a file, not a directory
    } catch (error: any) {
      // 'ENOENT' means the file or directory does not exist
      if (error.code === 'ENOENT') {
        return false;
      }
      throw error; // Rethrow other unexpected errors (e.g., permission issues)
    }
  }

  /**
   * Will throw an error if the file does not exist
   * @param key the file key
   * @returns the file bytes
   */
  async getFileBytes(key: string): Promise<Buffer> {
    if (mongoose.connection.readyState != 1) {
      throw new Error("Database not connected");
    }
    const fullPath = path.join(this.STORAGE_DIR, key);
    try {
      return await fs.promises.readFile(fullPath);
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  /**
   * Gets the file metadata
   * Will throw an error if the file does not exist
   * @param key 
   * @returns 
   */
  async getFileMetadata(key: string): Promise<IFile> {
    if (mongoose.connection.readyState != 1) {
      throw new Error("Database not connected");
    }
    try {
      let out = await FileModel.findOne({ fileKey: key });
      if (!out) {
        throw new Error(`File ${key} not found`);
      } else {
        return out;
      }
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  /**
   * Updates the file
   * Throws an error if the file does not exist or if the update fails
   * @param key the file key
   * @param options the update options
   * @returns the new file metadata
   */
  async updateFile(key: string, options: UpdateOptions): Promise<IFile> {
    if (mongoose.connection.readyState != 1) {
      throw new Error("Database not connected");
    }
    try {
      const fullPath = path.join(this.STORAGE_DIR, key);
      const optionalData: Record<string, any> = {}; //Use record to avoid type errors
      //if we want to change the bytes
      if (options.data) { //rewrite the bytes
        await fs.promises.writeFile(fullPath, options.data); //Throws an error if it fails
        //Get the information after the write
        const stats = await fs.promises.stat(fullPath);
        optionalData.fileSize = stats.size; //update the size
      }
      if (options.ownerId) {
        optionalData.ownerId = options.ownerId; //update the owner
      }
      if (options.isActive !== undefined && options.isActive !== null) { //Important for booleans
        optionalData.isActive = options.isActive; //update the isActive
      }
      let out = await FileModel.findOneAndUpdate({ fileKey: key }, optionalData, { new: true });//you are instructing Mongoose to return the modified document (the version after the update has been applied) instead of the original version.
      if (!out) {
        throw new Error(`File ${key} not found`);
      }
      return out;
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  /**
   * Cloud storage uses "Keys" (identifiers), not OS file paths
   * Returns an error if the delete fails
   * @param key 
   */
  async deleteFile(key: string): Promise<void> {
    if (mongoose.connection.readyState != 1) {
      throw new Error("Database not connected");
    }
    const fullPath = path.join(this.STORAGE_DIR, key);
    try {
      if (await this.fileExists(fullPath)) {
        await fs.promises.unlink(fullPath);
      }
      const result = await FileModel.deleteOne({ fileKey: key });
      if (result.deletedCount === 0) {
        console.warn(`File deleted from disk, but no metadata found for key: ${key}`);
      } else {
        console.log(`Deleted file (key: ${key})`);
      }
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  // /**
  //  * Essential for cloud: get a signed, temporary URL for secure private files
  //  * @param key 
  //  * @param expiresInSeconds 
  //  */
  // async getSignedUrl(key: string, expiresInSeconds: number): Promise<string> {
  //     return Promise.resolve("");
  //  }
}


//Export the singleton instance, not the class
export const FileServiceInstance = new FileService();
export default FileModel;