import { MongoNotificationRepository } from './notification.repository.js';
import { NotificationService } from './notification.service.js';
import { NotificationController } from './notification.controller.js';

const notificationRepository = new MongoNotificationRepository();
const notificationService = new NotificationService(notificationRepository);
const notificationController = new NotificationController(notificationService);

export { notificationRepository, notificationService, notificationController };
