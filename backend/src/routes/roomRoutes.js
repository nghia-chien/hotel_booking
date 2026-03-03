import express from "express";
import multer from "multer";
import path from "node:path";
import {
  createRoom,
  getRooms,
  getRoomById,
  updateRoom,
  deleteRoom
} from "../controllers/roomController.js";
import { authenticate, authorizeRoles } from "../middlewares/auth.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join("uploads", "rooms"));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({ storage });

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

