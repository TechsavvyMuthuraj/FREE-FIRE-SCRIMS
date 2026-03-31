"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import "@/components/AdminLayout.css"; // Ensure admin styles are loaded

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error);
      }

      localStorage.setItem("ffscrims_admin", "true");
      router.push("/admin/dashboard");
    } catch (err: any) {
      setError(err.message || "Invalid login credentials");
      setLoading(false);
    }
  };

  return (
    <div id="page-admin-login" className="admin-login">
      <div className="admin-login-card">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div className="nav-logo" style={{ display: 'inline-block', fontSize: '1.5rem', marginBottom: '0.5rem' }}>FF SCRIMS</div>
          <div className="section-label" style={{ textAlign: 'center', marginTop: '0.25rem' }}>ADMIN PORTAL</div>
        </div>
        
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Admin Email</label>
            <input 
              className="form-input" 
              type="email" 
              placeholder="admin@ffscrims.gg" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Password</label>
            <input 
              className="form-input" 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          {error && <span className="error-msg show">{error}</span>}
          
          <button className="form-submit" type="submit" style={{ marginTop: '1rem' }} disabled={loading}>
            {loading ? "AUTHENTICATING..." : "ACCESS DASHBOARD →"}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <Link href="/" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.1em', color: 'var(--ff-muted)', cursor: 'pointer' }}>
            ← BACK TO SITE
          </Link>
        </div>
      </div>
    </div>
  );
}
