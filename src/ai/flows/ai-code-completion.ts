'use server';

/**
 * @fileOverview An AI-powered code analysis tool.
 *
 * - codeAnalysis - A function that handles the code analysis process.
 * - CodeAnalysisInput - The input type for the codeAnalysis function.
 * - CodeAnalysisOutput - The return type for the codeAnalysis function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CodeAnalysisInputSchema = z.object({
  codeSnippet: z.string().describe('The code snippet to analyze.'),
  programmingLanguage: z.string().describe('The programming language of the code snippet.'),
});
export type CodeAnalysisInput = z.infer<typeof CodeAnalysisInputSchema>;

const AnalysisItemSchema = z.object({
    title: z.string().describe('A short, descriptive title for the issue or suggestion.'),
    details: z.string().describe('A detailed explanation of the issue or suggestion, including line numbers if applicable.'),
});

const CodeAnalysisOutputSchema = z.object({
  performance: z.array(AnalysisItemSchema).describe('An array of performance optimization suggestions.'),
  bugs: z.array(AnalysisItemSchema).describe('An array of detected potential bugs or errors.'),
  suggestions: z.array(AnalysisItemSchema).describe('An array of general suggestions for improving code quality and best practices.'),
});
export type CodeAnalysisOutput = z.infer<typeof CodeAnalysisOutputSchema>;

export async function codeAnalysis(input: CodeAnalysisInput): Promise<CodeAnalysisOutput> {
  return codeAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'codeAnalysisPrompt',
  input: {schema: CodeAnalysisInputSchema},
  output: {schema: CodeAnalysisOutputSchema},
  prompt: `You are a friendly and helpful AI programming tutor. Your task is to analyze the provided code snippet and explain your findings in a simple and encouraging way, as if you were talking to a 15-year-old who is learning to code.
If the code snippet is trivial, nonsensical (like the word "hi"), or not valid code for the specified language, return empty arrays for all categories.
Otherwise, categorize your findings into three sections: "Performance", "Potential Bugs", and "Suggestions".
For each issue or suggestion you identify, provide a short, easy-to-understand 'title'. For the 'details', explain the issue clearly, why it's a problem, and how to fix it, using simple language and analogies where helpful. Avoid overly technical jargon.

Programming Language: {{programmingLanguage}}

Code Snippet:
\`\`\`{{programmingLanguage}}
{{codeSnippet}}
\`\`\`
`,
});

const codeAnalysisFlow = ai.defineFlow(
  {
    name: 'codeAnalysisFlow',
    inputSchema: CodeAnalysisInputSchema,
    outputSchema: CodeAnalysisOutputSchema,
  },
  async input => {
    if (!input.codeSnippet?.trim() || input.codeSnippet.trim().length < 10) {
        return { performance: [], bugs: [], suggestions: [] };
    }
    const {output} = await prompt(input);
    return output!;
  }
);
