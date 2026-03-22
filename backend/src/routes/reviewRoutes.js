import express from "express";
import { 
  createReview, 
  getRoomReviews, 
  getAllReviewsAdmin, 
  toggleReviewVisibility,
  checkReviewStatus
} from "../controllers/reviewController.js";
import { authenticate, authorizeRoles } from "../middlewares/auth.js";

const router = express.Router();

// Public / User routes
router.get("/room/:id", getRoomReviews);
router.get("/check/:bookingId", authenticate, checkReviewStatus);
router.post("/", authenticate, createReview);

// Admin routes
router.get("/admin/all", authenticate, authorizeRoles("admin", "staff"), getAllReviewsAdmin);
router.patch("/admin/:id/visibility", authenticate, authorizeRoles("admin"), toggleReviewVisibility);

export default router;
