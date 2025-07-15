
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

  // Initialize Resend inside the handler to ensure the key is checked first.
  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    const { data, error } = await resend.emails.send({
      from: 'CodeSage <onboarding@resend.dev>', // You will need to use a verified domain in production
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
