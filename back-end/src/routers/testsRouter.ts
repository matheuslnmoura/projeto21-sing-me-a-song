import { Router } from 'express';
import testsController from '../controllers/testsController.js';

const testsRouter = Router();

testsRouter.delete('/tests/reset-database', testsController.resetDatabase);

export default testsRouter;