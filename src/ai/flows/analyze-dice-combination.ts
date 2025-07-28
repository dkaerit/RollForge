'use server';

/**
 * @fileOverview This file defines a Genkit flow for analyzing dice combinations.
 *
 * - analyzeDiceCombination - Analyzes the probability distribution of a given dice combination.
 * - AnalyzeDiceCombinationInput - The input type for the analyzeDiceCombination function.
 * - AnalyzeDiceCombinationOutput - The return type for the analyzeDiceCombination function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeDiceCombinationInputSchema = z.object({
  diceCombination: z
    .string()
    .describe('A dice combination macro (e.g., \'1d6+2d4+3\').'),
  minRange: z
    .number()
    .optional()
    .describe('The minimum target number the dice combination should achieve.'),
  maxRange: z
    .number()
    .optional()
    .describe('The maximum target number the dice combination should achieve.'),
  language: z.string().describe('The language to use for the analysis.'),
});
export type AnalyzeDiceCombinationInput = z.infer<
  typeof AnalyzeDiceCombinationInputSchema
>;

const AnalyzeDiceCombinationOutputSchema = z.object({
  analysis: z
    .string()
    .describe(
      'An analysis of the dice combination, including its probability distribution, mean, standard deviation, and suitability for achieving the target range.'
    ),
  probabilityDistribution: z
    .string()
    .describe(
      'A description of the probability distribution of the dice combination, focusing on the shape of the curve and the likelihood of different outcomes.'
    ),
  simulationResults: z
    .string()
    .describe(
      'Results from simulating the dice combination, including the frequency of different outcomes and a comparison to the expected probability distribution.'
    ),
});
export type AnalyzeDiceCombinationOutput = z.infer<
  typeof AnalyzeDiceCombinationOutputSchema
>;

export async function analyzeDiceCombination(
  input: AnalyzeDiceCombinationInput
): Promise<AnalyzeDiceCombinationOutput> {
  return analyzeDiceCombinationFlow(input);
}

const analyzeDiceCombinationPrompt = ai.definePrompt({
  name: 'analyzeDiceCombinationPrompt',
  input: {schema: AnalyzeDiceCombinationInputSchema},
  output: {schema: AnalyzeDiceCombinationOutputSchema},
  prompt: `You are a game design expert, especially skilled in designing and balancing game mechanics with dice.

You will analyze the dice combination provided, and provide an analysis of the probability distribution, mean, standard deviation, and suitability for achieving the target range. Also simulate the dice combination and provide the results.

All your output text MUST be in the following language: {{{language}}}

Dice Combination: {{{diceCombination}}}
Min Range: {{{minRange}}}
Max Range: {{{maxRange}}}`,
});

const analyzeDiceCombinationFlow = ai.defineFlow(
  {
    name: 'analyzeDiceCombinationFlow',
    inputSchema: AnalyzeDiceCombinationInputSchema,
    outputSchema: AnalyzeDiceCombinationOutputSchema,
  },
  async input => {
    const {output} = await analyzeDiceCombinationPrompt(input);
    return output!;
  }
);
