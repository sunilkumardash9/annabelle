import { GoogleGenerativeAI } from "@google/generative-ai";
import type { Url } from "url";
const fs = require('fs');

// Access your API key as an environment variable (see "Set up your API key" above)
const genAI = new GoogleGenerativeAI("AIzaSyCwwpvAcVtwUlPt-IEEL9K3AMWwmpFm6Co");

// Converts local file information to a GoogleGenerativeAI.Part object.
interface GenerativePart {
    inlineData: {
      data: string;
      mimeType: string;
    };
  }
  
function base64ToGenerativePart(base64Data: string,): GenerativePart {
    const mimeType = "image/png"
    const base64Content = base64Data.split(',')[1]; // Remove the "data:image/png;base64," part
    return {
      inlineData: { data: base64Content, mimeType: mimeType },
    };
  }

  export async function geminiGeneratorImage(base64Image: string, callback: (text: string) => void, prompt?: string, stream:boolean=true) {
    // Assume genAI is a global variable with the appropriate type
    const model = (genAI as any).getGenerativeModel({ model: "gemini-pro-vision" });
  
    prompt = "Explain the image in simple and concise manner in 60 words.";
    
    const imagePart = base64ToGenerativePart(base64Image, "image/png");
    
    const result = await model.generateContentStream([prompt, imagePart]);
    const response = await result.response;
    for await (const chunk of result.stream) {
      const chunkText = await chunk.text();
      callback(chunkText);
    }
  }
  export async function geminiGeneratorText(message: string, callback?, prompt?: string) {
    const model = genAI.getGenerativeModel({ model: "gemini-pro"});
  
    prompt = "You are a helpful asssistant. Explain the given texts in a simple and concise manner. "
    message = prompt+message
    const result = await model.generateContentStream(message);
    for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        callback(chunkText)
  }
  }
export async function geminiGeneratorImageArray(base64Images, prompt?: string, stream:boolean=true): Promise<string> {
    // Assume genAI is a global variable with the appropriate type
    const model = (genAI as any).getGenerativeModel({ model: "gemini-pro-vision" });
  
    const imageParts = await Promise.all(
      base64Images.map(base64ToGenerativePart)
    );
    
    const result = await model.generateContent([prompt, ...imageParts]);
    const response = await result.response;
    return response.text();
    
  }

let chatSession = null;

export async function GeminiChatGenerator(message: string, callback, images?) {
  // For text-only input, use the gemini-pro model
  console.log(images)
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  if (images && images.length>0){
    var message = await geminiGeneratorImageArray(images, message)
    var prompt = "This is an explanation for a prompt and images from the user, generate a step-by-step detail explanation for the texts in a conversational tone. ";
    var message = prompt + message;
  }
  // Initialize the chat session only if it doesn't exist
  if (!chatSession) {
    chatSession = model.startChat({
      history: [],
      generationConfig: {
        maxOutputTokens: 2048,
      },
    });
  }

  const result = await chatSession.sendMessageStream(message);
  for await (const chunk of result.stream) {
    const chunkText = chunk.text();
    callback(chunkText);
  }
}
