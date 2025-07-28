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
      fitDescription: z.string().describe("A description of how well the combination's range fits the target range (e.g., 'Perfect Fit', 'Wider Range')."),
      distributionShape: z.string().describe("The shape of the probability distribution (e.g., 'Bell-shaped', 'Flat')."),
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
1.  **fitDescription**: A short, user-friendly description of how well the combination's min/max values match the requested min/max. Examples: "Perfect Fit", "Slightly Narrower Range", "Wider Range", "Close Fit".
2.  **distributionShape**: A short, user-friendly description of the probability distribution shape.
    *   If the result comes from rolling many dice (e.g., 3d6, 4d4), the distribution is likely 'Bell-shaped' (concentrated in the center).
    *   If the result comes from a single die (e.g., 1d20), the distribution is 'Flat' (outcomes are equiprobable).
    *   If it's in between, you can use terms like 'Somewhat Bell-shaped'.

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
