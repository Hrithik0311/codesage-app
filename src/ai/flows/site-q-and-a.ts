
'use server';

/**
 * @fileOverview A Q&A agent for the CodeSage website.
 *
 * - answerSiteQuestion - A function that answers questions about the site content.
 * - SiteQuestionInput - The input type for the answerSiteQuestion function.
 * - SiteQuestionOutput - The return type for the answerSiteQuestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

import { ftcJavaLessons } from '@/data/ftc-java-lessons';
import { ftcJavaLessonsIntermediate } from '@/data/ftc-java-lessons-intermediate';
import { ftcJavaLessonsAdvanced } from '@/data/ftc-java-lessons-advanced';


const SiteQuestionInputSchema = z.object({
  question: z.string().describe('The user\'s question about the website.'),
});
export type SiteQuestionInput = z.infer<typeof SiteQuestionInputSchema>;

const SiteQuestionOutputSchema = z.object({
  answer: z.string().describe('The AI\'s answer to the user\'s question.'),
});
export type SiteQuestionOutput = z.infer<typeof SiteQuestionOutputSchema>;


export async function answerSiteQuestion(input: SiteQuestionInput): Promise<SiteQuestionOutput> {
  return siteQuestionFlow(input);
}

// Prepare context data for the prompt
const totalBeginnerLessons = ftcJavaLessons.length;
const totalIntermediateLessons = ftcJavaLessonsIntermediate.length;
const totalAdvancedLessons = ftcJavaLessonsAdvanced.length;
const totalLessons = totalBeginnerLessons + totalIntermediateLessons + totalAdvancedLessons;

const beginnerLessonTitles = ftcJavaLessons.map(l => l.title);
const intermediateLessonTitles = ftcJavaLessonsIntermediate.map(l => l.title);
const advancedLessonTitles = ftcJavaLessonsAdvanced.map(l => l.title);


const prompt = ai.definePrompt({
  name: 'siteQuestionPrompt',
  input: {schema: z.object({
      question: z.string(),
      totalLessons: z.number(),
      totalBeginnerLessons: z.number(),
      totalIntermediateLessons: z.number(),
      totalAdvancedLessons: z.number(),
      beginnerLessonTitles: z.array(z.string()),
      intermediateLessonTitles: z.array(z.string()),
      advancedLessonTitles: z.array(z.string()),
  })},
  output: {schema: SiteQuestionOutputSchema},
  prompt: `You are CodeSage AI, a friendly and helpful assistant for the CodeSage website.
Your goal is to answer user questions based on the information provided below about the site's content.
Be concise and helpful.

Here is the available information about the learning content:
- Total number of lessons: {{totalLessons}}
- Beginner lessons count: {{totalBeginnerLessons}}
- Intermediate lessons count: {{totalIntermediateLessons}}
- Advanced lessons count: {{totalAdvancedLessons}}

- Beginner lesson titles:
{{#each beginnerLessonTitles}}
- {{this}}
{{/each}}

- Intermediate lesson titles:
{{#each intermediateLessonTitles}}
- {{this}}
{{/each}}

- Advanced lesson titles:
{{#each advancedLessonTitles}}
- {{this}}
{{/each}}

User's question: "{{question}}"

Based *only* on the information above, provide a helpful answer. If the question cannot be answered with the given information, politely say that you can't answer that question yet.
`,
});

const siteQuestionFlow = ai.defineFlow(
  {
    name: 'siteQuestionFlow',
    inputSchema: SiteQuestionInputSchema,
    outputSchema: SiteQuestionOutputSchema,
  },
  async (input) => {

    const context = {
        question: input.question,
        totalLessons,
        totalBeginnerLessons,
        totalIntermediateLessons,
        totalAdvancedLessons,
        beginnerLessonTitles,
        intermediateLessonTitles,
        advancedLessonTitles
    };
    
    const {output} = await prompt(context, {model: 'googleai/gemini-1.5-flash'});
    return output!;
  }
);
