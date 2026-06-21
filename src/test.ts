import { FileServiceInstance } from './models/FileService';
import connectDB from "./utils/db";


const mockData = Buffer.from('hello');
const mockData2 = Buffer.from('Hello world! Ring a ding ding!, The quick brown fox jumps over the lazy dog.');
(async () => {
    await connectDB();

    let key = await FileServiceInstance.uploadFile({
        data: mockData,
        ownerId: 'user123',
        filename: 'test.png'
    });

    console.log(key + "\n");

    let bytes = await FileServiceInstance.getFileBytes(key);
    console.log(bytes.toString() + "\n");

    let meta = await FileServiceInstance.getFileMetadata(key);
    console.log(meta.toString());

    await FileServiceInstance.updateFile(key, {
        data: mockData2,
        ownerId: 'user456',
        isActive: false
    });

    meta = await FileServiceInstance.getFileMetadata(key);
    console.log(meta.toString());

    // await FileServiceInstance.deleteFile('634b15bdd8b64dafa6a05ddfef2966ee.png');

})();
