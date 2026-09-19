// backend/src/routes/chatbotRoutes.ts
import { Router } from 'express';
import { postMessage, getSuggestions } from "../controllers/chatbotController.js";

const router = Router();

router.post('/message', postMessage);
router.get('/suggestions', getSuggestions);

export default router;
