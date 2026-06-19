import mongoose, { Document, Schema, Model } from "mongoose";
import fs from 'fs';
import path from 'path';
const { randomUUID } = require('crypto');
import mime from 'mime';

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
  data: Buffer;
  contentType?: string;
  ownerId: string;
  filename: string;
}

class FileService {
  private readonly STORAGE_DIR = path.join(__dirname, '../../storage');

  /**
   * A fully atomic operation. 
   * Return a URL or a unique key to identify the file
   * @param key 
   * @param data 
   * @param contentType 
   * @returns 
   */
  async uploadFile(options:UploadOptions): Promise<string> {
    if (mongoose.connection.readyState != 1) {
      throw new Error("Database not connected");
    }
    //Generate the key
    const uuid = randomUUID().replace(/-/g, '');
    const extension = path.extname(options.filename);
    const key = `${uuid}${extension}`;

    //Determine the content type
    if(!options.contentType) {
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
      fileCreated = true;

      // 3. Save metadata to MongoDB IF successful
      const fileMetadata = new FileModel({
        fileKey: key,
        originalName: options.filename,
        contentType: options.contentType,
        fileSize: options.data.length,
        ownerId: options.ownerId,
        createdAt: new Date(),
        isActive: true
      });
      await fileMetadata.save();

      console.log(`File saved: ${key}\ncontentType: ${options.contentType}\nsize: ${options.data.length} bytes`);
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

  // /**
  //  * Return a stream for downloading/piping to the user
  //  * @param key
  //  * @returns 
  //  */
  // async getFileStream(key: string): Promise<ReadableStream> {
  //     return Promise.resolve(null);
  // }

  /**
   * Cloud storage uses "Keys" (identifiers), not OS file paths
   * @param key 
   */
  async deleteFile(key: string): Promise<void> {
    if (mongoose.connection.readyState != 1) {
      throw new Error("Database not connected");
    }
    const fullPath = path.join(this.STORAGE_DIR, key);
    try {
      await fs.promises.unlink(fullPath);

      const result = await FileModel.deleteOne({ fileKey: key });
      if (result.deletedCount === 0) {
        console.warn(`File deleted from disk, but no metadata found in DB for key: ${key}`);
      } else {
        console.log(`Deleted from MongoDB for key: ${key}`);
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