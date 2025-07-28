
import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function POST(request: Request) {
  const { to, subject, html } = await request.json();

  if (!process.env.RESEND_API_KEY) {
    console.error('Resend API key is not set in the environment.');
    return NextResponse.json(
      { success: false, error: 'The server is not configured for sending emails. RESEND_API_KEY is missing.' },
      { status: 500 }
    );
  }

  const fromEmail = process.env.RESEND_FROM_EMAIL;
  if (!fromEmail) {
    console.warn(
      'RESEND_FROM_EMAIL environment variable is not set. ' +
      'Defaulting to "onboarding@resend.dev". ' +
      'This is for development only. You must use a custom domain you own for production.'
    );
  }

  // Use the environment variable, or default to the resend.dev address for testing.
  const fromAddress = fromEmail || 'CodeSage <onboarding@resend.dev>';

  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to: [to],
      subject,
      html,
    });

    if (error) {
      console.error('Resend API Error:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
    
    console.log('Resend success response:', data);
    return NextResponse.json({ success: true, data }, { status: 200 });

  } catch (error: any) {
    console.error('Email sending error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
