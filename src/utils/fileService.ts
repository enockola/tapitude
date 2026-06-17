import { FileModel, IFile } from "../models/FileService";
import fs from 'fs';
import path from 'path';

class FileService {
    private readonly STORAGE_DIR = path.join(__dirname, '../../storage/uploads');

    /**
     * Return a URL or a unique key to identify the file
     * @param key 
     * @param data 
     * @param contentType 
     * @returns 
     */
    async uploadFile(
        key: string,
        data: Buffer, // Use Buffer for simplicity on single-server
        contentType: string,
        ownerId: string,
        originalName: string
    ): Promise<string> {

        // 1. Ensure the directory exists
        const fullPath = path.join(this.STORAGE_DIR, key);
        await fs.promises.mkdir(path.dirname(fullPath), { recursive: true });

        // 2. Write the bytes to the local filesystem
        await fs.promises.writeFile(fullPath, data);

        // 3. Save metadata to MongoDB
        const fileMetadata = new FileModel({
            fileKey: key,
            originalName: originalName,
            contentType: contentType,
            fileSize: data.length,
            ownerId: ownerId,
            createdAt: new Date(),
            isActive: true
        });

        await fileMetadata.save();

        return key; // Return the key to store in your main business logic
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
        return Promise.resolve();
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
export const fileService = new FileService();