import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import nodemailer from 'nodemailer';

// Create a reusable transporter using Gmail SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function POST(req: Request) {
  try {
    const { teamName, leaderName, email, phone, mode, players } = await req.json();

    // 1. Insert Team into Supabase
    const { data: teamData, error: teamError } = await supabaseAdmin
      .from('teams')
      .insert([
        { team_name: teamName, leader_name: leaderName, email, phone, mode }
      ])
      .select('id')
      .single();

    if (teamError) throw new Error(teamError.message);

    const teamId = teamData.id;

    // 2. Insert Players into Supabase
    const playersToInsert = players.map((p: any) => ({
      team_id: teamId,
      in_game_name: p.name,
      game_uid: p.uid
    }));

    const { error: playersError } = await supabaseAdmin
      .from('players')
      .insert(playersToInsert);

    if (playersError) throw new Error(playersError.message);

    // 3. Send Confirmation Email using Nodemailer
    const shortenedTeamId = teamId.split('-')[0];
    const readableId = `TEAM-${shortenedTeamId}-${mode}`;
    const registrationDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });

    // Dynamic Player Rows
    const playerRows = players.map((p: any, i: number) => `
      <tr>
        <td style="padding: 10px 12px; font-size: 13px; border-bottom: 1px solid rgba(255, 107, 0, 0.08); vertical-align: middle;">
          <span style="font-family:'Courier New',monospace;font-size:11px;color:#FF6B00;font-weight:700;">P${i + 1}</span>
        </td>
        <td style="padding: 10px 12px; font-size: 13px; border-bottom: 1px solid rgba(255, 107, 0, 0.08); vertical-align: middle; color:#E0E0F0;">
          ${p.name}
          ${i === 0 ? '<span style="font-size:10px;color:#FF6B00;font-family:\'Courier New\',monospace;margin-left:6px;">LEADER</span>' : ''}
        </td>
        <td style="padding: 10px 12px; font-size: 13px; border-bottom: 1px solid rgba(255, 107, 0, 0.08); vertical-align: middle;">
          <span style="font-family:'Courier New',monospace;font-size:11px;color:#8888AA;">${p.uid}</span>
        </td>
      </tr>
    `).join('');

    try {
      await transporter.sendMail({
        from: `"FF Scrims" <${process.env.GMAIL_USER}>`,
        to: email,
        subject: `Registration Confirmed - ${teamName} - FF Scrims`,
        html: `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Rajdhani:wght@400;500;600;700&display=swap');
    </style>
  </head>
  <body style="background-color: #08080E; font-family: 'Rajdhani', sans-serif; color: #E0E0F0; margin: 0; padding: 0;">
    <div style="width: 100%; background-color: #08080E; padding: 40px 16px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #0F0F1A; border-radius: 12px; overflow: hidden; border: 1px solid rgba(255, 107, 0, 0.2);">
        <!-- HEADER -->
        <div style="background: linear-gradient(135deg, #0F0F1A 0%, #1A0A00 100%); position: relative;">
          <div style="background: linear-gradient(90deg, #FF6B00, #FFD700, #FF6B00); height: 3px;"></div>
          <div style="padding: 40px 40px 32px;">
            <div style="display: flex; align-items: center; margin-bottom: 28px;">
               <div style="font-family: Orbitron, sans-serif; font-size: 18px; font-weight: 900; letter-spacing: 0.1em; color: #FF6B00;">FF SCRIMS</div>
            </div>
            <div style="display: inline-block; background: rgba(0, 255, 136, 0.1); border: 1px solid rgba(0, 255, 136, 0.35); border-radius: 3px; font-family: 'Courier New', monospace; font-size: 10px; color: #00FF88; padding: 4px 10px; margin-bottom: 14px;">✓ REGISTRATION CONFIRMED</div>
            <div style="font-family: Orbitron, sans-serif; font-size: 26px; font-weight: 900; line-height: 1.15; color: #F0F0FF;">YOUR SQUAD IS<br />IN THE <span style="background: linear-gradient(90deg, #FF6B00, #FFD700); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; color: #FF6B00;">BATTLE</span></div>
            <div style="font-size: 15px; color: #8888AA; margin-top: 10px;">Welcome to the arena, <strong>${teamName}</strong>. Your registration has been received and confirmed.</div>
          </div>
        </div>

        <!-- TEAM ID -->
        <div style="margin: 0 40px; background: rgba(255, 107, 0, 0.06); border: 1px solid rgba(255, 107, 0, 0.25); border-radius: 8px; padding: 20px 24px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="font-family: 'Courier New', monospace; font-size: 9px; color: #FF6B00; text-transform: uppercase;">Your Team ID</div>
            <div style="font-family: Orbitron, sans-serif; font-size: 22px; font-weight: 900; color: #FF6B00;">${readableId}</div>
          </div>
          <div style="text-align: right;">
            <div style="font-family: 'Courier New', monospace; font-size: 9px; color: #8888AA; text-transform: uppercase;">Registered On</div>
            <div style="font-size: 14px; font-weight: 700; color: #E0E0F0; font-family: 'Courier New', monospace;">${registrationDate}</div>
          </div>
        </div>

        <!-- BODY -->
        <div style="padding: 32px 40px;">
          <div style="font-family: 'Courier New', monospace; font-size: 9px; color: #FF6B00; text-transform: uppercase; margin-bottom: 14px;">Team Details</div>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
            <tr style="border-bottom: 1px solid rgba(255, 107, 0, 0.1);">
              <td style="padding: 10px 0; font-family: 'Courier New', monospace; font-size: 10px; color: #8888AA; text-transform: uppercase; width: 38%;">Team Name</td>
              <td style="padding: 10px 0; font-weight: 600; color: #F0F0FF; font-size: 16px;">${teamName}</td>
            </tr>
            <tr style="border-bottom: 1px solid rgba(255, 107, 0, 0.1);">
              <td style="padding: 10px 0; font-family: 'Courier New', monospace; font-size: 10px; color: #8888AA; text-transform: uppercase;">Leader</td>
              <td style="padding: 10px 0; color: #E0E0F0;">${leaderName} &nbsp;<span style="font-family:'Courier New',monospace;font-size:11px;color:#8888AA;">UID: ${players[0].uid}</span></td>
            </tr>
            <tr style="border-bottom: 1px solid rgba(255, 107, 0, 0.1);">
              <td style="padding: 10px 0; font-family: 'Courier New', monospace; font-size: 10px; color: #8888AA; text-transform: uppercase;">Contact</td>
              <td style="padding: 10px 0; color: #E0E0F0;">${email} &nbsp;·&nbsp; ${phone}</td>
            </tr>
            <tr style="border-bottom: 1px solid rgba(255, 107, 0, 0.1);">
              <td style="padding: 10px 0; font-family: 'Courier New', monospace; font-size: 10px; color: #8888AA; text-transform: uppercase;">Match Mode</td>
              <td style="padding: 10px 0; color: #E0E0F0;">
                ${mode === 'CS' ? 
                  '<span style="background: rgba(0, 191, 255, 0.12); color: #00BFFF; border: 1px solid rgba(0, 191, 255, 0.3); padding: 3px 10px; border-radius: 2px;">CS MODE · CLASH SQUAD</span>' : 
                  '<span style="background: rgba(255, 45, 45, 0.12); color: #FF4444; border: 1px solid rgba(255, 45, 45, 0.3); padding: 3px 10px; border-radius: 2px;">BR MODE · BATTLE ROYALE</span>'
                }
              </td>
            </tr>
          </table>

          <!-- PLAYERS -->
          <div style="font-family: 'Courier New', monospace; font-size: 9px; color: #FF6B00; text-transform: uppercase; margin-bottom: 14px;">Registered Players</div>
          <div style="background: #12121E; border: 1px solid rgba(255,107,0,0.15); border-radius: 8px; overflow: hidden; margin-bottom: 24px;">
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background: rgba(255, 107, 0, 0.08);">
                  <th style="font-family: 'Courier New', monospace; font-size: 9px; color: #FF6B00; padding: 9px 12px; text-align: left;">#</th>
                  <th style="font-family: 'Courier New', monospace; font-size: 9px; color: #FF6B00; padding: 9px 12px; text-align: left;">Player Name</th>
                  <th style="font-family: 'Courier New', monospace; font-size: 9px; color: #FF6B00; padding: 9px 12px; text-align: left;">Game UID</th>
                </tr>
              </thead>
              <tbody>
                ${playerRows}
              </tbody>
            </table>
          </div>

          <!-- MATCH INFO -->
          <div style="font-family: 'Courier New', monospace; font-size: 9px; color: #FF6B00; text-transform: uppercase; margin-bottom: 14px;">Match Assignment</div>
          <div style="background: rgba(0, 191, 255, 0.04); border: 1px solid rgba(0, 191, 255, 0.2); border-left: 3px solid #00BFFF; border-radius: 6px; padding: 20px; margin-bottom: 24px;">
            <div style="font-family:'Courier New',monospace;font-size:9px;color:#00BFFF;margin-bottom:14px;text-transform:uppercase;font-weight:700;">Match Credentials — Keep This Confidential</div>
            <table style="width:100%; border-collapse: collapse;">
              <tr>
                <td style="padding:6px 0; width:50%;">
                  <div style="font-family:'Courier New',monospace;font-size:9px;color:#8888AA;text-transform:uppercase;">Match Date</div>
                  <div style="font-size:15px;font-weight:700;color:#E0E0F0;">TBD</div>
                </td>
                <td style="padding:6px 0; width:50%;">
                  <div style="font-family:'Courier New',monospace;font-size:9px;color:#8888AA;text-transform:uppercase;">Match Time</div>
                  <div style="font-size:15px;font-weight:700;color:#E0E0F0;">TBD</div>
                </td>
              </tr>
              <tr>
                <td style="padding:14px 0 6px 0;">
                  <div style="font-family:'Courier New',monospace;font-size:9px;color:#8888AA;text-transform:uppercase;">Room ID</div>
                  <div style="font-family:'Orbitron',monospace;font-size:18px;color:#FF6B00;font-weight:700;">TBD</div>
                </td>
                <td style="padding:14px 0 6px 0;">
                  <div style="font-family:'Courier New',monospace;font-size:9px;color:#8888AA;text-transform:uppercase;">Password</div>
                  <div style="font-family:'Orbitron',monospace;font-size:18px;color:#FFD700;font-weight:700;">TBD</div>
                </td>
              </tr>
            </table>
            <p style="font-size: 12px; color: #8888AA; margin-top: 15px; font-style: italic;">Match details will be shared via Email/WhatsApp 15 mins before match starts.</p>
          </div>

          <!-- NEXT STEPS -->
          <div style="font-family: 'Courier New', monospace; font-size: 9px; color: #FF6B00; text-transform: uppercase; margin-bottom: 14px;">What Happens Next</div>
          <ul style="list-style: none; padding: 0; margin-bottom: 24px;">
            <li style="display: flex; gap: 14px; padding: 12px 0; border-bottom: 1px solid rgba(255, 107, 0, 0.08); font-size: 14px; color: #AAAACC;">
              <span style="font-family: Orbitron, sans-serif; font-size: 11px; font-weight: 900; color: #FF6B00; background: rgba(255, 107, 0, 0.12); border: 1px solid rgba(255, 107, 0, 0.25); border-radius: 3px; min-width: 26px; height: 22px; display: inline-flex; align-items: center; justify-content: center;">01</span>
              Save your Team ID — it's your primary identification.
            </li>
            <li style="display: flex; gap: 14px; padding: 12px 0; border-bottom: 1px solid rgba(255, 107, 0, 0.08); font-size: 14px; color: #AAAACC;">
              <span style="font-family: Orbitron, sans-serif; font-size: 11px; font-weight: 900; color: #FF6B00; background: rgba(255, 107, 0, 0.12); border: 1px solid rgba(255, 107, 0, 0.25); border-radius: 3px; min-width: 26px; height: 22px; display: inline-flex; align-items: center; justify-content: center;">02</span>
              Join the WhatsApp group via the link below for live announcements.
            </li>
            <li style="display: flex; gap: 14px; padding: 12px 0; border-bottom: 1px solid rgba(255, 107, 0, 0.08); font-size: 14px; color: #AAAACC;">
              <span style="font-family: Orbitron, sans-serif; font-size: 11px; font-weight: 900; color: #FF6B00; background: rgba(255, 107, 0, 0.12); border: 1px solid rgba(255, 107, 0, 0.25); border-radius: 3px; min-width: 26px; height: 22px; display: inline-flex; align-items: center; justify-content: center;">03</span>
              Check your email 15 minutes before scheduled match time for Room ID.
            </li>
          </ul>

          <!-- WARNING -->
          <div style="background: rgba(255, 215, 0, 0.05); border: 1px solid rgba(255, 215, 0, 0.25); border-radius: 6px; padding: 16px 18px;">
            <div style="font-family: 'Courier New', monospace; font-size: 9px; color: #FFD700; text-transform: uppercase; margin-bottom: 8px; font-weight: 700;">⚠ Important Notice</div>
            <p style="font-size: 13px; color: #AAAACC; margin: 0; line-height: 1.7;">
              Any form of cheating, hacking, or unsportsmanlike behavior results in immediate disqualification.
            </p>
          </div>
        </div>

        <div style="text-align: center; padding: 32px 40px; border-top: 1px solid rgba(255, 107, 0, 0.15);">
          <p style="font-size:14px;color:#8888AA;margin-bottom:20px;">Join our community for real-time updates and announcements.</p>
          <a href="https://chat.whatsapp.com/LQDRfrdRLDP0b3KUSUYD3r" style="display: inline-block; font-family: Orbitron, sans-serif; font-size: 12px; font-weight: 900; color: #08080E; background: linear-gradient(135deg, #FF6B00, #FFD700); text-decoration: none; border-radius: 6px; padding: 14px 36px;">JOIN WHATSAPP GROUP →</a>
        </div>

        <!-- FOOTER -->
        <div style="background: #080810; padding: 28px 40px; text-align: center; border-top: 1px solid rgba(255, 107, 0, 0.15);">
          <div style="font-family: Orbitron, sans-serif; font-size: 13px; font-weight: 900; color: #FF6B00;">FF SCRIMS</div>
          <div style="font-size: 12px; color: #666688; margin-top: 14px;">
            Season 2025 · Not affiliated with Garena.<br />
            Questions? Contact us at <a href="mailto:iamprince8899@gmail.com" style="color: #FF6B00; text-decoration: none;">iamprince8899@gmail.com</a>
          </div>
        </div>
      </div>
    </div>
  </body>
</html>
      `,
      });
      console.log('Registration email sent successfully via Gmail');
    } catch (emailError) {
      console.error('Nodemailer Error:', emailError);
    }

    return NextResponse.json({ success: true, teamId: readableId });
  } catch (error: any) {
    console.error('Registration API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
