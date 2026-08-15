import express from "express";
import cors from "cors";             
import { routers } from './routes';
import { Database } from './database';
import { config } from "dotenv";
import redis from "./utils/redis";
import './events/emailListener';
import './jobs/subscriptionCron';

config();

Database;
redis.connect().catch(console.error);

const app = express();


app.use(cors());

app.use(
  express.json({
    verify: (req, _res, buf) => {
      (req as any).rawBody = buf;
    },
  })
);
app.use(express.urlencoded({ extended: true }));

app.set('views', './src/templates');
app.set('view engine', 'ejs');

app.use(routers);

app.get('/', (_req, res) => {
  res.send('Hello World');
});

export { app };
