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

export async function generateCombinationsAction(
  input: GenerateDiceCombinationsInput
): Promise<GenerateDiceCombinationsOutput | null> {
  try {
    const result = await generateDiceCombinations(input);
    return result;
  } catch (error) {
    console.error('Error generating combinations:', error);
    return null;
  }
}

export async function analyzeCombinationAction(
  input: AnalyzeDiceCombinationInput
): Promise<AnalyzeDiceCombinationOutput | null> {
  try {
    const result = await analyzeDiceCombination(input);
    return result;
  } catch (error) {
    console.error('Error analyzing combination:', error);
    return null;
  }
}
