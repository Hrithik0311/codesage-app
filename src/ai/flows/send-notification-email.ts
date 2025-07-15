
'use server';

/**
 * @fileOverview A flow for sending notification emails via an API endpoint.
 *
 * - sendNotificationEmail - A function that handles sending an email.
 * - EmailInput - The input type for the sendNotificationEmail function.
 */
import 'dotenv/config'; // Make sure this is at the top
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
  success: z.boolean(),
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
    // This flow will call our own API endpoint to send the email.
    // This abstracts the email logic and keeps Genkit focused on orchestration.
    
    // Determine the base URL for the API call.
    // In a production environment, this should be your public URL.
    const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:9002';
    const apiUrl = `${baseUrl}/api/send-email`;

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: input.to,
          subject: input.subject,
          html: input.body,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send email');
      }

      console.log(`Email API call successful for ${input.to}`);
      return { status: `Email sent to ${input.to}`, success: true };

    } catch (error: any) {
      console.error('Error in sendNotificationEmailFlow:', error);
      return { status: `Failed to send email: ${error.message}`, success: false };
    }
  }
);
