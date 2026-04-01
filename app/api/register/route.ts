import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const { teamName, leaderName, phone, mode, players, paymentScreenshotUrl } = await req.json();

    // 0. Check for existing phone number (Duplicate prevention)
    const { data: existingTeam } = await supabaseAdmin
      .from('teams')
      .select('id')
      .eq('phone', phone)
      .maybeSingle();

    if (existingTeam) {
      return NextResponse.json(
        { error: "THIS WHATSAPP NUMBER IS ALREADY REGISTERED. PLEASE USE THE 'BATTLE LOGS' PORTAL TO CHECK STATUS." }, 
        { status: 400 }
      );
    }

    // 1. Insert Team into Supabase (Auto-generating dummy email to pass NOT NULL constraint)
    const { data: teamData, error: teamError } = await supabaseAdmin
      .from('teams')
      .insert([
        { 
          team_name: teamName, 
          leader_name: leaderName, 
          phone, 
          email: `${phone.replace(/\D/g, '')}@demonx.app`,
          mode,
          payment_status: 'pending',
          payment_screenshot_url: paymentScreenshotUrl
        }
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

    // 3. Generate Readable Team ID for WhatsApp
    const shortenedTeamId = teamId.split('-')[0];
    const readableId = `TEAM-${shortenedTeamId}-${mode}`;

    return NextResponse.json({ success: true, teamId: readableId });
  } catch (error: any) {
    console.error('Registration API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
