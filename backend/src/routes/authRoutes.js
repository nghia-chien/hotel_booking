import express from "express";
import {
  register,
  login,
  refreshToken,
  forgotPassword,
  resetPassword,
  updateProfile,
  changePassword,
  uploadAvatar
} from "../controllers/authController.js";
import { authenticate } from "../middlewares/auth.js";
import { avatarUpload } from "../utils/multer.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh-token", refreshToken);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// Protected routes
router.use(authenticate);
router.put("/profile", updateProfile);
router.put("/change-password", changePassword);
router.post("/avatar", avatarUpload.single("avatar"), uploadAvatar);

export default router;

