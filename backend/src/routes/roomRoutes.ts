import express from 'express';
import { roomController } from '../modules/room/index.js';
import { authenticate, authorizeRoles } from '../middlewares/auth.js';
import { roomImagesUpload } from '../utils/multer.js';

const router = express.Router();

router.get('/', authenticate, authorizeRoles('admin', 'staff'), roomController.getRooms);
router.get('/:id', authenticate, authorizeRoles('admin', 'staff'), roomController.getRoomById);
router.post('/', authenticate, authorizeRoles('admin'), roomImagesUpload.array('images', 5), roomController.createRoom);
router.put('/:id', authenticate, authorizeRoles('admin'), roomImagesUpload.array('images', 5), roomController.updateRoom);
router.delete('/:id', authenticate, authorizeRoles('admin'), roomController.deleteRoom);

export default router;
