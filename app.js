require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookie = require('cookie-parser');
const ApiRouter = require('./routes/ApiRoutes.js');
const db = require('./configs/Database.js');
const UserRepository = require('./app/repositories/UserRepository.js');

const app = express();
app.use(cors({
  credentials: true,
  origin: [process.env.APP_ORIGIN?.split('|')]
}));
app.use(cookie());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb', parameterLimit: 50000 }));

const env = process.env.APP_ENV || 'production';
const api = process.env.APP_API || '/api/v1';

// FRONT END
app.use(express.static('public'));

// API ROUTE
app.use(api, ApiRouter);

// HANDLE FRONT END URL
app.get('*', (req, res) => {
  res.sendFile('public/index.html', { root: '.' });
});

(async () => {
  try {
    await db.sync();
    await UserRepository.store({
      name: 'Administrator',
      username: 'admin',
      password: 'password'
    });
    console.log("User admin created");
  } catch (error) {
    console.log(error);
  }
})()

if (env !== 'production') {
  app.listen(process.env.APP_PORT || 8000, () => {
    console.log(`Listening Port ` + process.env.APP_PORT || 8000);
  });
} else {
  app.listen();
}