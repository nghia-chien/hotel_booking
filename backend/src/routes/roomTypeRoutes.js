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

router.get("/", authenticate, authorizeRoles("admin", "staff"), getRoomTypes);
router.get("/:id", authenticate, authorizeRoles("admin", "staff"), getRoomTypeById);
router.post("/", authenticate, authorizeRoles("admin"), createRoomType);
router.put("/:id", authenticate, authorizeRoles("admin"), updateRoomType);
router.delete("/:id", authenticate, authorizeRoles("admin"), deleteRoomType);

export default router;

