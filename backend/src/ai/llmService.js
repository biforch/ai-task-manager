const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,

  baseURL: "https://openrouter.ai/api/v1",

  defaultHeaders: {
    "HTTP-Referer": "http://localhost:3000",
    "X-Title": "AI Task Manager"
  }
});

async function askAI(prompt) {
  const response = await client.chat.completions.create({
    model: "openai/gpt-4.1-mini",

    messages: [
      {
        role: "user",
        content: prompt
      }
    ]
  });

  return response.choices[0].message.content;
}

module.exports = {
  askAI
};