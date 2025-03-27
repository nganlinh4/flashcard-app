import { replicate } from './mcpServices';

interface MnemonicImage {
  url: string;
  description: string;
  relevanceScore: number;
}

export const generateMnemonicImage = async (word: string, meaning: string): Promise<MnemonicImage> => {
  try {
    const prompt = `Create a visual mnemonic to help remember the Korean word "${word}" which means "${meaning}". 
    The image should be:
    - Simple and colorful
    - Contain elements that visually represent both the Korean word and its meaning
    - Use imagery that creates strong memory associations
    - Have a clean white background`;

    const response = await replicate.create_prediction({
      model: "stability-ai/sdxl",
      input: {
        prompt: prompt,
        width: 512,
        height: 512,
        num_outputs: 1,
        guidance_scale: 7.5,
        num_inference_steps: 50
      }
    });

    return {
      url: response.output[0],
      description: `Mnemonic for ${word} (${meaning})`,
      relevanceScore: 0.9
    };
  } catch (error) {
    console.error('Image generation error:', error);
    return {
      url: `https://via.placeholder.com/512/FFFFFF/000000?text=${word}`,
      description: `Placeholder for ${word}`,
      relevanceScore: 0.5
    };
  }
};

export const getImageRelevanceScore = async (imageUrl: string, word: string, meaning: string): Promise<number> => {
  // TODO: Implement actual image relevance scoring
  return 0.8;
};