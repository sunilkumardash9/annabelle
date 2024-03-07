import OpenAI from 'openai';

let system_prompt:string = "You are a helpful assistant. You are needed to explain the texts in a clear and concise manner within 60 words."
async function openAITextGenerator(message:string, callback, api_key?:string, base_api?:string, model?:string) {
  // if (!api_key);
  //     error(message="Provide an API key")
  api_key = "";
  model = "teknium/OpenHermes-2p5-Mistral-7B";
  base_api="https://api.together.xyz/v1";
  console.log(message)
  const openai = new OpenAI({apiKey: api_key, baseURL:base_api,  dangerouslyAllowBrowser: true });
  const stream = await openai.chat.completions.create({
    model: model,
    messages: [{role: 'system', content: system_prompt},{ role: 'user', content: message }],
    stream: true,
  });
  let concatenatedContent = "";
  for await (const chunk of stream) {
    const content = chunk.choices[0].delta.content || "";
    callback(content); // Call the callback with the streamed content
  }
}
export default openAITextGenerator;