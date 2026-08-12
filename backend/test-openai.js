require("dotenv").config();

const OpenAI = require("openai");


console.log(
  "OpenRouter Key loaded:",
  process.env.OPENROUTER_API_KEY ? "YES" : "NO"
);


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


    console.log(
      "AI Response:",
      response.choices[0].message.content
    );


  } catch(error) {

    console.error(error);

  }

}


test();