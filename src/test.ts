import { FileServiceInstance } from './models/FileService';
import connectDB from "./utils/db";


const mockData = Buffer.from('hello');
(async () => {
    await connectDB();

    // await FileServiceInstance.uploadFile({
    //     data: mockData,
    //     ownerId: 'user123',
    //     filename: 'test.png'
    // });

    await FileServiceInstance.deleteFile('634b15bdd8b64dafa6a05ddfef2966ee.png');

})();
