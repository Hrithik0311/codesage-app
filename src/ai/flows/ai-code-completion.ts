
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
    details: z.string().describe('A simple, beginner-friendly explanation of the issue or suggestion, including line numbers if applicable.'),
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
  prompt: `You are an expert AI programming tutor specializing in FIRST Tech Challenge (FTC) Java code. Your task is to analyze the provided code snippet and explain your findings in a way a 15-year-old can understand.

**PRIMARY DIRECTIVE:** Your analysis MUST be exhaustive. It is critical that you identify every single potential issue in one pass. An incomplete analysis is a failed analysis. Do not summarize; identify all individual problems.

Because this is for FTC, assume the code uses the FTC SDK, so objects like 'gamepad1', 'telemetry', and hardware classes like 'DcMotor' are available and not undefined.

If the code snippet is trivial, nonsensical (like the word "hi"), or not valid code for the specified language, return empty arrays for all categories. Otherwise, categorize your findings into "Performance", "Potential Bugs", and "Suggestions".

For each issue you identify, provide:
1.  \`title\`: A short, descriptive title for the issue.
2.  \`details\`: A simple, beginner-friendly explanation, including line numbers, explaining WHY it's an issue and what the negative impact is.

Your explanations should be clear, encouraging, and educational.

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
