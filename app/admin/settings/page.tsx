"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getGlobalSettings, updateGlobalSettings } from "../actions";
import Toast from "../../../components/Toast";

export default function SettingsPage() {
  const [settings, setSettings] = useState<any>({
    whatsapp_group_link: "",
    whatsapp_support_link: "",
    is_registration_active: true,
    maintenance_message: ""
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{msg: string, type: 'success' | 'error' | 'warning' | null}>({ msg: "", type: null });

  const notify = (msg: string, type: 'success' | 'error' | 'warning') => {
    setToast({ msg, type });
  };

  useEffect(() => {
    async function load() {
      try {
        const data = await getGlobalSettings();
        setSettings(data);
      } catch (err) {
        notify("FAILED TO LOAD SETTINGS", "error");
      }
      setLoading(false);
    }
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateGlobalSettings(settings);
      notify("GLOBAL CONFIGURATION UPDATED", "success");
    } catch (err) {
      notify("UPDATE REJECTED BY SERVER", "error");
    }
    setSaving(false);
  };

  if (loading) return <div style={{ padding: '4rem', textAlign: 'center', fontFamily: 'var(--font-head)', color: 'var(--ff-primary)' }}>DECRYPTING CONFIGURATION...</div>;

  return (
    <div className="admin-panel active animate-up">
      <Toast message={toast.msg} type={toast.type} onClear={() => setToast({ msg: "", type: null })} />

      <div className="admin-section-title" style={{ display: 'flex', alignItems: 'center' }}>
        <Link href="/admin/dashboard" className="admin-back-btn">← BACK</Link>
        GLOBAL CONFIGURATION
      </div>

      <div className="dash-card modern-card" style={{ padding: '3rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
          
          {/* COMMUNICATION LINKS */}
          <section>
            <div className="section-label" style={{ marginBottom: '1.5rem' }}>COMMUNICATION CHANNELS</div>
            <div className="form-group" style={{ marginBottom: '2rem' }}>
              <label className="form-label">WHATSAPP GROUP LINK</label>
              <input 
                className="form-input" 
                value={settings.whatsapp_group_link} 
                onChange={e => setSettings({...settings, whatsapp_group_link: e.target.value})}
                placeholder="https://chat.whatsapp.com/..."
              />
              <p style={{ fontSize: '0.65rem', color: 'var(--ff-muted)', marginTop: '0.5rem' }}>This link syncs across all receipt pages and landing buttons.</p>
            </div>

            <div className="form-group">
              <label className="form-label">DIRECT SUPPORT LINK (WA.ME)</label>
              <input 
                className="form-input" 
                value={settings.whatsapp_support_link} 
                onChange={e => setSettings({...settings, whatsapp_support_link: e.target.value})}
                placeholder="https://wa.me/91..."
              />
            </div>
          </section>

          {/* SYSTEM CONTROL */}
          <section>
            <div className="section-label" style={{ marginBottom: '1.5rem' }}>ENROLLMENT CONTROL</div>
            <div className="form-group" style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--rose-50)', padding: '1.5rem', borderRadius: '16px' }}>
               <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>REGISTRATION STATUS</div>
                  <div style={{ fontSize: '0.7rem', opacity: 0.6 }}>Enable or disable public squad enlistment instantly.</div>
               </div>
               <button 
                onClick={() => setSettings({...settings, is_registration_active: !settings.is_registration_active})}
                style={{ 
                  background: settings.is_registration_active ? '#10B981' : '#F43F5E',
                  color: '#FFF',
                  padding: '0.5rem 1.5rem',
                  borderRadius: '30px',
                  border: 'none',
                  fontSize: '0.65rem',
                  fontWeight: 900,
                  cursor: 'pointer'
                }}
               >
                {settings.is_registration_active ? "LIVE" : "HALTED"}
               </button>
            </div>

            <div className="form-group">
              <label className="form-label">MAINTENANCE MESSAGE</label>
              <textarea 
                className="form-input" 
                rows={3}
                value={settings.maintenance_message} 
                onChange={e => setSettings({...settings, maintenance_message: e.target.value})}
                placeholder="Registration is temporarily closed for season setup..."
              />
            </div>
          </section>
        </div>

        <div style={{ marginTop: '4rem', borderTop: '1px solid var(--rose-100)', paddingTop: '2.5rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button 
            className="btn-primary" 
            style={{ padding: '1rem 4rem', height: '52px' }}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "SYNCHRONIZING..." : "SAVE GLOBAL CONFIG"}
          </button>
        </div>
      </div>
    </div>
  );
}
