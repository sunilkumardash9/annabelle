import OpenAI from 'openai';
import { geminiGeneratorImageArray } from './geminiAi';

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

export async function openAIChatGenerator(
  chat,
  callback,
  images?, 
  options: {
      apiKey?: string,
      baseApiUrl?: string,
      model?: string
      geminiKey?:string
  } = {}
) {
  const { apiKey, baseApiUrl = "https://api.together.xyz/v1", model = "teknium/OpenHermes-2p5-Mistral-7B", geminiKey='' } = options;
  const openai = new OpenAI({ apiKey, baseURL: baseApiUrl, dangerouslyAllowBrowser: true });
  
  const lastDict = chat[chat.length-1]
  var userMessage = lastDict.content
  if (images && images.length>0){
    userMessage = await geminiGeneratorImageArray(images, userMessage, geminiKey)
    var prompt = "This is an explanation for a prompt and images from the user, generate a step-by-step detail explanation for the texts in a conversational tone. ";
    userMessage = prompt + userMessage;
  }
  chat[chat.length-1].content = userMessage
  const stream = await openai.chat.completions.create({
      model,
      messages: chat,
      stream: true,
  });

  for await (const chunk of stream) {
      const content = chunk.choices[0].delta.content || "";
      callback(content); // Call the callback with the streamed content
  }
}
export default openAITextGenerator;
