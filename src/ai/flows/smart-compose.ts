
'use server';

/**
 * @fileOverview Provides AI-powered smart compose suggestions for text input.
 *
 * - smartCompose - A function that suggests completions for a given text snippet.
 * - SmartComposeInput - The input type for the smartCompose function.
 * - SmartComposeOutput - The return type for the smartCompose function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

const SmartComposeInputSchema = z.object({
  text: z.string().describe('The current text input from the user.'),
});
export type SmartComposeInput = z.infer<typeof SmartComposeInputSchema>;

const SmartComposeOutputSchema = z.object({
  suggestion: z.string().describe('The suggested completion for the user\'s text.'),
});
export type SmartComposeOutput = z.infer<typeof SmartComposeOutputSchema>;

export async function smartCompose(input: SmartComposeInput): Promise<SmartComposeOutput> {
  return smartComposeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'smartComposePrompt',
  input: {schema: SmartComposeInputSchema},
  output: {schema: SmartComposeOutputSchema},
  model: googleAI.model('gemini-1.5-flash'),
  prompt: `You are a helpful assistant that provides smart-compose suggestions.
Your task is to complete the user's sentence concisely.
- Only provide the completion, not the original text.
- If the input appears to be a full sentence, suggest a new, related short sentence.
- If the input is just a greeting, respond with a friendly greeting.
- Keep suggestions short and natural.

Input: {{{text}}}
`,
});

const smartComposeFlow = ai.defineFlow(
  {
    name: 'smartComposeFlow',
    inputSchema: SmartComposeInputSchema,
    outputSchema: SmartComposeOutputSchema,
  },
  async input => {
    // Basic validation to avoid running on empty or very short inputs
    if (!input.text || input.text.trim().length < 3) {
      return { suggestion: '' };
    }
    const {output} = await prompt(input);
    return output!;
  }
);
