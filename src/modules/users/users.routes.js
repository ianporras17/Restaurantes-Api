import { Router } from "express";
import { meUser, idUserModify, deleteUser } from "./users.controller.js";
import {auth} from "../../middlewares/authJWT.js";

const router = Router();

router.get("/me", auth(), meUser);
router.put("/:id", auth(), idUserModify);
router.delete("/:id", auth("Admin"),deleteUser);


export default router;