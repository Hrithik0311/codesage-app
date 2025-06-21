
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

const RefactorCodeInputSchema = z.object({
  codeSnippet: z.string().describe('The code snippet to refactor.'),
  programmingLanguage: z.string().describe('The programming language of the code snippet.'),
  issuesToFix: z.array(z.string()).describe('A list of the titles of specific issues that should be fixed in the code.'),
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
  prompt: `You are an expert, precise, and literal-minded programmer. Your sole task is to refactor a given code snippet to fix a specific list of issues.

**PRIMARY DIRECTIVE:**
1.  Read the "Original Code Snippet".
2.  Read the "List of Issue Titles to Fix". These are concise descriptions of problems.
3.  Rewrite the entire code snippet, applying ONLY the fixes for the issues listed.
4.  **DO NOT** make any other changes. Do not add features, do not change formatting, do not alter logic unrelated to the fix. Your changes must be surgical.
5.  Return the complete, pure code in the \`refactoredCode\` field. Do not add any explanations, notes, or markdown formatting like \`\`\`java.

---
**TASK:**

**Programming Language:** \`{{programmingLanguage}}\`

**List of Issue Titles to Fix:**
{{#each issuesToFix}}
- {{this}}
{{/each}}

**Original Code Snippet to Refactor:**
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
