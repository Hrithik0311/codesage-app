
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
  instructions: z.array(z.string()).describe('A list of specific, technical instructions to apply to the code.'),
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
  prompt: `You are an automated, literal, and ultra-precise code rewriting tool. Your only purpose is to execute a list of technical instructions to modify a piece of code.

**PRIMARY DIRECTIVE:**
1.  Read the "Original Code Snippet".
2.  Read the "List of Technical Instructions to Execute".
3.  Rewrite the entire code snippet, applying ONLY the changes described in the instructions.
4.  **DO NOT** make any other changes. Do not add comments, do not add features, do not change formatting or style, and do not alter logic unrelated to the instruction. Your changes must be surgical and literal.
5.  If an instruction seems ambiguous or impossible, ignore it and apply the other instructions.
6.  Return the complete, pure, refactored code in the \`refactoredCode\` field. Do not add any explanations, notes, or markdown formatting like \`\`\`java.

---
**TASK:**

**Programming Language:** \`{{programmingLanguage}}\`

**List of Technical Instructions to Execute:**
{{#each instructions}}
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
