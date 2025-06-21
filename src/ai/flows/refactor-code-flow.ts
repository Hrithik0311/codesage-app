
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
  suggestedFix: z.string(),
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
  prompt: `You are a surgical code refactoring AI. Your SOLE purpose is to rewrite a given code snippet to apply a precise list of fixes. You must be extremely literal and cautious.

**CORE DIRECTIVES:**

1.  **EXECUTE THE FIX:** Your primary goal is to execute the **exact** instruction provided in the \`suggestedFix\` field for each issue. Do not interpret or expand upon it.
2.  **MINIMAL CHANGES:** Change the absolute minimum amount of code necessary. Do NOT reformat the entire file. Do NOT change variable names unless the instruction requires it.
3.  **PRESERVE ALL OTHER CODE:** All code not directly related to a specified fix MUST be preserved exactly as it was in the original snippet.
4.  **GUARANTEE VALID SYNTAX:** The output code MUST be complete and syntactically correct for the specified programming language.
5.  **OUTPUT CODE ONLY:** The \`refactoredCode\` field in your JSON output must contain ONLY the pure, raw refactored code. Do NOT wrap it in markdown backticks (e.g., \`\`\`java ... \`\`\`). Do not add any conversational text.

---
**Programming Language:** \`{{programmingLanguage}}\`

---
**Issues to Fix:**
{{#each issuesToFix}}
- **Instruction:** {{suggestedFix}}
  (Context: {{title}})
{{/each}}

---
**Original Code Snippet to Refactor:**
\`\`\`
{{codeSnippet}}
\`\`\`
---
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
