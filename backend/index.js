import express from 'express';
import db from './configs/mysql.js';
import router from './routes/index.js';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
// import Users from './models/userModel.js';

const app = express();
dotenv.config();

try {
  await db.authenticate();
  console.log('Connection has been established successfully.');
  // await Users.sync();
} catch (error) {
  console.error('Unable to connect to the database:', error)
}

app.use(cors({ credentials: true, origin: 'http://localhost:5173' }));
app.use(cookieParser());
app.use(express.json());
app.use(router);

const port = parseInt(process.env.PORT) || 3000;
app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
