/** Dev: same-origin → Vite proxy → chatbot server. Prod: set VITE_CHATBOT_URL or default 3001. */
function chatbotOrigin(): string {
  const fromEnv = import.meta.env.VITE_CHATBOT_URL as string | undefined;
  if (fromEnv?.trim()) return fromEnv.replace(/\/$/, "");
  if (import.meta.env.DEV) return "";
  return "http://localhost:3001";
}

function chatbotUrl(path: string): string {
  const root = chatbotOrigin();
  const p = path.startsWith("/") ? path : `/${path}`;
  return root ? `${root}${p}` : p;
}

export interface ChatbotAnalysis {
  intent: string;
  entities: Record<string, unknown>;
  confidence?: number;
}

export interface ComboSuggestion {
  id: string;
  name: string;
  price: number;
  details?: unknown;
}

export interface PostMessageResponse {
  analysis: ChatbotAnalysis;
  suggestions: ComboSuggestion[];
}

export interface GetSuggestionsResponse {
  combos: ComboSuggestion[];
}

export async function postChatbotMessage(
  message: string,
  context?: Record<string, unknown>
): Promise<PostMessageResponse> {
  const res = await fetch(chatbotUrl("/api/chatbot/message"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, context: context ?? {} }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json();
}

export async function getChatbotSuggestions(
  params?: Record<string, string>
): Promise<GetSuggestionsResponse> {
  const qs = params && Object.keys(params).length ? `?${new URLSearchParams(params)}` : "";
  const res = await fetch(chatbotUrl(`/api/chatbot/suggestions${qs}`));
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json();
}
