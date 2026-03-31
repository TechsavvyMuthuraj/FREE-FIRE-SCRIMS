"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getLandingPayments, createLandingPayment, updateLandingPayment, deleteLandingPayment } from "../actions";
import Toast from "../../../components/Toast";

export default function PaymentSettings() {
  const router = useRouter();
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPayment, setEditingPayment] = useState<any>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [toast, setToast] = useState<{msg: string, type: 'success' | 'error' | 'warning' | null}>({ msg: "", type: null });
  const [formData, setFormData] = useState({
    label: "",
    upi_id: "",
    qr_url: "",
    fee: "",
    is_active: true
  });

  useEffect(() => {
    fetchPayments();
  }, []);

  const notify = (msg: string, type: 'success' | 'error' | 'warning') => {
    setToast({ msg, type });
  };

  const fetchPayments = async () => {
    setLoading(true);
    const data = await getLandingPayments();
    setPayments(data);
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPayment) {
        await updateLandingPayment(editingPayment.id, formData);
        notify("PAYMENT CHANNEL UPDATED", "success");
      } else {
        await createLandingPayment(formData);
        notify("NEW CHANNEL CREATED", "success");
      }
      setShowAddModal(false);
      setEditingPayment(null);
      setFormData({ label: "", upi_id: "", qr_url: "", fee: "", is_active: true });
      fetchPayments();
    } catch (err) { 
      notify("SAVE FAILED - CHECK DB RECORDS", "error"); 
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("PERMANENTLY DELETE THIS PAYMENT CHANNEL?")) return;
    try {
      await deleteLandingPayment(id);
      notify("CHANNEL DELETED PERMANENTLY", "success");
      fetchPayments();
    } catch (err) { 
      notify("DELETION REJECTED BY SYSTEM", "error"); 
    }
  };

  if (loading) return (
    <div style={{ padding: '3rem', fontFamily: 'var(--font-head)', color: 'var(--rose-900)' }}>
       INITIALIZING SECURE CHANNELS...
    </div>
  );

  return (
    <>
      <Toast message={toast.msg} type={toast.type} onClear={() => setToast({ msg: "", type: null })} />
      
      <div className="admin-panel active animate-up">
        <div className="admin-section-header" style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="admin-section-title" style={{ margin: 0 }}>PAYMENT COMMAND CENTER</div>
          <button 
            onClick={() => {
              setFormData({ label: "", upi_id: "", qr_url: "", fee: "", is_active: true });
              setEditingPayment(null);
              setShowAddModal(true);
            }}
            className="btn-primary" 
            style={{ background: 'var(--ff-primary)', color: '#000', fontWeight: 900, border: 'none', padding: '1rem 2rem', cursor: 'pointer', borderRadius: '4px' }}
          >
            + ADD CHANNEL
          </button>
        </div>

        <div className="dash-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))' }}>
          {payments.map((p) => (
            <div key={p.id} className="dash-card modern-card" style={{ padding: '2.5rem', border: '1px solid rgba(255,140,0,0.1)' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                  <span style={{ fontSize: '0.6rem', padding: '0.3rem 0.8rem', background: p.is_active ? 'rgba(16,185,129,0.1)' : '#F3F4F6', color: p.is_active ? '#059669' : '#6B7280', borderRadius: '20px', fontWeight: 900 }}>
                     {p.is_active ? 'ACTIVE CHANNEL' : 'OFFLINE'}
                  </span>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                     <button 
                       onClick={() => {
                         setEditingPayment(p);
                         setFormData({ 
                           label: p.label, 
                           upi_id: p.upi_id, 
                           qr_url: p.qr_url, 
                           fee: p.fee || "", 
                           is_active: p.is_active 
                         });
                         setShowAddModal(true);
                       }}
                       style={{ background: 'none', border: 'none', opacity: 0.5, cursor: 'pointer', fontSize: '0.8rem' }}
                     >✎</button>
                     <button 
                       onClick={() => handleDelete(p.id)}
                       style={{ background: 'none', border: 'none', opacity: 0.5, color: '#F43F5E', cursor: 'pointer', fontSize: '1rem' }}
                     >×</button>
                  </div>
               </div>

               <h3 style={{ fontFamily: 'var(--font-head)', marginBottom: '1.5rem', fontSize: '1.5rem' }}>{p.label}</h3>
               
               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                 <div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--rose-400)', fontWeight: 800, marginBottom: '0.5rem' }}>IDENTIFIER</div>
                    <div style={{ background: 'var(--rose-50)', padding: '0.75rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--rose-900)' }}>
                      {p.upi_id}
                    </div>
                 </div>
                 <div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--ff-primary)', fontWeight: 800, marginBottom: '0.5rem' }}>REGISTRATION FEE</div>
                    <div style={{ background: 'rgba(255,140,0,0.05)', padding: '0.75rem', borderRadius: '4px', fontSize: '0.9rem', fontWeight: 800, color: 'var(--ff-primary)' }}>
                      {p.fee || '₹ FREE'}
                    </div>
                 </div>
               </div>

               {p.qr_url && (
                 <div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--rose-400)', fontWeight: 800, marginBottom: '0.5rem' }}>QR ASSET PREVIEW</div>
                    <img src={p.qr_url} alt="QR" style={{ width: '100px', height: '100px', objectFit: 'contain', background: '#FFF', padding: '5px', border: '1px solid var(--rose-100)', borderRadius: '4px' }} />
                 </div>
               )}
            </div>
          ))}
        </div>
      </div>

      {/* ADD/EDIT MODAL */}
      {showAddModal && (
        <div className="modal-overlay active" style={{ 
          position: 'fixed', 
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.85)', 
          backdropFilter: 'blur(10px)', 
          zIndex: 9999, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          padding: '1.5rem'
        }}>
          <div className="modal-card animate-scale-in" style={{ 
            width: '100%', 
            maxWidth: '520px', 
            maxHeight: '90vh', 
            padding: '2.5rem', 
            background: '#FFF', 
            borderRadius: '24px', 
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            boxSizing: 'border-box',
            overflowY: 'auto',
            position: 'relative'
          }}>
            <h2 style={{ fontFamily: 'var(--font-head)', marginBottom: '2rem', fontSize: '1.5rem', color: 'var(--rose-950)' }}>
              {editingPayment ? 'EDIT CHANNEL' : 'CREATE PAYMENT CHANNEL'}
            </h2>
            
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
               <div className="form-group" style={{ marginBottom: 0 }}>
                  <label style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--rose-400)', letterSpacing: '0.1em', marginBottom: '0.5rem', display: 'block' }}>CHANNEL LABEL (E.G. G-PAY, PHONEPE)</label>
                  <input 
                    className="form-input" 
                    value={formData.label}
                    onChange={e => setFormData({...formData, label: e.target.value})}
                    style={{ background: 'var(--rose-50)', border: 'none', height: '48px', width: '100%', boxSizing: 'border-box' }}
                    required
                  />
               </div>

               <div className="form-group" style={{ marginBottom: 0 }}>
                  <label style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--rose-400)', letterSpacing: '0.1em', marginBottom: '0.5rem', display: 'block' }}>UPI ID ADDRESS</label>
                  <input 
                    className="form-input" 
                    value={formData.upi_id}
                    onChange={e => setFormData({...formData, upi_id: e.target.value})}
                    style={{ background: 'var(--rose-50)', border: 'none', height: '48px', width: '100%', boxSizing: 'border-box' }}
                    required
                  />
               </div>

               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1rem' }}>
                 <div className="form-group" style={{ marginBottom: 0 }}>
                    <label style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--rose-400)', letterSpacing: '0.1em', marginBottom: '0.5rem', display: 'block' }}>QR CODE IMAGE LINK</label>
                    <input 
                      className="form-input" 
                      value={formData.qr_url}
                      onChange={e => setFormData({...formData, qr_url: e.target.value})}
                      style={{ background: 'var(--rose-50)', border: 'none', height: '48px', width: '100%', boxSizing: 'border-box' }}
                      placeholder="HTTPS://..."
                    />
                 </div>
                 <div className="form-group" style={{ marginBottom: 0 }}>
                    <label style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--ff-primary)', letterSpacing: '0.1em', marginBottom: '0.5rem', display: 'block' }}>REGISTER FEES (E.G. ₹50)</label>
                    <input 
                      className="form-input" 
                      value={formData.fee}
                      onChange={e => setFormData({...formData, fee: e.target.value})}
                      style={{ background: 'rgba(255,140,0,0.05)', border: 'none', height: '48px', width: '100%', boxSizing: 'border-box' }}
                      placeholder="ENTER AMOUNT"
                    />
                 </div>
               </div>

               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1.5rem' }}>
                  <button type="submit" className="btn-primary" style={{ background: 'var(--ff-primary)', color: '#FFF', fontWeight: 800, border: 'none', padding: '1rem', borderRadius: '8px', cursor: 'pointer', textTransform: 'uppercase', fontSize: '0.7rem' }}>SAVE SETTINGS</button>
                  <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary" style={{ background: 'none', border: '1px solid var(--rose-200)', color: 'var(--rose-600)', fontWeight: 800, padding: '1rem', borderRadius: '8px', cursor: 'pointer', textTransform: 'uppercase', fontSize: '0.7rem' }}>CANCEL</button>
               </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .dash-card {
           background: #FFF;
           border-radius: 20px;
           box-shadow: 0 10px 30px rgba(0,0,0,0.02);
           transition: all 0.3s;
        }
        .dash-card:hover { transform: translateY(-5px); box-shadow: 0 20px 50px rgba(0,0,0,0.06); }
      `}</style>
    </>
  );
}
