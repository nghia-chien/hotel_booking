import { MongoUserRepository } from './auth.repository.js';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';

const userRepository = new MongoUserRepository();
const authService = new AuthService(userRepository);
const authController = new AuthController(authService);

export { userRepository, authService, authController };
