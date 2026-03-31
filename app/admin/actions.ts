"use server";

import { supabaseAdmin } from "@/lib/supabase";

export async function getOverviewStats() {
  const { data: teams, error } = await supabaseAdmin.from("teams").select("team_name, leader_name, mode, payment_status");
  if (error) throw error;
  
  // Get active payment fee for revenue calculation
  const { data: payments } = await supabaseAdmin.from("landing_payments").select("fee").eq("is_active", true).limit(1).single();
  const feeValue = payments ? parseInt(payments.fee.replace(/\D/g, '')) || 0 : 0;

  if (teams) {
    const csCount = teams.filter((t) => t.mode === "CS").length;
    const brCount = teams.filter((t) => t.mode === "BR").length;
    const approvedTeams = teams.filter((t) => t.payment_status === "approved");
    
    return {
      total: teams.length,
      cs: csCount,
      br: brCount,
      approved: approvedTeams.length,
      verifiedTeams: approvedTeams.map(t => ({ team_name: t.team_name, leader_name: t.leader_name, mode: t.mode })),
      revenue: approvedTeams.length * feeValue,
      cs_rooms_needed: Math.ceil(csCount / 12),
      br_rooms_needed: Math.ceil(brCount / 12),
      total_rooms_needed: Math.ceil(csCount / 12) + Math.ceil(brCount / 12)
    };
  }
  return { total: 0, cs: 0, br: 0, cs_rooms_needed: 0, br_rooms_needed: 0, total_rooms_needed: 0 };
}

export async function getAdminTeams() {
  const { data, error } = await supabaseAdmin.from("teams").select(`
    *,
    players (in_game_name, game_uid)
  `);
  if (error) throw error;
  return data || [];
}

export async function updateTeam(id: string, updates: any) {
  const { error } = await supabaseAdmin.from("teams").update(updates).eq("id", id);
  if (error) throw error;
  return true;
}

export async function updateTeamPaymentStatus(id: string, status: 'approved' | 'rejected') {
  const { error } = await supabaseAdmin.from("teams").update({ payment_status: status }).eq("id", id);
  if (error) throw error;
  return true;
}

export async function deleteTeam(id: string) {
  const { error } = await supabaseAdmin.from("teams").delete().eq("id", id);
  if (error) throw error;
  return true;
}

