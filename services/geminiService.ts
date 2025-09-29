
import { GoogleGenAI } from "@google/genai";

// Fix: Initialize GoogleGenAI according to guidelines, assuming API_KEY is always available in process.env.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const model = "gemini-2.5-flash";

const safetySettings = [
  {
    category: "HARM_CATEGORY_HARASSMENT",
    threshold: "BLOCK_NONE",
  },
  {
    category: "HARM_CATEGORY_HATE_SPEECH",
    threshold: "BLOCK_NONE",
  },
  {
    category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
    threshold: "BLOCK_NONE",
  },
  {
    category: "HARM_CATEGORY_DANGEROUS_CONTENT",
    threshold: "BLOCK_NONE",
  },
];


const extractHtml = (text: string): string => {
  const match = text.match(/```html\s*([\s\S]*?)\s*```/);
  if (match && match[1]) {
    return match[1].trim();
  }
  return text.trim();
};

export const generateCode = async (prompt: string): Promise<string> => {
    // Fix: Removed API key check per guidelines.
    const fullPrompt = `You are an expert web developer specializing in Tailwind CSS. Create a single, complete HTML file based on the following prompt.
The HTML MUST include the Tailwind CSS script tag ('<script src="https://cdn.tailwindcss.com"></script>') and the Inter font from Google Fonts in the <head>.
The response should be ONLY the raw HTML code, inside a single \`\`\`html code block. Do not include any other text, explanations, or markdown.

Prompt: "${prompt}"`;

    try {
        // Fix: Replaced deprecated `generationConfig` with an inline config object.
        const response = await ai.models.generateContent({
            model,
            contents: fullPrompt,
            safetySettings,
            config: {
                temperature: 0.7,
                topP: 0.95,
                topK: 64,
            },
        });
        const rawText = response.text;
        return extractHtml(rawText);
    } catch (error) {
        console.error("Error generating code:", error);
        throw new Error("Failed to generate code from Gemini API.");
    }
};

export const refineCode = async (prompt: string, currentCode: string): Promise<string> => {
    // Fix: Removed API key check per guidelines.
    const fullPrompt = `You are an expert web developer specializing in Tailwind CSS. Refine the following HTML code based on the user's request.
The response should be the complete, updated HTML file.
The response should be ONLY the raw HTML code, inside a single \`\`\`html code block. Do not include any other text, explanations, or markdown.

User Request: "${prompt}"

Current HTML Code:
\`\`\`html
${currentCode}
\`\`\`
`;
    try {
        // Fix: Replaced deprecated `generationConfig` with an inline config object.
         const response = await ai.models.generateContent({
            model,
            contents: fullPrompt,
            safetySettings,
            config: {
                temperature: 0.7,
                topP: 0.95,
                topK: 64,
            },
        });
        const rawText = response.text;
        return extractHtml(rawText);
    } catch (error) {
        console.error("Error refining code:", error);
        throw new Error("Failed to refine code from Gemini API.");
    }
};