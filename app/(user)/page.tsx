import Link from "next/link";
import UserStatusHeader from "@/components/UserStatusHeader";
import BroadcastAlert from "@/components/BroadcastAlert";
import "./page.css";
import {
  getLandingTournaments,
  getLandingPrizes,
  getLandingRules,
  getLandingStats,
  getLandingContent,
  getLatestBroadcast
} from "../admin/actions";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Home() {
  const [tournaments, prizes, rules, stats, content, liveBroadcast] = await Promise.all([
    getLandingTournaments(),
    getLandingPrizes(),
    getLandingRules(),
    getLandingStats(),
    getLandingContent(),
    getLatestBroadcast()
  ]);

  const getText = (key: string, fallback: string) => {
    return content.find((c: any) => c.key === key)?.value || fallback;
  };

  return (
    <div id="page-landing">
      <BroadcastAlert broadcast={liveBroadcast} />

      <UserStatusHeader />
      <div className="hero-glow-big"></div>

      <div className="hero-centered">
        <div className="hero-content-wrap animate-up">
          <div className="hero-logo-container">
            <div className="logo-glow-ring"></div>
            <img
              src="https://cdn.jsdelivr.net/gh/free-whiteboard-online/Free-Erasorio-Alternative-for-Collaborative-Design@1933e9c87d09100c38827b162b5505afb661bbd6/uploads/2026-03-31T14-11-12-736Z-pxddwx9ll.png"
              alt="Demon X Logo"
              className="hero-logo-hd"
            />
          </div>

          <h1 className="hero-title-main">
            Demon <span className="text-orange">X</span> Live
          </h1>

          <div className="season-badge">SEASON 2025 · UNLIMITED ENROLLMENT</div>

          <p className="hero-desc-main text-balance">
            Infinite registration is now active. Every 12 squads trigger a new match deployment. Claim your spot in the next room.
          </p>

          <div className="hero-actions-centered">
            <Link href="/register" className="btn-demon-solid">REGISTER YOUR SQUAD</Link>
            <a href="#tournaments" className="btn-demon-outline">EXPLORE MODES</a>
          </div>
        </div>
      </div>

      <div className="diagonal-section-wrapper">
        <div className="stats-strip-luxe animate-up" style={{ animationDelay: '0.4s' }}>
          <div className="stat-item-luxe">
            <span className="stat-label-luxe">ENROLLED</span>
            <span className="stat-num-luxe">{stats.teams_registered}</span>
          </div>
          <div className="stat-item-luxe">
            <span className="stat-label-luxe">MODES</span>
            <span className="stat-num-luxe">{stats.game_modes}</span>
          </div>
          <div className="stat-item-luxe">
            <span className="stat-label-luxe">PRIZEPOOL</span>
            <span className="stat-num-luxe">{stats.prize_pool}</span>
          </div>
          <div className="stat-item-luxe">
            <span className="stat-label-luxe">MATCH SYSTEM</span>
            <span className="stat-num-luxe">{stats.max_teams || '12-QUAD'}</span>
          </div>
        </div>
      </div>

      <div className="section" id="tournaments">
        <div className="section-label animate-up">🎮 BATTLEGROUNDS</div>
        <h2 className="section-title animate-up">12 SQUADS.<br />ONE CROWN.</h2>
        <p className="section-desc animate-up">Choose your path to glory. Professional bracket systems with 12 teams per match deployment.</p>

        <div className="mode-grid-luxe">
          {tournaments.map((t: any, index: number) => (
            <div className="mode-card-luxe animate-up" key={t.id} style={{ animationDelay: `${0.1 + index * 0.1}s` }}>
              <div className="mode-card-accent"></div>
              <div className={`mode-tag-luxe ${t.mode_id}`}>{t.mode_tag}</div>
              <div className="mode-name-luxe">{t.mode_name}</div>
              <p className="mode-desc-luxe">{t.description}</p>
              <div className="mode-meta-luxe">
                <div><span>POOL</span><strong>{t.teams}</strong></div>
                <div><span>PRIZE</span><strong>{t.prize}</strong></div>
                <div className="match-time-tag">
                  <span>STATUS</span>
                  <strong>LIVE ENROLL</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="prize-mesh-container">
        <div className="section" id="prizes">
          <div className="section-label animate-up">💎 REWARDS</div>
          <h2 className="section-title animate-up">{getText('prize_section_title', 'GRAND PRIZE POOL')}</h2>

          <div className="prize-grid-luxe">
            {prizes.map((p: any, index: number) => (
              <div className={`prize-card-luxe ${p.tier} animate-up`} key={p.id} style={{ animationDelay: `${0.1 + index * 0.1}s` }}>
                <div className="prize-rank-luxe">{p.rank_label}</div>
                <div className="prize-amount-luxe">{p.amount}</div>
                <div className="prize-place-luxe">{p.place}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="section" id="rules">
        <div className="section-label animate-up">📜 THE CODE</div>
        <h2 className="section-title animate-up">PLAYING FAIR</h2>

        <div className="rules-list-luxe">
          {rules.map((r: any, index: number) => (
            <div className="rule-item-luxe animate-up" key={r.id} style={{ animationDelay: `${0.05 + index * 0.05}s` }}>
              <span className="rule-num-luxe">{r.rule_number}</span>
              <p>🛡️ {r.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="cta-rose-panel animate-up">
        <div className="cta-bg-glow"></div>
        <div className="section-label" style={{ justifyContent: 'center' }}>ENROLL NOW</div>
        <h2 className="section-title" style={{ maxWidth: 'none', textAlign: 'center' }}>INFINITE REGISTRATION IS OPEN</h2>
        <p className="section-desc" style={{ margin: '0 auto 3rem', textAlign: 'center', opacity: 0.8 }}>
          Every 12 squads trigger a new official match. Don't wait—register your team and jump into the next active bracket.
        </p>
        <div style={{ textAlign: 'center' }}>
          <Link href="/register" className="btn-demon-solid">SECURE YOUR REGISTRATION</Link>
        </div>
      </div>

      <footer className="footer-luxe">
        <p>© 2026 DEMON X LIVE | 💻 Developed by <strong>Muthuraj C</strong> | Not affiliated with Garena</p>
      </footer>
    </div>
  );
}
