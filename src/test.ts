import { FileServiceInstance } from './models/FileService';
import connectDB from "./utils/db";


const mockData = Buffer.from('hello');
(async () => {
    await connectDB();

    await FileServiceInstance.uploadFile({
        data: mockData,
        ownerId: 'user123',
        filename: 'test.png'
    });

})();
