const path = require('path');

// import .env variables
require('dotenv-safe').load({
  path: path.join(__dirname, '../../.env'),
  sample: path.join(__dirname, '../../.env.example'),
});

module.exports = {
  env: process.env.NODE_ENV,
  port: process.env.PORT,
  publicDir: path.join(__dirname, '../../public'),
  mongo: {
    uri: process.env.MONGO_URI
  },
  auth: {
    google: {
      client_id: process.env.GOOGLE_ID,
      client_secret: process.env.GOOGLE_SECRET
    },
    jwt: {
      secret: process.env.JWT_SECRET,
      expiration: process.env.JWT_EXPIRATION_MINUTES
    }
  },
  logs: process.env.NODE_ENV === 'production' ? 'combined' : 'dev',
};
