"use server";

import { supabaseAdmin } from "@/lib/supabase";

export async function getOverviewStats() {
  const { data: teams, error } = await supabaseAdmin.from("teams").select("mode");
  if (error) throw error;
  
  if (teams) {
    const csCount = teams.filter((t) => t.mode === "CS").length;
    const brCount = teams.filter((t) => t.mode === "BR").length;
    return {
      total: teams.length,
      cs: csCount,
      br: brCount,
      slots: Math.max(0, 24 - teams.length),
    };
  }
  return { total: 0, cs: 0, br: 0, slots: 24 };
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

export async function deleteTeam(id: string) {
  const { error } = await supabaseAdmin.from("teams").delete().eq("id", id);
  if (error) throw error;
  return true;
}

export async function getAdminMatches() {
  const { data, error } = await supabaseAdmin.from("matches").select("*").order("match_date", { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function createMatch(matchData: any) {
  try {
    console.log("Attempting to create match with payload:", matchData);

    if (!matchData.date_time) throw new Error("Match date/time is required.");

    const payload = {
      mode: matchData.mode,
      map_name: matchData.map,
      room_id: matchData.room_id,
      room_password: matchData.password, // Match new SQL column
      match_date: matchData.date_time,
      status: "scheduled",
      created_at: new Date().toISOString()
    };

    console.log("Transformed Supabase Payload:", payload);

    const { data, error } = await supabaseAdmin
      .from("matches")
      .insert([payload])
      .select();

    if (error) {
      console.error("Supabase Insertion Error:", error);
      throw new Error(error.message);
    }

    console.log("Match created successfully:", data);
    return true;
  } catch (err: any) {
    console.error("Match Creation Exception:", err);
    throw err;
  }
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

// --- STATS & HEADER ACTIONS ---

export async function getLandingStats() {
  const { data, error } = await supabaseAdmin.from("landing_stats").select("*").limit(1).single();
  if (error || !data) {
    console.log("No stats found in DB, using defaults and checking for ID...");
    return { 
      id: '00000000-0000-0000-0000-000000000000', 
      teams_registered: "102", 
      game_modes: "2", 
      prize_pool: "₹50K", 
      max_teams: "24" 
    };
  }
  return data;
}

export async function updateLandingStats(id: string, updates: any) {
  console.log("Updating stats for ID:", id, "with data:", updates);
  const { error } = await supabaseAdmin.from("landing_stats").update(updates).eq("id", id);
  if (error) {
    console.error("Error updating stats:", error);
    throw error;
  }
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
