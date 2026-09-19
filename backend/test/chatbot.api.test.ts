// backend/test/chatbot.api.test.ts
import request from 'supertest';
import express from 'express';
import chatbotRouter from "../src/routes/chatbotRoutes.js";

const app = express();
app.use(express.json());
app.use('/api/chatbot', chatbotRouter);

describe('Chatbot API MVP', () => {
  test('POST /api/chatbot/message should return analysis and suggestions', async () => {
    const res = await request(app)
      .post('/api/chatbot/message')
      .send({ message: 'Tôi cần đặt 2 người, ngày 2026-04-20, 1 phòng.' , context: {} });
    expect(["analysis","suggestions"].every(k => k in res.body)).toBe(true);
  });

  test('GET /api/chatbot/suggestions', async () => {
    const res = await request(app).get('/api/chatbot/suggestions?people=2&dates=2026-04-20&rooms=1');
    expect(res.status).toBe(200);
  });
});
