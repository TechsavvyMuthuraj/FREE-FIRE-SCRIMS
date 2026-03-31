"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function BroadcastPage() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [targetGroup, setTargetGroup] = useState("ALL");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ success: false, message: "" });
  const [preview, setPreview] = useState(false);

  const handleBroadcast = async () => {
    if (!subject || !message) {
      setStatus({ success: false, message: "Subject and Message are required." });
      return;
    }

    setLoading(true);
    setStatus({ success: false, message: "" });

    try {
      const res = await fetch("/api/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, message, targetGroup }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setStatus({ success: true, message: `Email sent to ${data.sentCount} recipients` });
      setSubject("");
      setMessage("");
    } catch (err: any) {
      setStatus({ success: false, message: `Broadcast failed: ${err.message}` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-panel active">
      <div className="admin-section-title">EMAIL BROADCAST</div>
      
      <div className="dash-card" style={{ padding: '1.5rem' }}>
        <div className="form-group">
          <label className="form-label">Send To</label>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input type="radio" checked={targetGroup === "ALL"} onChange={() => setTargetGroup("ALL")} style={{ accentColor: 'var(--ff-orange)' }} />
              <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>All Teams</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input type="radio" checked={targetGroup === "CS"} onChange={() => setTargetGroup("CS")} style={{ accentColor: 'var(--ff-orange)' }} />
              <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>CS Teams Only</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input type="radio" checked={targetGroup === "BR"} onChange={() => setTargetGroup("BR")} style={{ accentColor: 'var(--ff-orange)' }} />
              <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>BR Teams Only</span>
            </label>
          </div>
        </div>

        <div className="form-group" style={{ marginTop: '1.5rem' }}>
          <label className="form-label">Email Subject *</label>
          <input 
            className="form-input" 
            value={subject} 
            onChange={(e) => setSubject(e.target.value)} 
            placeholder="e.g. Match Schedule – CS Mode Round 1" 
          />
        </div>

        <div className="form-group">
          <label className="form-label">Message Body *</label>
          <textarea 
            className="form-textarea" 
            value={message} 
            onChange={(e) => setMessage(e.target.value)} 
            placeholder="Write your message here. Match details, room IDs, instructions, etc." 
          />
        </div>

        {status.message && (
          <div className="error-msg show" style={{ color: status.success ? 'var(--ff-success)' : 'var(--ff-red)', marginBottom: '1rem' }}>
            {status.message}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
          <button className="btn-secondary" style={{ padding: '0.6rem 1.25rem' }} onClick={() => setPreview(!preview)}>PREVIEW</button>
          <button className="small-btn" onClick={handleBroadcast} disabled={loading}>
            {loading ? "SENDING..." : "SEND EMAIL BROADCAST"}
          </button>
        </div>

        {preview && (
          <div style={{ marginTop: '1.5rem', background: 'var(--ff-card2)', border: '1px solid var(--ff-border)', borderRadius: '6px', padding: '1.25rem' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.15em', color: 'var(--ff-orange)', marginBottom: '0.75rem', textTransform: 'uppercase' }}>Email Preview</div>
            <div style={{ fontWeight: 700, marginBottom: '0.5rem', fontSize: '0.95rem' }}>{subject || "(No subject)"}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--ff-muted)', whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>{message || "(No content)"}</div>
          </div>
        )}
      </div>
    </div>
  );
}
