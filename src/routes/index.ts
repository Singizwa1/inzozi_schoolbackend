import { Router } from 'express';
import authRoutes from './authRoutes'
import userRoutes from './userRoutes'
import schoolRoutes from './schoolRoutes'
import studentRoutes from './studentRoutes'
import subscriptionRoutes from './subscriptionRoutes'
import languageRoutes from './languages'

const routers = Router();
const allRoutes = [authRoutes,userRoutes,schoolRoutes,studentRoutes,subscriptionRoutes,languageRoutes];
routers.use("/api", ...allRoutes);

export { routers };