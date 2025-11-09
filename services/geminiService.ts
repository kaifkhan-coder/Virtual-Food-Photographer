
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Dish, PhotoStyle } from '../types';

if (!process.env.API_KEY) {
    console.warn("API_KEY environment variable not set. Using a placeholder. Please set your API key for the app to function.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "YOUR_API_KEY" });

const base64ToBlobParts = (base64Data: string): { mimeType: string; data: string } => {
  const [header, data] = base64Data.split(',');
  const mimeType = header.match(/:(.*?);/)?.[1] || 'image/png';
  return { mimeType, data };
};


export const parseMenu = async (menuText: string): Promise<Dish[]> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Parse the following restaurant menu text into a JSON array of objects. Each object should have a "name" and a "description" for a dish. Ignore categories, prices, and other non-dish information. Menu: \n\n${menuText}`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            name: {
                                type: Type.STRING,
                                description: "The name of the dish."
                            },
                            description: {
                                type: Type.STRING,
                                description: "A brief description of the dish."
                            },
                        },
                        required: ["name", "description"],
                    },
                },
            },
        });
        
        const jsonText = response.text.trim();
        const dishes = JSON.parse(jsonText);
        return dishes as Dish[];
    } catch (error) {
        console.error("Error parsing menu:", error);
        throw new Error("Failed to parse the menu. Please check the format and try again.");
    }
};

const getStylePromptSuffix = (style: PhotoStyle): string => {
    switch (style) {
        case PhotoStyle.RUSTIC_DARK:
            return 'Dark, rustic, moody lighting, shot on a dark wood or slate surface with vintage elements. Focus on texture and shadows. Chiaroscuro effect.';
        case PhotoStyle.BRIGHT_MODERN:
            return 'Bright, modern, clean aesthetic, minimalist plating on a white or light-colored plate. Soft, natural window light. High-key, airy, and crisp.';
        case PhotoStyle.SOCIAL_MEDIA:
            return 'Vibrant top-down flat lay shot, perfect for social media. Colorful, well-composed on a stylish surface like marble with complementary props.';
        default:
            return '';
    }
};

export const generateImage = async (dish: Dish, style: PhotoStyle): Promise<string> => {
    try {
        const styleSuffix = getStylePromptSuffix(style);
        const prompt = `Professional, ultra-realistic, high-end food photography of ${dish.name}: ${dish.description}. ${styleSuffix}`;

        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: '4:3',
            },
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
            const base64ImageBytes = response.generatedImages[0].image.imageBytes;
            return `data:image/jpeg;base64,${base64ImageBytes}`;
        }
        throw new Error("No image was generated.");
    } catch (error) {
        console.error(`Error generating image for ${dish.name}:`, error);
        throw new Error(`Failed to generate an image for ${dish.name}.`);
    }
};

export const editImage = async (base64Image: string, prompt: string): Promise<string> => {
    try {
        const { mimeType, data } = base64ToBlobParts(base64Image);
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [
                    {
                        inlineData: {
                            data: data,
                            mimeType: mimeType,
                        },
                    },
                    { text: prompt },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        const imagePart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
        if (imagePart && imagePart.inlineData) {
            const newMimeType = imagePart.inlineData.mimeType;
            const newBase64Data = imagePart.inlineData.data;
            return `data:${newMimeType};base64,${newBase64Data}`;
        }
        throw new Error("Image editing did not return a valid image.");
    } catch (error) {
        console.error("Error editing image:", error);
        throw new Error("Failed to edit the image.");
    }
};
