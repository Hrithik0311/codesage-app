
'use server';

/**
 * @fileOverview A flow for sending notification emails.
 *
 * - sendNotificationEmail - A function that handles sending an email.
 * - EmailInput - The input type for the sendNotificationEmail function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EmailInputSchema = z.object({
  to: z.string().email().describe('The recipient\'s email address.'),
  subject: z.string().describe('The subject line of the email.'),
  body: z.string().describe('The HTML body of the email.'),
});
export type EmailInput = z.infer<typeof EmailInputSchema>;

// This is a placeholder output. In a real scenario, this might return a status.
const EmailOutputSchema = z.object({
  status: z.string(),
});
export type EmailOutput = z.infer<typeof EmailOutputSchema>;


export async function sendNotificationEmail(input: EmailInput): Promise<EmailOutput> {
  return sendNotificationEmailFlow(input);
}

const sendNotificationEmailFlow = ai.defineFlow(
  {
    name: 'sendNotificationEmailFlow',
    inputSchema: EmailInputSchema,
    outputSchema: EmailOutputSchema,
  },
  async (input) => {
    // In a real-world application, this is where you would integrate with an
    // email sending service like SendGrid, Mailgun, or AWS SES.
    // For this prototype, we will just log the action to the console
    // to simulate that an email has been sent.
    
    console.log('***********************************');
    console.log('*** SIMULATING EMAIL NOTIFICATION ***');
    console.log(`Recipient: ${input.to}`);
    console.log(`Subject: ${input.subject}`);
    console.log('***********************************');
    
    // You can view this log in the terminal where you ran `npm run genkit:watch`.

    return { status: 'Email sent successfully (simulated).' };
  }
);
