import { openAITextGenerator, openAIChatGenerator } from "./openAI";
import { geminiTextGenerator, geminiGeneratorImage, geminiChatGenerator_ } from "./geminiAi";

export async function getDefaultTextGenerator() {
    const { defaultService } = await chrome.storage.sync.get('defaultService');
    const serviceData = await chrome.storage.sync.get(defaultService);
    const result = serviceData[defaultService];
   
    switch (defaultService) {
        case 'openAI':
            return { defaultService, textGenerator: openAITextGenerator };
        case 'gemini':
            return { defaultService, textGenerator: geminiTextGenerator };
        default:
            throw new Error('Invalid default service zazaza');
    }
}

export async function getDefaultChatGenerator() {
    const { defaultService } = await chrome.storage.sync.get('defaultService');
    // const serviceData = await chrome.storage.sync.get(defaultService);
    // const result = serviceData[defaultService];
    console.log(defaultService, 'yes default srice')
    switch (defaultService) {
        case 'openAI':
            return { defaultService, chatGenerator: openAIChatGenerator };
        case 'gemini':
            return { defaultService, chatGenerator: geminiChatGenerator_ };
        default:
            throw new Error('Invalid default service zazaza');
    }
}

export async function getDefaultMultiModalGenerator() {
    const serviceData = await chrome.storage.sync.get('gemini');
    const result = serviceData['gemini'];
    if (result.apiKey && typeof geminiGeneratorImage === 'function') {
        return { imageGenerator: geminiGeneratorImage, apiKey: result.apiKey };
    } else {
        throw new Error('Gemini generator image function is not defined or API key is missing');
    }
}