export async function getAdminMatches() {
  const { data, error } = await supabaseAdmin
    .from("matches")
    .select(`
        *,
        match_squads (
            team_id,
            teams (team_name, leader_name, mode)
        )
    `)
    .order("match_date", { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function createMatch(matchData: any) {
  try {
    if (!matchData.date_time) throw new Error("Match date/time is required.");

    const payload = {
      mode: matchData.mode,
      map_name: matchData.map_name || matchData.map,
      room_id: matchData.room_id,
      room_password: matchData.password || matchData.room_password, 
      match_date: matchData.date_time,
      status: "scheduled",
      created_at: new Date().toISOString()
    };

    const { data: mData, error: mError } = await supabaseAdmin
      .from("matches")
      .insert([payload])
      .select()
      .single();

    if (mError) throw new Error(mError.message);

    // Link squads if any
    if (matchData.team_ids && matchData.team_ids.length > 0 && mData) {
        const links = matchData.team_ids.map((tid: string) => ({
            match_id: mData.id,
            team_id: tid
        }));
        const { error: sError } = await supabaseAdmin.from("match_squads").insert(links);
        if (sError) throw sError;
    }

    return true;
  } catch (err: any) {
    throw err;
  }
}

export async function getMatchSquads(match_id: string) {
    const { data, error } = await supabaseAdmin
        .from("match_squads")
        .select(`
            team_id,
            teams (team_name, leader_name, mode)
        `)
        .eq("match_id", match_id);
    if (error) throw error;
    return data || [];
}

export async function deleteMatch(id: string) {
  const { error } = await supabaseAdmin.from("matches").delete().eq("id", id);
  if (error) throw error;
  return true;
}

// --- CMS ACTIONS ---

export async function getLandingTournaments() {
  const { data, error } = await supabaseAdmin.from("landing_tournaments").select("*").order("mode_id", { ascending: false });
  if (error) return [];
  return data;
}

export async function updateLandingTournament(id: string, updates: any) {
  const { error } = await supabaseAdmin.from("landing_tournaments").update(updates).eq("id", id);
  if (error) throw error;
  return true;
}

export async function getLandingPrizes() {
  const { data, error } = await supabaseAdmin.from("landing_prizes").select("*").order("place", { ascending: true });
  if (error) return [];
  return data;
}

export async function updateLandingPrize(id: string, updates: any) {
  const { error } = await supabaseAdmin.from("landing_prizes").update(updates).eq("id", id);
  if (error) throw error;
  return true;
}

export async function getLandingRules() {
  const { data, error } = await supabaseAdmin.from("landing_rules").select("*").order("rule_number", { ascending: true });
  if (error) return [];
  return data;
}

export async function updateLandingRule(id: string, updates: any) {
  const { error } = await supabaseAdmin.from("landing_rules").update(updates).eq("id", id);
  if (error) throw error;
  return true;
}

export async function createLandingRule(rule: any) {
  const { error } = await supabaseAdmin.from("landing_rules").insert([rule]);
  if (error) throw error;
  return true;
}

export async function deleteLandingRule(id: string) {
  const { error } = await supabaseAdmin.from("landing_rules").delete().eq("id", id);
  if (error) throw error;
  return true;
}

// --- STATS & HEADER ACTIONS ---

export async function getLandingStats() {
  const { data, error } = await supabaseAdmin.from("landing_stats").select("*").limit(1).single();
  if (error || !data) {
    return { 
      id: '00000000-0000-0000-0000-000000000000', 
      teams_registered: "UNLIMITED", 
      game_modes: "2", 
      prize_pool: "₹50K", 
      max_teams: "ROOM-12" 
    };
  }
  return data;
}

export async function updateLandingStats(id: string, updates: any) {
  const { error } = await supabaseAdmin.from("landing_stats").update(updates).eq("id", id);
  if (error) throw error;
  return true;
}

export async function getLandingContent() {
  const { data, error } = await supabaseAdmin.from("landing_content").select("*");
  if (error) return [];
  return data;
}

export async function updateLandingContent(key: string, value: string) {
  const { error } = await supabaseAdmin.from("landing_content").upsert({ key, value }).eq("key", key);
  if (error) throw error;
  return true;
}

export async function getTeamByPhone(phone: string) {
  if (!phone) return null;
  const cleanPhone = phone.replace(/\D/g, '');
  
  const { data, error } = await supabaseAdmin
    .from("teams")
    .select(`
      *,
      players (in_game_name, game_uid)
    `)
    .ilike('phone', `%${cleanPhone}%`)
    .single();

  if (error) return null;
  return data;
}

export async function getLatestBroadcast() {
  const { data, error } = await supabaseAdmin
    .from("landing_broadcasts")
    .select("*")
    .eq('is_active', true)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error) return null;
  return data;
}

export async function createBroadcast(broadcast: any) {
  const { error } = await supabaseAdmin
    .from("landing_broadcasts")
    .insert([broadcast]);

  if (error) throw error;
  return true;
}

// --- PAYMENT ACTIONS ---

export async function getLandingPayments() {
  const { data, error } = await supabaseAdmin.from("landing_payments").select("*").order("created_at", { ascending: false });
  if (error) return [];
  return data;
}

export async function updateLandingPayment(id: string, updates: any) {
  const { error } = await supabaseAdmin.from("landing_payments").update(updates).eq("id", id);
  if (error) throw error;
  return true;
}

export async function createLandingPayment(payment: any) {
  const { error } = await supabaseAdmin.from("landing_payments").insert([payment]);
  if (error) throw error;
  return true;
}

export async function deleteLandingPayment(id: string) {
  const { error } = await supabaseAdmin.from("landing_payments").delete().eq("id", id);
  if (error) throw error;
  return true;
}

// --- SETTINGS & GLOBAL CONFIG ---

export async function getGlobalSettings() {
  const { data, error } = await supabaseAdmin
    .from("global_settings")
    .select("*")
    .eq("id", "00000000-0000-0000-0000-000000000001")
    .maybeSingle();

  if (error || !data) {
    console.warn("Global settings missing, using fallbacks");
    return {
      whatsapp_group_link: "https://chat.whatsapp.com/LQDRfrdRLDP0b3KUSUYD3r",
      whatsapp_support_link: "https://wa.me/911234567890",
      is_registration_active: true
    };
  }
  return data;
}

export async function updateGlobalSettings(updates: any) {
  const { error } = await supabaseAdmin
    .from("global_settings")
    .update(updates)
    .eq("id", "00000000-0000-0000-0000-000000000001");

  if (error) throw error;
  return true;
}

export async function getApprovedSquadsForMatch(mode: string, limit: number = 12) {
    const { data, error } = await supabaseAdmin
        .from("teams")
        .select("*")
        .eq("mode", mode)
        .eq("payment_status", "approved")
        .order("created_at", { ascending: true })
        .limit(limit);

    if (error) throw error;
    return data || [];
}

// --- POINTS & LEADERBOARD ---

export async function deployMatch(matchId: string) {
  const { data, error } = await supabaseAdmin
    .from("matches")
    .update({ status: 'Ongoing' })
    .eq("id", matchId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getMatchDetails(matchId: string) {
  const { data, error } = await supabaseAdmin
    .from("matches")
    .select(`
      *,
      match_squads (
        team_id,
        teams (*)
      )
    `)
    .eq("id", matchId)
    .single();
  if (error) throw error;
  return data;
}

export async function saveSquadResults(matchId: string, results: any[]) {
  // results = [{ team_id, placement_rank, kill_points, placement_points }]
  const toInsert = results.map(r => ({
    ...r,
    match_id: matchId,
    total_points: (Number(r.kill_points) || 0) + (Number(r.placement_points) || 0)
  }));

  const { error } = await supabaseAdmin.from("match_points").insert(toInsert);
  if (error) throw error;
  
  // Mark match as Completed
  await supabaseAdmin.from("matches").update({ status: 'Completed' }).eq("id", matchId);
  return true;
}

export async function getSeasonLeaderboard() {
  const { data, error } = await supabaseAdmin
    .from("match_points")
    .select(`
      total_points,
      kill_points,
      teams (
        team_name,
        mode
      )
    `);

  if (error) throw error;

  // Aggregate points by team name
  const aggregation: Record<string, any> = {};
  data.forEach((entry: any) => {
    const name = entry.teams.team_name;
    if (!aggregation[name]) {
      aggregation[name] = { name, total: 0, kills: 0, matches: 0, mode: entry.teams.mode };
    }
    aggregation[name].total += entry.total_points;
    aggregation[name].kills += entry.kill_points;
    aggregation[name].matches += 1;
  });

  return Object.values(aggregation).sort((a, b) => b.total - a.total);
}

export async function deleteMatchPointsByTeam(name: string) {
  // First get the team ID from the name
  const { data: team } = await supabaseAdmin.from("teams").select("id").eq("team_name", name).single();
  if (team) {
    const { error } = await supabaseAdmin.from("match_points").delete().eq("team_id", team.id);
    if (error) throw error;
    return true;
  }
  return false;
}
