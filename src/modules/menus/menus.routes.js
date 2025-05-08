import { Router } from "express";
import {auth} from "../../middlewares/authJWT.js";
import { registerMenu, buscarMenu, actualizarMenu, deleteMenu } from "./menus.controller.js";

const router = Router();

router.post("/", auth("Admin"), registerMenu);
router.get("/:id", auth("Admin"), buscarMenu);
router.put("/:id", auth("Admin"), actualizarMenu);
router.delete("/:id", auth("Admin"), deleteMenu);

export default router;

