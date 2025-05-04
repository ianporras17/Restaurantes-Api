import { Router } from "express";
import authRoutes from "./modules/users/auth.routes.js";
import usersRoutes from "./modules/users/users.routes.js";


const router = Router();

router.use("/auth", authRoutes);
router.use("/users", usersRoutes);

export default router;