import core from "@actions/core";
import { HttpClient } from "@actions/http-client";

const openAiKey = process.env.OPEN_API_KEY;

async function go() {
  if (openAiKey === undefined) {
    core.setFailed(`OPEN_API_KEY is not defined!`);
    return;
  }

  try {
    const model = core.getInput("model");
    const prompt = core.getInput("prompt");
    const client = new HttpClient();
    const response = await client.postJson(
      "https://api.openai.com/v1/chat/completions",
      {
        model,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      },
      {
        Authorization: `Bearer ${openAiKey}`,
        "Content-Type": "application/json",
      }
    );
    if (response.statusCode !== 200) {
      throw new Error(`API call failed with status ${response.statusCode}`);
    }
    const completion = response.result.choices?.[0]?.message?.content;
    if (!completion) {
      throw new Error("No completion returned");
    }

    core.setOutput("completion", completion);
  } catch (error) {
    core.setFailed(error.message);
  }
}

go();
