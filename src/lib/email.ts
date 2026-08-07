export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  const resendApiKey = process.env.RESEND_API_KEY;
  const fromName = (process.env.SMTP_FROM_NAME || 'Trilho App').replace(/^["']|["']$/g, '');
  const fromEmail = process.env.SMTP_FROM_EMAIL || 'onboarding@resend.dev';
  const fromAddress = process.env.EMAIL_FROM || `${fromName} <${fromEmail}>`;

  if (resendApiKey) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromAddress,
          to: [to],
          subject,
          html,
        }),
      });

      if (res.ok) {
        console.log(`Email successfully sent via Resend API to ${to}`);
        return;
      } else {
        const errorText = await res.text();
        console.error(`Failed to send email via Resend API (${res.status}):`, errorText);
      }
    } catch (err) {
      console.error('Error sending email via Resend API:', err);
    }
  }

  // Development Fallback Log
  console.log('================ EMAIL DISPATCH (DEV FALLBACK) ================');
  console.log(`From: ${fromAddress}`);
  console.log(`To: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(`Body: ${html}`);
  console.log('===============================================================');
}
