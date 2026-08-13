const OpenAI = require("openai");

const LLM_TIMEOUT_MS = 30_000;
const LLM_MAX_TOKENS = 1200;
const LLM_MODEL = "openai/gpt-4.1-mini";

let clientInstance = null;

function createClient() {
  return new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: "https://openrouter.ai/api/v1",
    defaultHeaders: {
      "HTTP-Referer": "http://localhost:3000",
      "X-Title": "AI Task Manager"
    }
  });
}

function getClient() {
  if (!clientInstance) {
    clientInstance = createClient();
  }

  return clientInstance;
}

function createUpstreamError(message) {
  const error = new Error(message);
  error.code = "AI_SERVICE_ERROR";
  return error;
}

function extractContent(response) {
  if (!response || typeof response !== "object") {
    throw createUpstreamError("AI service returned an invalid response");
  }

  if (!Array.isArray(response.choices) || response.choices.length === 0) {
    throw createUpstreamError("AI service returned an empty response");
  }

  const choice = response.choices[0];

  if (!choice || typeof choice !== "object" || !choice.message) {
    throw createUpstreamError("AI service returned an invalid response");
  }

  const { content } = choice.message;

  if (typeof content !== "string" || !content.trim()) {
    throw createUpstreamError("AI service returned empty content");
  }

  return content;
}

async function askAI(prompt) {
  const client = getClient();

  try {
    const response = await client.chat.completions.create(
      {
        model: LLM_MODEL,
        max_tokens: LLM_MAX_TOKENS,
        messages: [
          {
            role: "user",
            content: prompt
          }
        ]
      },
      {
        timeout: LLM_TIMEOUT_MS
      }
    );

    return extractContent(response);
  } catch (error) {
    if (error.code === "AI_SERVICE_ERROR") {
      throw error;
    }

    console.error("LLM request failed:", error.name || "Error");
    throw createUpstreamError("AI service unavailable");
  }
}

function __setClientForTests(client) {
  clientInstance = client;
}

function __resetClientForTests() {
  clientInstance = null;
}

module.exports = {
  askAI,
  LLM_TIMEOUT_MS,
  LLM_MAX_TOKENS,
  __setClientForTests,
  __resetClientForTests
};
