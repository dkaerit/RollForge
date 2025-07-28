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
    console.log('Attempting to generate combinations with AI...');
    const result = await generateDiceCombinations(input);
    if (result && result.combinations && result.combinations.length > 0) {
      console.log('AI generation successful.');
      return result;
    }
    console.log('AI returned no combinations, trying fallback.');
    const fallbackResult = generateFallbackCombinations(input);
    return fallbackResult;
  } catch (error) {
    console.error(
      'Error generating combinations with AI, using fallback:',
      error
    );
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
