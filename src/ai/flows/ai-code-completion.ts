
'use server';

/**
 * @fileOverview An AI-powered code analysis and refactoring tool.
 *
 * - codeAnalysis - A function that handles the code analysis and refactoring process.
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
  refactoredCode: z.string().describe("The complete, refactored code snippet with all identified issues fixed."),
});
export type CodeAnalysisOutput = z.infer<typeof CodeAnalysisOutputSchema>;


export async function codeAnalysis(input: CodeAnalysisInput): Promise<CodeAnalysisOutput> {
  return codeAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'codeAnalysisPrompt',
  input: {schema: CodeAnalysisInputSchema},
  output: {schema: CodeAnalysisOutputSchema},
  prompt: `You are an expert AI programming tutor and automated refactoring tool specializing in FIRST Tech Challenge (FTC) Java code.

Your task is to perform two actions in a single pass:
1.  **Analyze:** Conduct an exhaustive analysis of the provided code snippet. Identify every potential bug, performance inefficiency, and suggestion for best practice. For each issue, provide a short 'title' and a simple, beginner-friendly 'details' explanation.
2.  **Refactor:** Based on your analysis, rewrite the ENTIRE code snippet to fix ALL of the issues you identified.

**CRITICAL DIRECTIVES:**
-   **Accuracy is paramount.** The refactored code MUST be a complete, correct, and runnable drop-in replacement for the original.
-   **Preserve Logic:** Do not alter the core logic or intended behavior of the code. Your goal is to fix errors and improve quality, not to change functionality.
-   **Completeness:** Ensure your analysis is thorough. If the code is trivial or nonsensical, return empty arrays for all categories and the original code in the 'refactoredCode' field.
-   **FTC Context:** Assume the code uses the FTC SDK. Objects like 'gamepad1', 'telemetry', and hardware classes like 'DcMotor' are pre-defined and should not be treated as errors.

Your final output MUST be a single, valid JSON object that adheres to the output schema.

Programming Language: {{programmingLanguage}}

Code Snippet to Analyze and Refactor:
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
        return { performance: [], bugs: [], suggestions: [], refactoredCode: input.codeSnippet };
    }
    const {output} = await prompt(input);
    return output!;
  }
);
