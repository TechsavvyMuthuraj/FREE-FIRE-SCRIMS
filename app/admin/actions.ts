"use server";

import { supabaseAdmin } from "@/lib/supabase";
export { supabaseAdmin };

export async function getOverviewStats() {
  const { data: teams, error } = await supabaseAdmin.from("teams").select("team_name, leader_name, mode, payment_status");
  if (error) throw error;
  
  const { data: payments } = await supabaseAdmin.from("landing_payments").select("fee").eq("is_active", true).limit(1).single();
  const feeValue = payments ? parseInt(payments.fee.replace(/\D/g, '')) || 0 : 0;

  if (teams) {
    const csCount = teams.filter((t: any) => t.mode === "CS").length;
    const brCount = teams.filter((t: any) => t.mode === "BR").length;
    const approvedTeams = teams.filter((t: any) => t.payment_status === "approved");
    
    return {
      total: teams.length,
      cs: csCount,
      br: brCount,
      approved: approvedTeams.length,
      revenue: approvedTeams.length * feeValue,
      verifiedSquads: approvedTeams // For audit list
    };
  }
  return { total: 0, cs: 0, br: 0, approved: 0, revenue: 0, verifiedSquads: [] };
}

export async function getAdminTeams() {
  const { data, error } = await supabaseAdmin
    .from("teams")
    .select(`
      *,
      players (*)
    `)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function deleteTeam(id: string) {
  const { error } = await supabaseAdmin.from("teams").delete().eq("id", id);
  if (error) throw error;
  return true;
}

export async function updateTeam(id: string, updates: any) {
  const { error } = await supabaseAdmin.from("teams").update(updates).eq("id", id);
  if (error) throw error;
  return true;
}

export async function updateTeamPaymentStatus(id: string, status: string) {
  const { error } = await supabaseAdmin.from("teams").update({ payment_status: status }).eq("id", id);
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

    if (mError) throw mError;

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

export async function updateMatch(id: string, updates: any) {
  const { error } = await supabaseAdmin.from("matches").update(updates).eq("id", id);
  if (error) throw error;
  return true;
}

export async function getAuditRecords() {
  const { data, error } = await supabaseAdmin
    .from("teams")
    .select("id, team_name, payment_status, created_at")
    .eq("payment_status", "approved");
  if (error) throw error;
  return data || [];
}

export async function getLandingSettings() {
  const { data, error } = await supabaseAdmin.from("landing_settings").select("*").single();
  if (error) return null;
  return data;
}

export async function updateLandingSettings(updates: any) {
  const { error } = await supabaseAdmin.from("landing_settings").update(updates).eq("id", 1);
  if (error) throw error;
  return true;
}

export async function getGlobalSettings() {
  const { data, error } = await supabaseAdmin
    .from("global_settings")
    .select("*")
    .eq("id", "00000000-0000-0000-0000-000000000001")
    .single();

  if (error) throw error;
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
  const toInsert = results.map(r => ({
    ...r,
    match_id: matchId,
    total_points: (Number(r.kill_points) || 0) + (Number(r.placement_points) || 0)
  }));

  const { error } = await supabaseAdmin.from("match_points").insert(toInsert);
  if (error) throw error;
  
  await supabaseAdmin.from("matches").update({ status: 'Completed' }).eq("id", matchId);
  return true;
}

export async function linkSquadsToMatch(matchId: string, squadIds: string[]) {
    try {
        const links = squadIds.map(tid => ({
            match_id: matchId,
            team_id: tid
        }));
        const { error } = await supabaseAdmin.from("match_squads").insert(links);
        if (error) throw error;
        return true;
    } catch (err) { throw err; }
}

export async function getSeasonLeaderboard() {
  const { data, error } = await supabaseAdmin
    .from("match_points")
    .select(`
      total_points,
      kill_points,
      teams (
        team_name,
        leader_name,
        mode
      )
    `);

  if (error) throw error;

  const aggregated = data.reduce((acc: any, curr: any) => {
    const teamName = curr.teams.team_name;
    if (!acc[teamName]) {
      acc[teamName] = {
        name: teamName,
        leader: curr.teams.leader_name,
        mode: curr.teams.mode,
        points: 0,
        kills: 0,
        matches: 0
      };
    }
    acc[teamName].points += curr.total_points;
    acc[teamName].kills += curr.kill_points;
    acc[teamName].matches += 1;
    return acc;
  }, {});

  return Object.values(aggregated).sort((a: any, b: any) => b.points - a.points);
}
