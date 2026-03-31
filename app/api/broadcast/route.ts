import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function POST(req: Request) {
  try {
    const { subject, message, targetGroup, matchTime, roomId, roomPassword } = await req.json();

    let query = supabaseAdmin.from('teams').select('email');

    if (targetGroup === 'CS') query = query.eq('mode', 'CS');
    if (targetGroup === 'BR') query = query.eq('mode', 'BR');

    const { data: teams, error } = await query;
    if (error) throw new Error(error.message);

    if (!teams || teams.length === 0) {
      return NextResponse.json({ error: "No recipients found" }, { status: 404 });
    }

    const emails = teams.map(t => t.email).filter(Boolean);

    if (emails.length === 0) {
      return NextResponse.json({ error: "No recipients found" }, { status: 404 });
    }

    // Send emails using Nodemailer
    try {
      await transporter.sendMail({
        from: `"FF Scrims Updates" <${process.env.GMAIL_USER}>`,
        to: process.env.GMAIL_USER, // Required; BCC holds the actual list
        bcc: emails,
        subject: subject,
        html: `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
      body { margin: 0; padding: 0; background-color: #08080E; font-family: Arial, sans-serif; color: #E0E0F0; }
      .container { max-width: 600px; margin: auto; background: #0F0F1A; border-radius: 10px; overflow: hidden; border: 1px solid rgba(255,107,0,0.2); }
      .header { padding: 30px; text-align: center; background: linear-gradient(135deg, #0F0F1A, #1A0A00); }
      .brand { font-size: 20px; font-weight: bold; color: #FF6B00; }
      .tag { margin-top: 10px; font-size: 12px; color: #00FF88; }
      .title { font-size: 24px; font-weight: bold; text-align: center; padding: 20px; color: #FFD700; }
      .body { padding: 20px 30px; font-size: 14px; line-height: 1.6; color: #AAAACC; }
      .highlight { background: rgba(255,107,0,0.08); border-left: 3px solid #FF6B00; padding: 15px; margin: 20px 0; border-radius: 6px; color: #E0E0F0; }
      .cta { text-align: center; padding: 20px; }
      .btn { background: linear-gradient(135deg, #FF6B00, #FFD700); color: #08080E !important; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; }
      .footer { text-align: center; padding: 20px; font-size: 12px; color: #666688; border-top: 1px solid rgba(255,107,0,0.1); }
      .footer a { color: #FF6B00; text-decoration: none; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <div class="brand">🔥 DEMON X LIVE</div>
        <div class="tag">⚡ EMAIL BROADCAST</div>
      </div>
      <div class="title">${subject}</div>
      <div class="body" style="white-space: pre-wrap;">${message}</div>
      ${(matchTime || roomId || roomPassword) ? `
      <div class="body" style="padding-top: 0;">
        <div class="highlight">
          ${matchTime ? `Match Time: ${matchTime}<br />` : ''}
          ${roomId ? `Room ID: ${roomId}<br />` : ''}
          ${roomPassword ? `Password: ${roomPassword}` : ''}
        </div>
      </div>` : ''}
      <div class="cta">
        <a href="https://chat.whatsapp.com/LQDRfrdRLDP0b3KUSUYD3r?mode=gi_broadcast" class="btn"> JOIN WHATSAPP GROUP </a>
        <p style="margin-top:10px; font-size: 12px; color: #666688;">
          If button not working:
          <a href="https://chat.whatsapp.com/LQDRfrdRLDP0b3KUSUYD3r?mode=gi_broadcast" style="color: #FF6B00;"> Click here </a>
        </p>
      </div>
      <div class="footer">
        Demon X Live Scrims <br />
        Support: <a href="mailto:iamprince8899@gmail.com">support@ffscrims.gg</a><br /><br />
        This is an official tournament broadcast message.
      </div>
    </div>
  </body>
</html>
      `,
      });
      console.log('Broadcast email sent successfully via Gmail');
      return NextResponse.json({ success: true, sentCount: emails.length });
    } catch (emailError: any) {
      console.error('Nodemailer Error:', emailError);
      return NextResponse.json({ error: emailError.message }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Broadcast API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
