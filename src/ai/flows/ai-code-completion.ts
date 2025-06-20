'use server';

/**
 * @fileOverview An AI-powered code completion tool.
 *
 * - aiCodeCompletion - A function that handles the code completion process.
 * - AiCodeCompletionInput - The input type for the aiCodeCompletion function.
 * - AiCodeCompletionOutput - The return type for the aiCodeCompletion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiCodeCompletionInputSchema = z.object({
  codeSnippet: z.string().describe('The code snippet to complete.'),
  programmingLanguage: z.string().describe('The programming language of the code snippet.'),
});
export type AiCodeCompletionInput = z.infer<typeof AiCodeCompletionInputSchema>;

const AiCodeCompletionOutputSchema = z.object({
  completedCode: z.string().describe('The completed code snippet.'),
  detectedErrors: z.array(z.string()).describe('An array of detected errors in the code snippet.'),
  suggestions: z.array(z.string()).describe('An array of suggestions for improving the code snippet.'),
});
export type AiCodeCompletionOutput = z.infer<typeof AiCodeCompletionOutputSchema>;

export async function aiCodeCompletion(input: AiCodeCompletionInput): Promise<AiCodeCompletionOutput> {
  return aiCodeCompletionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiCodeCompletionPrompt',
  input: {schema: AiCodeCompletionInputSchema},
  output: {schema: AiCodeCompletionOutputSchema},
  prompt: `You are an AI-powered code completion tool. You will receive a code snippet and a programming language. You will complete the code snippet, detect errors in the code snippet, and provide suggestions for improving the code snippet.

Code Snippet:
{{codeSnippet}}

Programming Language:
{{programmingLanguage}}`,
});

const aiCodeCompletionFlow = ai.defineFlow(
  {
    name: 'aiCodeCompletionFlow',
    inputSchema: AiCodeCompletionInputSchema,
    outputSchema: AiCodeCompletionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
