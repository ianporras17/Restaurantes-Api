import { Router } from "express";
import authRoutes from "./modules/users/auth.routes.js";
import usersRoutes from "./modules/users/users.routes.js";
import restauranstRoutes from "./modules/restaurants/restaurants.routes.js"
import menuRouter from "./modules/menus/menus.routes.js"
import reservationRouter from "./modules/reservations/reservations.routes.js"
import ordersRouter from "./modules/orders/orders.routes.js"


const router = Router();

router.use("/auth", authRoutes);
router.use("/users", usersRoutes);
router.use("/restaurants", restauranstRoutes);
router.use("/menus", menuRouter)
router.use("/reservations", reservationRouter);
router.use("/orders", ordersRouter);

export default router;