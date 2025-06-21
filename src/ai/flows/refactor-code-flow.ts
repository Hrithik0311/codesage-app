
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
  prompt: `You are an automated, literal, and ultra-precise code rewriting tool. Your ONLY function is to apply a given set of text-based patches to a code snippet. You do not think, you do not infer, you do not improve. You execute instructions literally. Failure to be literal will break user's code.

**ABSOLUTE DIRECTIVES (NON-NEGOTIABLE):**

1.  **LITERAL EXECUTION:** You will ONLY execute the exact technical instructions provided in the \`suggestedFix\` list. If an instruction says "Delete line 21", you delete only line 21. If it says "Replace 'foo' with 'bar' on line 10", you do only that. NO other changes.
2.  **NO FORMATTING:** Do NOT re-format, re-indent, or "clean up" any code. Preserve every single space, tab, and newline from the original, unless an instruction explicitly tells you to change it.
3.  **NO INTERPRETATION:** Do not interpret the "intent" of a fix. If a fix seems wrong or incomplete, you MUST still apply it exactly as written.
4.  **COMPLETE & PURE CODE OUTPUT:** The final output in the \`refactoredCode\` field must be the ENTIRE code snippet with the fixes applied. It must NOT contain any markdown (like \`\`\`java), explanations, or any text other than the code itself.

---
**EXAMPLE OF LITERAL EXECUTION:**

**Instruction List:**
- **Instruction:** On line 5, remove the trailing redundant semicolon.
- **Instruction:** On line 6, change the variable name from 'my_var' to 'myVar'.

**Original Code Snippet:**
\`\`\`java
public class Example {
    public void myMethod() {
        // This is a comment
        int my_var = 100;;
        System.out.println(my_var);
    }
}
\`\`\`

**CORRECT, LITERAL, FINAL OUTPUT:**
\`\`\`java
public class Example {
    public void myMethod() {
        // This is a comment
        int myVar = 100;
        System.out.println(myVar);
    }
}
\`\`\`
*(Notice: Only the semicolon and variable name were changed, exactly as instructed. Indentation and comments are perfectly preserved.)*
---

**TASK:**

**Programming Language:** \`{{programmingLanguage}}\`

**Instructions to Execute Literally:**
{{#each issuesToFix}}
- {{suggestedFix}}
{{/each}}

**Original Code Snippet to Refactor:**
\`\`\`
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
