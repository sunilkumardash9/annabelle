import OpenAI from 'openai';

let system_prompt:string = "You are a helpful assistant. You are needed to explain the texts in a clear and concise manner within 60 words."
export async function openAITextGenerator(
  message: string,
  callback,
  options: {
      apiKey?: string,
      baseApiUrl?: string,
      model?: string
  } = {}
) {
  const { apiKey, baseApiUrl = "https://api.together.xyz/v1", model = "teknium/OpenHermes-2p5-Mistral-7B" } = options;
  const openai = new OpenAI({ apiKey, baseURL: baseApiUrl, dangerouslyAllowBrowser: true });
  const stream = await openai.chat.completions.create({
      model,
      messages: [{ role: 'system', content: system_prompt }, { role: 'user', content: message }],
      stream: true,
  });

  for await (const chunk of stream) {
      const content = chunk.choices[0].delta.content || "";
      callback(content); // Call the callback with the streamed content
  }
}

export default openAITextGenerator;
