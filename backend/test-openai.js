require("dotenv").config();

const OpenAI = require("openai");

if (!process.env.OPENROUTER_API_KEY) {
  console.error("OPENROUTER_API_KEY is not configured.");
  process.exit(1);
}

const client = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
  defaultHeaders: {
    "HTTP-Referer": "http://localhost:3000",
    "X-Title": "AI Task Manager"
  }
});

async function test() {
  try {
    const response = await client.chat.completions.create({
      model: "openai/gpt-4.1-mini",
      messages: [
        {
          role: "user",
          content: "Say hello"
        }
      ]
    });

    console.log("AI Response:", response.choices[0].message.content);
  } catch (error) {
    console.error("OpenRouter request failed.");
  }
}

test();
