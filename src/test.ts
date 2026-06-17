const fileService = require("./utils/fileService");

require("dotenv").config();

console.log(fileService);

fileService.writeFile("test", "test");