import express from "express";
import {
  createRoomType,
  getRoomTypes,
  getRoomTypeById,
  updateRoomType,
  deleteRoomType
} from "../controllers/roomTypeController.js";
import { authenticate, authorizeRoles } from "../middlewares/auth.js";

const router = express.Router();

router.get("/", getRoomTypes);
router.get("/:id", getRoomTypeById);
router.post("/", authenticate, authorizeRoles("admin"), createRoomType);
router.put("/:id", authenticate, authorizeRoles("admin"), updateRoomType);
router.delete("/:id", authenticate, authorizeRoles("admin"), deleteRoomType);

export default router;

