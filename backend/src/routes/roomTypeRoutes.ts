import express from 'express';
import { roomController } from '../modules/room/index.js';
import { authenticate, authorizeRoles } from '../middlewares/auth.js';

const router = express.Router();

router.get('/', roomController.getAllRoomTypes);
router.post('/', authenticate, authorizeRoles('admin'), roomController.createRoomType);

export default router;
