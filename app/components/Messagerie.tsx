"use client";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { Send, Trash2, CheckCheck, Clock, MessageSquare, Users, X } from "lucide-react";

export default function Messagerie() {
  const { messages, adherents, addMessage, deleteMessage, markLu } = useStore();
  const [modalOuvert, setModalOuvert] = useState(false);
  const [form, setForm] = useState({ type:"groupe" as "groupe"|"individuel", destinataires:[] as string[], objet:"", contenu:"", expediteur:"Admin" });
  const [toast, setToast] = useState<string|null>(null);

  const afficherToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const envoyer = () => {
    if (!form.objet.trim() || !form.contenu.trim()) { afficherToast("Objet et contenu requis"); return; }
    addMessage(form);
    setForm({ type:"groupe", destinataires:[], objet:"", contenu:"", expediteur:"Admin" });
    setModalOuvert(false);
    afficherToast("Message envoyé !");
  };

  const nonLus = messages.filter(m => !m.lu).length;

  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"1.75rem", flexWrap:"wrap", gap:"1rem" }}>
        <div>
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:4 }}>
            <div style={{ width:4, height:32, background:"var(--vert)", borderRadius:99 }} />
            <h1 className="titre" style={{ fontSize:30, fontWeight:700, color:"var(--texte)", lineHeight:1 }}>Messagerie</h1>
          </div>
          <p style={{ color:"var(--texte-sec)", fontSize:13.5, marginLeft:16 }}>
            {messages.length} message{messages.length!==1?"s":""} · {nonLus} non lu{nonLus!==1?"s":""}
          </p>
        </div>
        <button className="btn-principal" onClick={() => setModalOuvert(true)}>
          <Send size={15} /> Nouveau message
        </button>
      </div>

      {messages.length === 0 ? (
        <div className="carte" style={{ textAlign:"center", padding:"4rem 2rem" }}>
          <div style={{ width:64, height:64, borderRadius:"50%", background:"var(--vert-pale)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 1rem" }}>
            <MessageSquare size={28} color="var(--vert)" />
          </div>
          <div style={{ fontWeight:700, fontSize:16, color:"var(--texte)", marginBottom:8 }}>Aucun message</div>
          <div style={{ color:"var(--texte-ter)", fontSize:13.5, marginBottom:"1.5rem" }}>Envoyez votre premier message aux adhérents</div>
          <button className="btn-principal" onClick={() => setModalOuvert(true)}><Send size={14}/> Rédiger un message</button>
        </div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {messages.map(m => (
            <div key={m.id} className="carte" style={{ borderLeft:`4px solid ${m.lu ? "var(--bordure)" : "var(--vert)"}`, opacity: m.lu ? 0.85 : 1, cursor:"pointer" }} onClick={() => markLu(m.id)}>
              <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:12 }}>
                <div style={{ flex:1 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:5 }}>
                    <span style={{ fontWeight:700, fontSize:14, color:"var(--texte)" }}>{m.objet}</span>
                    {!m.lu && <span className="badge" style={{ background:"var(--vert-pale)", color:"var(--vert)", fontSize:10 }}>Nouveau</span>}
                    <span className="badge" style={{ background:"var(--or-pale)", color:"var(--or)", fontSize:10 }}>
                      {m.type === "groupe" ? <><Users size={9}/> Groupe</> : "Individuel"}
                    </span>
                  </div>
                  <p style={{ color:"var(--texte-sec)", fontSize:13, lineHeight:1.6, marginBottom:8 }}>{m.contenu}</p>
                  <div style={{ display:"flex", alignItems:"center", gap:12, fontSize:11.5, color:"var(--texte-ter)" }}>
                    {m.lu ? <><CheckCheck size={12} color="var(--vert)"/> Lu</> : <><Clock size={12}/> Non lu</>}
                    <span>{new Date(m.date).toLocaleString("fr")}</span>
                    <span>De : {m.expediteur}</span>
                  </div>
                </div>
                <button onClick={e => { e.stopPropagation(); if(confirm("Supprimer ?")) deleteMessage(m.id); }}
                  style={{ border:"none", background:"transparent", color:"var(--texte-ter)", borderRadius:8, padding:"6px", cursor:"pointer", flexShrink:0 }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background="var(--rouge-pale)"; (e.currentTarget as HTMLButtonElement).style.color="var(--rouge)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background="transparent"; (e.currentTarget as HTMLButtonElement).style.color="var(--texte-ter)"; }}>
                  <Trash2 size={14}/>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOuvert && (
        <div className="modal-fond">
          <div className="modal">
            <div style={{ padding:"1.25rem 1.5rem", borderBottom:"1px solid var(--bordure)", display:"flex", justifyContent:"space-between", alignItems:"center", background:"var(--vert-pale)", borderRadius:"20px 20px 0 0" }}>
              <h2 className="titre" style={{ fontSize:20, fontWeight:700, color:"var(--vert)" }}>Nouveau message</h2>
              <button onClick={() => setModalOuvert(false)} style={{ border:"none", background:"transparent", color:"var(--texte-sec)", borderRadius:8, padding:"6px", cursor:"pointer" }}><X size={18}/></button>
            </div>
            <div style={{ padding:"1.5rem", display:"flex", flexDirection:"column", gap:"1rem" }}>
              <div>
                <label className="label">Type</label>
                <select className="champ" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as "groupe"|"individuel" }))}>
                  <option value="groupe">Message groupe (tous les adhérents)</option>
                  <option value="individuel">Message individuel</option>
                </select>
              </div>
              {form.type === "individuel" && (
                <div>
                  <label className="label">Destinataire</label>
                  <select className="champ" onChange={e => setForm(f => ({ ...f, destinataires: e.target.value ? [e.target.value] : [] }))}>
                    <option value="">Sélectionner un adhérent...</option>
                    {adherents.map(a => <option key={a.id} value={a.id}>{a.nom} {a.prenoms} — {a.village}</option>)}
                  </select>
                </div>
              )}
              <div>
                <label className="label">Objet *</label>
                <input className="champ" value={form.objet} onChange={e => setForm(f => ({ ...f, objet: e.target.value }))} placeholder="Objet du message..." />
              </div>
              <div>
                <label className="label">Message *</label>
                <textarea className="champ" rows={5} value={form.contenu} onChange={e => setForm(f => ({ ...f, contenu: e.target.value }))} placeholder="Rédigez votre message..." style={{ resize:"vertical" }} />
              </div>
              <div>
                <label className="label">Expéditeur</label>
                <input className="champ" value={form.expediteur} onChange={e => setForm(f => ({ ...f, expediteur: e.target.value }))} placeholder="Nom de l'expéditeur..." />
              </div>
            </div>
            <div style={{ padding:"1rem 1.5rem", borderTop:"1px solid var(--bordure)", display:"flex", justifyContent:"flex-end", gap:10 }}>
              <button className="btn-neutre" onClick={() => setModalOuvert(false)}>Annuler</button>
              <button className="btn-principal" onClick={envoyer}><Send size={14}/> Envoyer</button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="toast"><span style={{ color:"var(--vert)" }}>✓</span> {toast}</div>}
    </div>
  );
}
