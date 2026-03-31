import Link from "next/link";
import "./page.css";
import {
  getLandingTournaments,
  getLandingPrizes,
  getLandingRules,
  getLandingStats,
  getLandingContent
} from "./admin/actions";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Home() {
  const [tournaments, prizes, rules, stats, content] = await Promise.all([
    getLandingTournaments(),
    getLandingPrizes(),
    getLandingRules(),
    getLandingStats(),
    getLandingContent()
  ]);

  // Helper to get dynamic text or fallback to default
  const getText = (key: string, fallback: string) => {
    return content.find((c: any) => c.key === key)?.value || fallback;
  };

  return (
    <div id="page-landing" className="page active">
      <div className="hero">
        <div className="hero-bg"></div>
        <div className="hero-grid"></div>
        <div className="hero-content">
          <div className="hero-logo-container">
            <div className="hero-logo-glow"></div>
            <img src="data:image/jpeg;base64,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" alt="Demon X Live Logo" className="hero-logo" />
          </div>
          <h1 className="hero-title">Demon <span>X</span> Live</h1>
          <div className="hero-badge">SEASON 2025 · NOW OPEN</div>

          <p className="hero-sub">Only the fearless survive. Battle, dominate, and write your legacy in Demon X Live.</p>
          <div className="hero-actions">
            <Link href="/register" className="btn-primary">REGISTER YOUR TEAM</Link>
            <a href="#tournaments" className="btn-secondary">VIEW TOURNAMENTS</a>
          </div>
        </div>
      </div>

      {/* STATS */}
      <div className="stats-strip">
        <div className="stat-item">
          <span className="stat-num" id="counter-teams">{stats.teams_registered}</span>
          <span className="stat-label">Teams Registered</span>
        </div>
        <div className="stat-item">
          <span className="stat-num">{stats.game_modes}</span>
          <span className="stat-label">Game Modes</span>
        </div>
        <div className="stat-item">
          <span className="stat-num">{stats.prize_pool}</span>
          <span className="stat-label">Prize Pool</span>
        </div>
        <div className="stat-item">
          <span className="stat-num">{stats.max_teams}</span>
          <span className="stat-label">Max Teams</span>
        </div>
      </div>

      {/* TOURNAMENTS */}
      <div className="section" id="tournaments">
        <div className="section-label"> TOURNAMENTS</div>
        <h2 className="section-title">CHOOSE YOUR<br />BATTLEGROUND</h2>
        <p className="section-desc">Two distinct modes — each with unique strategies and prize pools. Register for one or both.</p>

        <div className="mode-grid">
          {tournaments.map((t: any) => (
            <div className={`mode-card ${t.mode_id}`} key={t.id}>
              <div className={`mode-tag ${t.mode_id}`}>{t.mode_tag}</div>
              <div className="mode-name">{t.mode_name}</div>
              <p className="mode-desc">{t.description}</p>
              <div className="mode-meta">
                <div><span>Teams: </span><strong>{t.teams}</strong></div>
                <div><span>Format: </span><strong>{t.format}</strong></div>
                <div><span>Prize: </span><strong>{t.prize}</strong></div>
                <div><span style={{ color: "var(--ff-orange)", fontWeight: 600 }}>Schedule: </span><strong style={{ color: "#fff" }}>{t.match_time || 'TBD'}</strong></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* PRIZES */}
      <div style={{ background: "var(--ff-card)", borderTop: "1px solid var(--ff-border)", borderBottom: "1px solid var(--ff-border)" }}>
        <div className="section" id="prizes">
          <div className="section-label">{getText('prize_section_label', '// PRIZE POOL')}</div>
          <h2 className="section-title">{getText('prize_section_title', 'TOTAL ₹50,000')}</h2>
          <p className="section-desc">{getText('prize_section_desc', 'Split across CS and BR modes. Winners take all — fight for every placement.')}</p>
          <div className="prize-grid">
            {prizes.map((p: any) => (
              <div className={`prize-card ${p.tier}`} key={p.id}>
                <div className="prize-rank">{p.rank_label}</div>
                <div className="prize-place">{p.place}</div>
                <div className="prize-amount">{p.amount}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RULES */}
      <div className="section" id="rules">
        <div className="section-label">{getText('rules_section_label', '// RULES & REGULATIONS')}</div>
        <h2 className="section-title">{getText('rules_section_title', 'PLAY BY THE CODE')}</h2>
        <p className="section-desc">{getText('rules_section_desc', 'Read carefully. Violations result in immediate disqualification.')}</p>
        <div className="rules-grid">
          {rules.map((r: any) => (
            <div className="rule-item" key={r.id}>
              <span className="rule-num">{r.rule_number}</span>
              {r.description}
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ textAlign: "center", padding: "4rem 2rem", background: "var(--ff-card)", borderTop: "1px solid var(--ff-border)" }}>
        <div className="section-label" style={{ textAlign: "center" }}> SLOTS FILLING FAST</div>
        <h2 className="section-title" style={{ textAlign: "center", marginBottom: "1rem" }}>READY TO COMPETE?</h2>
        <p style={{ color: "var(--ff-muted)", marginBottom: "2rem", fontSize: "1rem" }}>Join the next elite Free Fire scrim and prove your squad's worth.</p>
        <Link href="/register" className="btn-primary">REGISTER YOUR TEAM NOW</Link>
      </div>

      <div style={{ textAlign: "center", padding: "1.5rem", background: "var(--ff-darker)", borderTop: "1px solid var(--ff-border)" }}>
        <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", letterSpacing: "0.1em", color: "var(--ff-muted)" }}>
          FF SCRIMS · ALL RIGHTS RESERVED · NOT AFFILIATED WITH GARENA
        </p>
      </div>
    </div>
  );
}
