import { Router } from "express";
import {auth} from "../../middlewares/authJWT.js";
import {resgisterRestaurant, verRestaurantes} from "./restaurants.controller.js";

const router = Router();

router.post("/", auth("Admin"), resgisterRestaurant);
router.get("/", auth("Admin"), verRestaurantes);

export default router;