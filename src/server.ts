import express from "express";
import cors from "cors";
import { routers } from './routes';
import { Database } from './database';
import { config } from "dotenv";
import redis from "./utils/redis";
import { UPLOADS_ROOT } from './middlewares/uploadMiddleware';
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

// In production this is expected to be intercepted by Nginx serving
// /uploads directly from disk (faster, keeps large file transfers off the
// Node process) - this stays as the fallback so local dev and any
// environment without that Nginx block configured yet still works.
app.use('/uploads', express.static(UPLOADS_ROOT));

app.set('views', './src/templates');
app.set('view engine', 'ejs');

app.use(routers);

app.get('/', (_req, res) => {
  res.send('Hello World');
});

export { app };
