// backend/src/controllers/chatbotController.ts
import { Request, Response } from 'express';
import AIChatbotService from "../services/aiChatbotService.js";
import ComboService from "../services/comboService.js";

export async function postMessage(req: Request, res: Response) {
  const { message, context } = req.body;
  const analysis = await AIChatbotService.analyzeMessage(message, context);
  const combos = await new ComboService().listCombos({});
  res.json({ analysis, suggestions: combos });
}

export async function getSuggestions(req: Request, res: Response) {
  const criteria = req.query;
  const combos = await new ComboService().listCombos(criteria);
  res.json({ combos });
}
