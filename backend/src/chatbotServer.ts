import "dotenv/config";
import express from "express";
import cors from "cors";
import chatbotRoutes from "./routes/chatbotRoutes.js";

const app = express();

const chatbotPort = Number(process.env.CHATBOT_PORT) || 3001;

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "http://localhost:5174",
      "http://127.0.0.1:5174",
    ],
    credentials: false,
  })
);
app.use(express.json());
app.use("/api/chatbot", chatbotRoutes);

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "chatbot" });
});

app.listen(chatbotPort, () => {
  console.log(`Chatbot server listening on port ${chatbotPort}`);
});
