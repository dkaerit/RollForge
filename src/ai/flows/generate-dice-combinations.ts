// Dice combinations generator.
'use server';
/**
 * @fileOverview An AI agent that suggests dice combinations to achieve a specified minimum and maximum roll range.
 *
 * - generateDiceCombinations - A function that handles the dice combination generation process.
 * - GenerateDiceCombinationsInput - The input type for the generateDiceCombinations function.
 * - GenerateDiceCombinationsOutput - The return type for the generateDiceCombinations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateDiceCombinationsInputSchema = z.object({
  minRoll: z.number().describe('The minimum roll value for the target range.'),
  maxRoll: z.number().describe('The maximum roll value for the target range.'),
  availableDice: z.array(z.string()).describe('An array of available dice types (e.g., d4, d6, d8, d10, d12, d20, dF).'),
});
export type GenerateDiceCombinationsInput = z.infer<
  typeof GenerateDiceCombinationsInputSchema
>;

const GenerateDiceCombinationsOutputSchema = z.object({
  combinations: z.array(
    z.object({
      dice: z.string().describe('A textual representation of the dice combination.'),
      min: z.number().describe('The minimum possible roll for the combination.'),
      max: z.number().describe('The maximum possible roll for the combination.'),
      average: z.number().describe('The average roll for the combination.'),
      fitDescription: z.string().describe("A translation key for how well the combination's range fits the target range (e.g., 'fit.perfect', 'fit.wider')."),
      fitScore: z.number().describe('A percentage score from 0 to 100 indicating how well the combination fits the target range. 100 is a perfect fit.'),
      distributionShape: z.string().describe("A translation key for the shape of the probability distribution (e.g., 'distribution.bell', 'distribution.somewhatBell', 'distribution.flat')."),
      distributionScore: z.number().describe('A numerical score from 0.0 (flat) to 2.0 (very bell-shaped) indicating the shape of the probability distribution.'),
    })
  ).describe('An array of possible dice combinations that achieve the target range.'),
});
export type GenerateDiceCombinationsOutput = z.infer<
  typeof GenerateDiceCombinationsOutputSchema
>;

export async function generateDiceCombinations(
  input: GenerateDiceCombinationsInput
): Promise<GenerateDiceCombinationsOutput> {
  return generateDiceCombinationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateDiceCombinationsPrompt',
  input: {schema: GenerateDiceCombinationsInputSchema},
  output: {schema: GenerateDiceCombinationsOutputSchema},
  prompt: `You are a game design assistant. Given a target minimum and maximum roll range, and a list of available dice types, you will suggest several dice combinations that can achieve that range.

Target Range:
Minimum: {{{minRoll}}}
Maximum: {{{maxRoll}}}

Available Dice: {{{availableDice}}}

Suggest several dice combinations using the available dice that can achieve the target range.
The dice 'd2' is special, it rolls a 0 or a 1. This is useful for increasing the maximum roll without affecting the minimum.
The dice 'dF' is a Fudge die, it rolls -1, 0, or 1. This is useful for creating a wider range of results centered around a base value.
Also consider using positive and negative modifiers (e.g., +1, -1, -3, -5) to help get closer to the target range.
Return multiple possible combinations.
Ensure that the min, max and average fields are correct.
Consider combinations of different dice.

Be creative in finding dice combinations that meet the minimum and maximum values, and attempt to get as close to the average as possible.

For each combination, also provide:
1.  **fitDescription**: A translation key describing how well the combination's min/max values match the requested min/max. Use one of the following keys: 'fit.perfect', 'fit.close', 'fit.narrower', 'fit.wider'. A perfect fit requires an exact match of min and max.
2.  **fitScore**: A percentage score from 0 to 100 indicating how well the combination fits the target range. It MUST be calculated precisely using the following formula. Do not deviate. The score is calculated as \`(1 - (|target_min - actual_min| + |target_max - actual_max|) / (target_max - target_min)) * 100\`. The result cannot be negative; if the calculation is less than 0, it must be 0.
3.  **distributionShape**: A translation key describing the probability distribution shape. Use one of the following: 'distribution.bell' (score > 1.5), 'distribution.somewhatBell' (score > 0.5), 'distribution.flat' (otherwise).
4.  **distributionScore**: A numerical score from 0.0 (flat) to 2.0 (very bell-shaped) representing the distribution shape. It MUST be a decimal value to provide granularity. Do not just use 0.0, 1.0, or 2.0. The more dice in the combination, the higher the score. A single die is always flat (0.0). For example, 2d6 (score ~1.2) is more bell-shaped than 2d4 (score ~0.8). 3d6 should have a very high score (~1.8). Provide a precise decimal value.

Output should be a JSON array. For each element in the array, the dice field should be a textual representation of the dice combination. Example: '1d6+2d4+3' or '2d8-1' or '4dF+10'.
Dice should be chosen from the list of available dice.
`,
});

const generateDiceCombinationsFlow = ai.defineFlow(
  {
    name: 'generateDiceCombinationsFlow',
    inputSchema: GenerateDiceCombinationsInputSchema,
    outputSchema: GenerateDiceCombinationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);



