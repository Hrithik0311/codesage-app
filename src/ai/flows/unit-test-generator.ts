
'use server';

/**
 * @fileOverview Generates unit tests for a given code snippet.
 *
 * - generateUnitTests - A function that generates unit tests.
 * - UnitTestGeneratorInput - The input type for the generateUnitTests function.
 * - UnitTestGeneratorOutput - The return type for the generateUnitTests function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const UnitTestGeneratorInputSchema = z.object({
  code: z
    .string()
    .describe('The code for which unit tests need to be generated.'),
  language: z
    .string()
    .default('typescript')
    .describe('The programming language of the code.'),
});
export type UnitTestGeneratorInput = z.infer<typeof UnitTestGeneratorInputSchema>;

const UnitTestGeneratorOutputSchema = z.object({
  tests: z
    .string()
    .describe('The generated unit tests for the given code.'),
});
export type UnitTestGeneratorOutput = z.infer<typeof UnitTestGeneratorOutputSchema>;

export async function generateUnitTests(input: UnitTestGeneratorInput): Promise<UnitTestGeneratorOutput> {
  return unitTestGeneratorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'unitTestGeneratorPrompt',
  model: 'googleai/gemini-1.5-flash-preview',
  input: {schema: UnitTestGeneratorInputSchema},
  output: {schema: UnitTestGeneratorOutputSchema},
  prompt: `You are an AI that generates unit tests for given code.

  Generate unit tests for the following code, ensuring they are comprehensive and cover various scenarios.

  Language: {{{language}}}
  Code: {{{code}}}

  Tests:
`,
});

const unitTestGeneratorFlow = ai.defineFlow(
  {
    name: 'unitTestGeneratorFlow',
    inputSchema: UnitTestGeneratorInputSchema,
    outputSchema: UnitTestGeneratorOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
