import { Router } from 'express';
import authRoutes from './authRoutes'
import userRoutes from './userRoutes'
import schoolRoutes from './schoolRoutes'
import studentRoutes from './studentRoutes'

const routers = Router();
const allRoutes = [authRoutes,userRoutes,schoolRoutes,studentRoutes];
routers.use("/api", ...allRoutes);

export { routers };