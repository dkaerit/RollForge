'use server';

import {
  generateDiceCombinations,
  type GenerateDiceCombinationsInput,
  type GenerateDiceCombinationsOutput,
} from '@/ai/flows/generate-dice-combinations';
import {
  analyzeDiceCombination,
  type AnalyzeDiceCombinationInput,
  type AnalyzeDiceCombinationOutput,
} from '@/ai/flows/analyze-dice-combination';
import {
  generateFallbackCombinations,
  generateFallbackAnalysis,
} from '@/lib/dice-utils';

export async function generateCombinationsAction(
  input: GenerateDiceCombinationsInput
): Promise<GenerateDiceCombinationsOutput | null> {
  try {
    // First, always run the fallback generator to get a baseline of logical results.
    console.log('Generating fallback combinations...');
    const fallbackResult = generateFallbackCombinations(input);
    
    const aiInput: GenerateDiceCombinationsInput = {
      ...input,
      baseCombinations: fallbackResult.combinations.map(c => c.dice)
    };

    console.log('Attempting to generate combinations with AI...');
    const aiResult = await generateDiceCombinations(aiInput);
    
    if (aiResult && aiResult.combinations && aiResult.combinations.length > 0) {
      console.log('AI generation successful. Merging results.');
      // Combine AI and fallback results, removing duplicates.
      const allCombinations = [...fallbackResult.combinations, ...aiResult.combinations];
      const uniqueCombinations = Array.from(new Map(allCombinations.map(c => [c.dice, c])).values());
      return { combinations: uniqueCombinations };
    }
    
    console.log('AI returned no combinations, using fallback only.');
    return fallbackResult;

  } catch (error) {
    console.error('Error in generateCombinationsAction, trying final fallback:', error);
    try {
      const fallbackResult = generateFallbackCombinations(input);
      return fallbackResult;
    } catch (fallbackError) {
      console.error('Error generating fallback combinations:', fallbackError);
      return null;
    }
  }
}

export async function analyzeCombinationAction(
  input: AnalyzeDiceCombinationInput
): Promise<AnalyzeDiceCombinationOutput | null> {
  try {
    const result = await analyzeDiceCombination(input);
    return result;
  } catch (error) {
    console.error('Error analyzing combination with AI, using fallback:', error);
    try {
      const fallbackResult = generateFallbackAnalysis(input);
      return fallbackResult;
    } catch (fallbackError) {
      console.error('Error generating fallback analysis:', fallbackError);
      return null;
    }
  }
}
