import { GoogleGenerativeAI } from "@google/generative-ai";


// Access your API key as an environment variable (see "Set up your API key" above)
const genAI = new GoogleGenerativeAI("");

// Converts local file information to a GoogleGenerativeAI.Part object.
interface GenerativePart {
    inlineData: {
      data: string;
      mimeType: string;
    };
  }
  
  function base64ToGenerativePart(base64Data: string, mimeType: string): GenerativePart {
    const base64Content = base64Data.split(',')[1]; // Remove the "data:image/png;base64," part
    return {
      inlineData: { data: base64Content, mimeType: mimeType },
    };
  }
  
  export async function geminiGeneratorImage(base64Image: string, callback: (text: string) => void, prompt?: string) {
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
  
  

export async function geminiGeneratorText(message: string, callback, prompt?: string) {
    console.log(message)
    // For text-only input, use the gemini-pro model
    const model = genAI.getGenerativeModel({ model: "gemini-pro"});
  
    // prompt = "Write a story about a magic backpack."
    message = "Explain the given texts in a simple and concise manner. "+message
    const result = await model.generateContentStream(message);
    for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        callback(chunkText)
        // console.log(chunkText)
  }
  }
// geminiGeneratorText("what is HNSW?", 1)
// geminiGeneratorImage("./assets/annabelle_bold.png", "1")