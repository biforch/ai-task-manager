const test = require("node:test");
const assert = require("node:assert/strict");

const llmService = require("../src/ai/llmService");

function createMockClient(createImpl) {
  return {
    chat: {
      completions: {
        create: createImpl
      }
    }
  };
}

test.afterEach(() => {
  llmService.__resetClientForTests();
});

test("askAI returns content from a successful response", async () => {
  llmService.__setClientForTests(
    createMockClient(async (params, options) => {
      assert.equal(params.max_tokens, llmService.LLM_MAX_TOKENS);
      assert.equal(options.timeout, llmService.LLM_TIMEOUT_MS);

      return {
        choices: [
          {
            message: {
              content: '{"goalTitle":"Plan","tasks":[]}'
            }
          }
        ]
      };
    })
  );

  const content = await llmService.askAI("Learn React");

  assert.equal(content, '{"goalTitle":"Plan","tasks":[]}');
});

test("askAI passes timeout and max_tokens to chat.completions.create", async () => {
  let capturedParams;
  let capturedOptions;

  llmService.__setClientForTests(
    createMockClient(async (params, options) => {
      capturedParams = params;
      capturedOptions = options;

      return {
        choices: [
          {
            message: {
              content: "ok"
            }
          }
        ]
      };
    })
  );

  await llmService.askAI("prompt");

  assert.equal(capturedParams.max_tokens, 1200);
  assert.equal(capturedOptions.timeout, 30_000);
});

test("askAI rejects empty choices", async () => {
  llmService.__setClientForTests(
    createMockClient(async () => ({
      choices: []
    }))
  );

  await assert.rejects(
    () => llmService.askAI("prompt"),
    (error) => {
      assert.equal(error.code, "AI_SERVICE_ERROR");
      assert.equal(error.message, "AI service returned an empty response");
      return true;
    }
  );
});

test("askAI rejects null content", async () => {
  llmService.__setClientForTests(
    createMockClient(async () => ({
      choices: [
        {
          message: {
            content: null
          }
        }
      ]
    }))
  );

  await assert.rejects(
    () => llmService.askAI("prompt"),
    (error) => {
      assert.equal(error.code, "AI_SERVICE_ERROR");
      assert.equal(error.message, "AI service returned empty content");
      return true;
    }
  );
});

test("askAI rejects empty string content", async () => {
  llmService.__setClientForTests(
    createMockClient(async () => ({
      choices: [
        {
          message: {
            content: "   "
          }
        }
      ]
    }))
  );

  await assert.rejects(
    () => llmService.askAI("prompt"),
    (error) => {
      assert.equal(error.code, "AI_SERVICE_ERROR");
      assert.equal(error.message, "AI service returned empty content");
      return true;
    }
  );
});

test("askAI wraps SDK failures without leaking provider details", async () => {
  llmService.__setClientForTests(
    createMockClient(async () => {
      const sdkError = new Error(
        "401 Incorrect API key provided: sk-secret-value at openrouter.ai"
      );
      sdkError.name = "AuthenticationError";
      throw sdkError;
    })
  );

  await assert.rejects(
    () => llmService.askAI("prompt"),
    (error) => {
      assert.equal(error.code, "AI_SERVICE_ERROR");
      assert.equal(error.message, "AI service unavailable");
      assert.doesNotMatch(error.message, /sk-secret-value/);
      assert.doesNotMatch(error.message, /API key/);
      return true;
    }
  );
});
