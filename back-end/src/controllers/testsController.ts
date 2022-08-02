import { Request, Response } from 'express';
import { recommendationRepository } from '../repositories/recommendationRepository.js';

async function resetDatabase(req: Request, res: Response) {
  await recommendationRepository.removeAll();
  res.sendStatus(200);
}

const testsController = {
  resetDatabase,
};

export default testsController;