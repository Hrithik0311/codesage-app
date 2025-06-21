
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
  title: z.string().describe('The title of the issue to fix.'),
  details: z.string().describe('The detailed explanation of the issue to fix.'),
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
  prompt: `You are an expert programmer tasked with refactoring a code snippet. Your goal is to apply ONLY the specific fixes requested and return the complete, corrected code.

**PRIMARY DIRECTIVE:**
1.  Read the "Original Code Snippet".
2.  Read the "List of Issues to Fix".
3.  Rewrite the entire code snippet, applying ONLY the fixes described in the list.
4.  DO NOT make any other changes. Do not add new features, do not reformat unrelated code, and do not fix issues that were not in the list.
5.  The output in the \`refactoredCode\` field must be the complete, pure code. Do not include any explanations, markdown like \`\`\`java, or any other text.

---
**TASK:**

**Programming Language:** \`{{programmingLanguage}}\`

**List of Issues to Fix:**
{{#each issuesToFix}}
- **{{title}}**: {{details}}
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
