"use client";

import { motion } from "framer-motion";
import { ChevronRight, Gamepad2, ShieldAlert } from "lucide-react";
import Link from "next/link";
import "./Hero.css";

export default function Hero() {
  return (
    <section className="hero-section">
      <div className="container hero-container">
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="hero-content"
        >
          <div className="badge-wrapper">
            <span className="scrims-badge glass-panel text-gradient-primary">
               Official Free Fire Scrims Season 1
            </span>
          </div>
          
          <h1 className="hero-title heading-gradient">
            Conquer the <br/> Battleground
          </h1>
          
          <p className="hero-subtitle text-muted">
            The ultimate Free Fire Clash Squad & Battle Royale Scrims platform. 
            Prove your squad's dominance and win exclusive prize pools every week.
          </p>
          
          <div className="hero-actions">
            <Link href="/register" className="btn-primary">
              <Gamepad2 size={20} />
              Register Team
            </Link>
            <Link href="#rules" className="btn-secondary">
              <ShieldAlert size={20} />
              Read Rules
            </Link>
          </div>

          <div className="stats-row">
            <div className="stat-item glass-panel">
              <h3 className="text-gradient-primary">100K+</h3>
              <p>Prize Pool</p>
            </div>
            <div className="stat-item glass-panel">
              <h3 className="text-gradient-primary">500+</h3>
              <p>Active Teams</p>
            </div>
            <div className="stat-item glass-panel">
              <h3 className="text-gradient-primary">2</h3>
              <p>Game Modes</p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="hero-visual animate-float"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
        >
          <div className="mockup-frame glass-panel">
            <div className="mockup-header text-muted">LIVE SCRIMS</div>
            <div className="mockup-body">
              <div className="team-vs">
                <div className="team scarlet">Scarlet</div>
                <div className="vs">VS</div>
                <div className="team blue">Blue Devils</div>
              </div>
              <div className="match-mode">Clash Squad (CS)</div>
            </div>
          </div>
          <div className="hero-glow"></div>
        </motion.div>

      </div>
    </section>
  );
}
