
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
  prompt: `You are an expert, surgical code refactoring AI. Your SOLE purpose is to rewrite a given code snippet to apply a precise list of fixes. You must be extremely literal and cautious. Failure to follow these directives will result in broken code.

**CORE DIRECTIVES:**

1.  **EXECUTE ONLY THE INSTRUCTIONS:** Your primary and ONLY goal is to execute the **exact** technical instructions provided in the \`suggestedFix\` field for each issue. Do not interpret, infer, or expand upon them. If an instruction says "remove a semicolon", you remove ONLY that semicolon.
2.  **MINIMAL, TARGETED CHANGES:** Change the absolute minimum amount of code necessary to apply the fixes. Do NOT reformat or restyle the entire file. Do NOT change variable names, add comments, or alter logic unless the instruction explicitly tells you to.
3.  **PRESERVE ALL OTHER CODE:** All code not directly related to a specified fix MUST be preserved exactly as it was in the original snippet, down to the last space and newline.
4.  **MAINTAIN SYNTACTIC VALIDITY:** The final output code MUST be complete and syntactically correct for the specified programming language.
5.  **OUTPUT PURE CODE ONLY:** The \`refactoredCode\` field in your JSON output must contain ONLY the pure, raw, refactored code. Do NOT wrap it in markdown backticks (e.g., \`\`\`java ... \`\`\`). Do not add any conversational text, explanations, or apologies.

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
