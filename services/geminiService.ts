
import { GoogleGenAI, Modality } from "@google/genai";

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            // result is "data:mime/type;base64,THE_BASE_64_STRING"
            // we need to remove the prefix for the API
            const base64String = result.split(',')[1];
            resolve(base64String);
        };
        reader.onerror = (error) => reject(error);
    });
};

export const generateSceneImages = async (productImages: File[], prompt: string): Promise<string[]> => {
    if (!process.env.API_KEY) {
        throw new Error("API key not found. Please ensure the API_KEY environment variable is set.");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const imageParts = await Promise.all(
        productImages.map(async (file) => {
            const base64Data = await fileToBase64(file);
            return {
                inlineData: {
                    data: base64Data,
                    mimeType: file.type,
                },
            };
        })
    );

    const contents = {
        parts: [
            ...imageParts,
            { text: prompt },
        ],
    };
    
    const generateSingleImage = async () => {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: contents,
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                // Return a full data URL for direct use in <img> src
                return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            }
        }
        throw new Error("AI did not return an image. Please try a different prompt.");
    };

    // The user requested 4 output images. We call the generation function 4 times in parallel.
    const imageGenerationPromises = Array(4).fill(0).map(() => generateSingleImage());
    
    const generatedImages = await Promise.all(imageGenerationPromises);
    
    return generatedImages;
};
