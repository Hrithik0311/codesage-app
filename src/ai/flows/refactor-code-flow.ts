
'use server';

/**
 * @fileOverview An AI-powered code refactoring tool.
 *
 * - refactorCode - A function that handles the code refactoring process.
 * - RefactorCodeInput - The input type for the refactorCode function.
 * - RefactorCodeOutput - The return type for the refactorCode function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const IssueToFixSchema = z.object({
  title: z.string(),
  details: z.string(),
});

const RefactorCodeInputSchema = z.object({
  codeSnippet: z.string().describe('The code snippet to refactor.'),
  programmingLanguage: z.string().describe('The programming language of the code snippet.'),
  issuesToFix: z.array(IssueToFixSchema).describe('A list of specific issues that should be fixed in the code.'),
});
export type RefactorCodeInput = z.infer<typeof RefactorCodeInputSchema>;

const RefactorCodeOutputSchema = z.object({
  refactoredCode: z.string().describe('The complete, refactored code snippet.'),
});
export type RefactorCodeOutput = z.infer<typeof RefactorCodeOutputSchema>;


export async function refactorCode(input: RefactorCodeInput): Promise<RefactorCodeOutput> {
  return refactorCodeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'refactorCodePrompt',
  input: {schema: RefactorCodeInputSchema},
  output: {schema: RefactorCodeOutputSchema},
  prompt: `You are a meticulous and highly accurate expert programmer specializing in code refactoring. Your task is to refactor a given code snippet by addressing a specific list of issues.

**CRITICAL INSTRUCTIONS:**
1. You MUST address **ONLY** the issues listed in the "Issues to fix" section.
2. Do NOT introduce any new functionality, logic, or comments.
3. Do NOT remove any existing functionality unless it is explicitly part of the issue to be fixed.
4. Preserve the original code structure and style as much as possible, only modifying what is necessary to fix the specified issues.
5. Return the **COMPLETE** and **VALID** refactored code snippet in the 'refactoredCode' field. Do not provide any explanations, apologies, or conversational text. Just the code.

Programming Language: {{programmingLanguage}}

Issues to fix:
{{#each issuesToFix}}
- Title: {{title}}
  Details: {{details}}
{{/each}}

Original Code Snippet:
\`\`\`{{programmingLanguage}}
{{codeSnippet}}
\`\`\`
`,
});

const refactorCodeFlow = ai.defineFlow(
  {
    name: 'refactorCodeFlow',
    inputSchema: RefactorCodeInputSchema,
    outputSchema: RefactorCodeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
