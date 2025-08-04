
'use server';

/**
 * @fileOverview A Q&A agent for the FIRST Robotics programs (FLL, FTC, FRC).
 *
 * - answerFirstRoboticsQuestion - A function that answers questions about a specific FIRST program.
 * - FirstRoboticsQuestionInput - The input type for the answerFirstRoboticsQuestion function.
 * - FirstRoboticsQuestionOutput - The return type for the answerFirstRoboticsQuestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

const FirstRoboticsQuestionInputSchema = z.object({
  question: z.string().describe("The user's question about the robotics program."),
  subject: z.enum(['FLL', 'FTC', 'FRC']).describe('The FIRST Robotics program context.'),
});
export type FirstRoboticsQuestionInput = z.infer<typeof FirstRoboticsQuestionInputSchema>;

const FirstRoboticsQuestionOutputSchema = z.object({
  answer: z.string().describe("The AI's answer to the user's question."),
});
export type FirstRoboticsQuestionOutput = z.infer<typeof FirstRoboticsQuestionOutputSchema>;

export async function answerFirstRoboticsQuestion(input: FirstRoboticsQuestionInput): Promise<FirstRoboticsQuestionOutput> {
  return firstRoboticsQuestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'firstRoboticsQuestionPrompt',
  input: {schema: FirstRoboticsQuestionInputSchema},
  output: {schema: FirstRoboticsQuestionOutputSchema},
  prompt: `You are an expert AI assistant specializing in the FIRST Robotics Competition. Your knowledge covers all programs: FLL (FIRST LEGO League), FTC (FIRST Tech Challenge), and FRC (FIRST Robotics Competition).

Your task is to answer the user's question within the specific context of the program they have chosen. Use your extensive, up-to-date knowledge base, including official game manuals, common community practices, and technical specifications.

Provide clear, accurate, and helpful answers. If the question is ambiguous, ask for clarification.

Program Context: {{subject}}
User's Question: "{{question}}"
`,
});

const firstRoboticsQuestionFlow = ai.defineFlow(
  {
    name: 'firstRoboticsQuestionFlow',
    inputSchema: FirstRoboticsQuestionInputSchema,
    outputSchema: FirstRoboticsQuestionOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input, {model: 'googleai/gemini-1.5-flash'});
    return output!;
  }
);
