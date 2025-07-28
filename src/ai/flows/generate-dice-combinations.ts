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

Suggest several creative dice combinations using the available dice.
- The 'd2' die rolls 0 or 1.
- The 'dF' (Fudge) die rolls -1, 0, or 1.
- You can use positive and negative modifiers (e.g., +1, -5).

For each combination, you must provide:
1.  **dice**: The dice combination string (e.g., '1d6+2d4+3', '2d8-1').
2.  **min**: The minimum possible roll.
3.  **max**: The maximum possible roll.
4.  **average**: The average roll.
5.  **distributionShape**: A key describing the probability distribution. Use 'distribution.bell' (for combinations with many dice), 'distribution.somewhatBell' (for 2-3 dice), or 'distribution.flat' (for single dice).
6.  **distributionScore**: A score from 0.0 (flat) to 2.0 (very bell-shaped). A single die is 0.0. Multiple dice increase the score. 2d6 is about 1.2. 3d6 is about 1.8.

Ensure the min, max, and average values are accurate for each combination.
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
