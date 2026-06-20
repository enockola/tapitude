import { FileServiceInstance } from './models/FileService';
import connectDB from "./utils/db";


const mockData = Buffer.from('hello');
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
        ownerId: 'user456',
        isActive: false
    });

    meta = await FileServiceInstance.getFileMetadata(key);
    console.log(meta.toString());

    // await FileServiceInstance.deleteFile('634b15bdd8b64dafa6a05ddfef2966ee.png');

})();
