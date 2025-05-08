import { Router } from "express";
import { newReservation, cancelReservation } from "./reservations.controller.js";
import {auth} from "../../middlewares/authJWT.js";

const router = Router();

router.post("/", auth(), newReservation);
router.delete("/:id",auth(), cancelReservation )

export default router;