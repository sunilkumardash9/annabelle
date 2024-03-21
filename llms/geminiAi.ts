import { GoogleGenerativeAI } from "@google/generative-ai";

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

  export async function geminiGeneratorImage(base64Image: string, callback: (text: string) => void, apiKey?:string) {

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = (genAI as any).getGenerativeModel({ model: "gemini-pro-vision" });
    try {
    var prompt = "Explain the image in simple and concise manner in 60 words.";
    
    const imagePart = base64ToGenerativePart(base64Image);
    
    const result = await model.generateContentStream([prompt, imagePart]);
    const response = await result.response;
    for await (const chunk of result.stream) {
      const chunkText = await chunk.text();
      callback(chunkText);
    }
  }
 catch (error){
      callback("Recheck your Gemini API Key.")
    }
}
 
  export async function geminiTextGenerator(
    message: string,
    callback,
    options: {
        apiKey?: string,
        prompt?: string
    } = {}
) {
    const { apiKey, prompt = "You are a helpful assistant. Explain the given texts in a simple and concise manner. " } = options;

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  
    message = prompt + message;
    const result = await model.generateContentStream(message);

    for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        callback(chunkText);
    }
}

export async function geminiGeneratorImageArray(base64Images, apiKey?: string): Promise<string> {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = (genAI as any).getGenerativeModel({ model: "gemini-pro-vision" });
  
    const imageParts = await Promise.all(
      base64Images.map(base64ToGenerativePart)
    );
    
    const result = await model.generateContent([prompt, ...imageParts]);
    const response = await result.response;
    return response.text();
    
  }

let chatSession = null;

export async function GeminiChatGenerator(message: string, callback, images?, apiKey?:string) {
  const genAI = new GoogleGenerativeAI(apiKey);
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
