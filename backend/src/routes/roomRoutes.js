import express from "express";
import multer from "multer";
import {
  createRoom,
  getRooms,
  getRoomById,
  updateRoom,
  deleteRoom
} from "../controllers/roomController.js";
import { authenticate, authorizeRoles } from "../middlewares/auth.js";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB per file
});

router.get("/", authenticate, authorizeRoles("admin", "staff"), getRooms);
router.get("/:id", authenticate, authorizeRoles("admin", "staff"), getRoomById);
router.post(
  "/",
  authenticate,
  authorizeRoles("admin"),
  upload.array("images", 5),
  createRoom
);
router.put(
  "/:id",
  authenticate,
  authorizeRoles("admin"),
  upload.array("images", 5),
  updateRoom
);
router.delete(
  "/:id",
  authenticate,
  authorizeRoles("admin"),
  deleteRoom
);

export default router;

