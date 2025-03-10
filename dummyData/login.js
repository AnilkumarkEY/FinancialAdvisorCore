const dotenv = require('dotenv'); // For managing environment variables
dotenv.config(); 

module.exports = [
  {
    userName: process.env.LOGIN_USERNAME,
    password: process.env.LOGIN_PASSWORD,
  },
];
