"use client";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { Send, Plus, Trash2, X, Users, User, AlertTriangle, Bell, Info } from "lucide-react";

type TypeMsg = "groupe" | "individuel";
type Categorie = "rappel-cotisation" | "information" | "evenement" | "urgence" | "autre";

const CATEGORIES: { val: Categorie; label: string; icone: string; couleur: string }[] = [
  { val: "rappel-cotisation", label: "Rappel cotisation", icone: "💰", couleur: "#d97706" },
  { val: "information", label: "Information générale", icone: "ℹ️", couleur: "#2563eb" },
  { val: "evenement", label: "Événement", icone: "📅", couleur: "#7c3aed" },
  { val: "urgence", label: "Urgence", icone: "🚨", couleur: "#dc2626" },
  { val: "autre", label: "Autre", icone: "✉️", couleur: "#6b7280" },
];

const MODELES = [
  {
    label: "Rappel cotisation en retard",
    objet: "⏰ Rappel — Cotisation AJRN 2025 en attente",
    contenu: `Cher(e) membre,

Nous vous rappelons que votre cotisation annuelle de 1 000 FCFA pour l'année 2025 n'a pas encore été enregistrée.

Merci d'effectuer votre paiement sur le numéro unique de l'AJRN :

📱 0789514185 (Orange) · 0544415662 (MTN)

Syntaxes de paiement :
• Orange Money : #144*1*1*0789514185*1000#
• MTN Money : *133*3*1*0544415662*1000#
• Moov Money : *155*1*1*[numéro Moov]*1000#
• Wave : *9113*1*0789514185*1000#
  (Motif : "Cotisation AJRN + Votre nom")

Votre soutien est vital pour nos actions communautaires.

Cordialement,
Le Bureau de l'AJRN`,
  },
  {
    label: "Convocation assemblée générale",
    objet: "📢 Convocation — Assemblée Générale AJRN",
    contenu: `Chers membres,

Le Bureau de l'Association des Jeunes Ressortissants du Nonwolo (AJRN) a l'honneur de vous convoquer à l'Assemblée Générale Ordinaire.

📅 Date : À préciser
🕐 Heure : À préciser
📍 Lieu : À préciser (et/ou en ligne)

Ordre du jour :
1. Rapport moral du Président
2. Rapport financier du Trésorier
3. Bilan des activités de l'année
4. Questions diverses

Votre présence est indispensable pour la bonne marche de notre association.

Le Bureau de l'AJRN`,
  },
  {
    label: "Bienvenue au nouvel adhérent",
    objet: "🎉 Bienvenue dans la famille AJRN !",
    contenu: `Cher(e) nouveau membre,

Au nom de l'ensemble du Bureau et de tous les membres de l'Association des Jeunes Ressortissants du Nonwolo (AJRN), nous avons le plaisir de vous souhaiter la bienvenue !

Votre adhésion est un geste fort de solidarité envers notre communauté. Ensemble, nous œuvrons pour :
✅ Le développement du Nonwolo
✅ La solidarité entre ressortissants partout dans le monde
✅ La préservation de notre culture

Pour finaliser votre inscription, pensez à régler votre cotisation de 1 000 FCFA sur le 0789514185 (Orange) ou 0544415662 (MTN).

Avec toute notre fraternité,
Le Bureau de l'AJRN`,
  },
];

export default function Messagerie() {
  const { adherents, messages, addMessage, deleteMessage, markLu } = useStore();
  const [type, setType] = useState<TypeMsg>("groupe");
  const [categorie, setCategorie] = useState<Categorie>("information");
  const [destinataires, setDestinataires] = useState<string[]>([]);
  const [objet, setObjet] = useState("");
  const [contenu, setContenu] = useState("");
  const [expediteur, setExpediteur] = useState("Le Bureau de l'AJRN");
  const [onglet, setOnglet] = useState<"rediger"|"boite">("rediger");
  const [toast, setToast] = useState<string|null>(null);
  const [detailMsg, setDetailMsg] = useState<string|null>(null);

  const afficherToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3200); };

  const nonPayes = adherents.filter(a => !a.paye);

  const appliquerModele = (m: typeof MODELES[0]) => { setObjet(m.objet); setContenu(m.contenu); };

  const envoyer = () => {
    if (!objet.trim() || !contenu.trim()) { afficherToast("Veuillez remplir l'objet et le contenu du message"); return; }
    const dest = type === "groupe"
      ? (destinataires.length === 0 ? adherents.map(a => a.id) : destinataires)
      : destinataires;
    if (dest.length === 0) { afficherToast("Veuillez sélectionner au moins un destinataire"); return; }

    addMessage({ type, destinataires: dest, objet, contenu, expediteur });
    afficherToast(`Message envoyé à ${dest.length} destinataire(s) ✓`);
    setObjet(""); setContenu(""); setDestinataires([]);
    setOnglet("boite");
  };

  const toggleDest = (id: string) => {
    setDestinataires(d => d.includes(id) ? d.filter(x => x !== id) : [...d, id]);
  };

  const msgDetail = detailMsg ? messages.find(m => m.id === detailMsg) : null;

  return (
    <div>
      <div style={{ marginBottom:"1.5rem" }}>
        <h1 className="syne" style={{ fontSize:26, fontWeight:800, color:"var(--vert-fonce)", marginBottom:4 }}>Messagerie</h1>
        <p style={{ color:"var(--texte-sec)", fontSize:14 }}>Envoi de messages groupés et individuels à vos membres</p>
      </div>

      {/* Onglets */}
      <div style={{ display:"flex", gap:8, marginBottom:"1.25rem" }}>
        {[["rediger","✏️ Rédiger un message"],["boite",`📬 Boîte d'envoi (${messages.length})`]].map(([val,lbl]) => (
          <button key={val} onClick={() => setOnglet(val as "rediger"|"boite")}
            style={{ padding:"9px 18px", borderRadius:10, border:"1px solid var(--bordure)", fontSize:13.5, fontWeight:600, cursor:"pointer",
              background: onglet===val ? "var(--vert)" : "white", color: onglet===val ? "white" : "var(--texte-sec)" }}>
            {lbl}
          </button>
        ))}
      </div>

      {onglet === "rediger" && (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1.25rem" }}>
          {/* Formulaire */}
          <div className="carte" style={{ display:"flex", flexDirection:"column", gap:"1rem" }}>
            <h2 style={{ fontWeight:700, fontSize:14, marginBottom:4 }}>Composition du message</h2>

            {/* Type */}
            <div>
              <label className="label">Type d'envoi</label>
              <div style={{ display:"flex", gap:10 }}>
                {([["groupe","👥 Groupé"],["individuel","👤 Individuel"]] as const).map(([v,l]) => (
                  <button key={v} onClick={() => { setType(v); setDestinataires([]); }}
                    style={{ flex:1, padding:"9px 12px", borderRadius:9, border:"1.5px solid", borderColor:type===v?"var(--vert)":"var(--bordure)",
                      background:type===v?"var(--vert-clair)":"white", color:type===v?"var(--vert)":"var(--texte-sec)", fontWeight:600, fontSize:13 }}>
                    {l}
                  </button>
                ))}
              </div>
            </div>

            {/* Catégorie */}
            <div>
              <label className="label">Catégorie</label>
              <select className="champ" value={categorie} onChange={e => setCategorie(e.target.value as Categorie)}>
                {CATEGORIES.map(c => <option key={c.val} value={c.val}>{c.icone} {c.label}</option>)}
              </select>
            </div>

            {/* Expéditeur */}
            <div>
              <label className="label">Expéditeur</label>
              <input className="champ" value={expediteur} onChange={e => setExpediteur(e.target.value)} />
            </div>

            {/* Objet */}
            <div>
              <label className="label">Objet *</label>
              <input className="champ" value={objet} onChange={e => setObjet(e.target.value)} placeholder="Objet du message..." />
            </div>

            {/* Contenu */}
            <div>
              <label className="label">Message *</label>
              <textarea className="champ" rows={8} value={contenu} onChange={e => setContenu(e.target.value)} placeholder="Rédigez votre message ici..." style={{ resize:"vertical" }} />
            </div>

            <button className="btn-principal" onClick={envoyer} style={{ alignSelf:"flex-start" }}>
              <Send size={15} /> Envoyer le message
            </button>
          </div>

          {/* Panneau droite */}
          <div style={{ display:"flex", flexDirection:"column", gap:"1rem" }}>
            {/* Modèles */}
            <div className="carte">
              <h3 style={{ fontWeight:700, fontSize:13, marginBottom:"0.75rem" }}>📋 Modèles prédéfinis</h3>
              {MODELES.map((m, i) => (
                <button key={i} onClick={() => appliquerModele(m)}
                  style={{ width:"100%", textAlign:"left", padding:"10px 12px", borderRadius:9, border:"1px solid var(--bordure)", background:"white", marginBottom:7, fontSize:13, fontWeight:500, cursor:"pointer" }}
                  onMouseOver={e => (e.currentTarget.style.background="var(--vert-pale)")}
                  onMouseOut={e => (e.currentTarget.style.background="white")}>
                  {m.label}
                </button>
              ))}
            </div>

            {/* Destinataires */}
            <div className="carte">
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"0.75rem" }}>
                <h3 style={{ fontWeight:700, fontSize:13 }}>
                  {type === "groupe" ? "👥 Destinataires groupés" : "👤 Choisir les destinataires"}
                </h3>
                {type === "groupe" && (
                  <button onClick={() => setDestinataires([])} style={{ fontSize:11.5, color:"var(--texte-sec)", border:"none", background:"none", cursor:"pointer" }}>
                    Réinitialiser
                  </button>
                )}
              </div>

              {type === "groupe" && (
                <div style={{ display:"flex", flexDirection:"column", gap:7, marginBottom:"0.75rem" }}>
                  {[
                    { lbl: "Tous les adhérents", ids: adherents.map(a=>a.id), icone:"👥" },
                    { lbl: `Cotisations en retard (${nonPayes.length})`, ids: nonPayes.map(a=>a.id), icone:"⏰" },
                    { lbl: "Adhérents en Afrique", ids: adherents.filter(a=>a.continent==="Afrique").map(a=>a.id), icone:"🌍" },
                    { lbl: "Adhérents en Europe", ids: adherents.filter(a=>a.continent==="Europe").map(a=>a.id), icone:"🇪🇺" },
                    { lbl: "Adhérents en Amérique", ids: adherents.filter(a=>a.continent.includes("Amérique")).map(a=>a.id), icone:"🌎" },
                  ].map((g, i) => (
                    <button key={i} onClick={() => setDestinataires(g.ids)}
                      style={{ textAlign:"left", padding:"8px 12px", borderRadius:9, border:"1.5px solid",
                        borderColor: JSON.stringify(destinataires.sort()) === JSON.stringify(g.ids.sort()) ? "var(--vert)" : "var(--bordure)",
                        background: JSON.stringify(destinataires.sort()) === JSON.stringify(g.ids.sort()) ? "var(--vert-clair)" : "white",
                        fontSize:13, fontWeight:500, cursor:"pointer" }}>
                      {g.icone} {g.lbl}
                    </button>
                  ))}
                </div>
              )}

              <div style={{ maxHeight:200, overflowY:"auto", display:"flex", flexDirection:"column", gap:5 }}>
                {adherents.map(a => (
                  <label key={a.id} style={{ display:"flex", alignItems:"center", gap:8, padding:"6px 8px", borderRadius:8, cursor:"pointer", background: destinataires.includes(a.id) ? "var(--vert-clair)" : "transparent" }}>
                    <input type="checkbox" checked={destinataires.includes(a.id)} onChange={() => toggleDest(a.id)} />
                    <div style={{ width:24,height:24,borderRadius:"50%",background:"var(--vert)",color:"white",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,flexShrink:0 }}>
                      {(a.nom[0]+a.prenoms[0]).toUpperCase()}
                    </div>
                    <span style={{ fontSize:12.5, fontWeight:500 }}>{a.nom} {a.prenoms}</span>
                    {!a.paye && <span style={{ fontSize:10.5, color:"var(--alerte)", fontWeight:700 }}>impayé</span>}
                  </label>
                ))}
              </div>
              {destinataires.length > 0 && (
                <div style={{ marginTop:8, fontSize:12.5, color:"var(--vert)", fontWeight:600 }}>
                  {destinataires.length} destinataire{destinataires.length > 1 ? "s" : ""} sélectionné{destinataires.length > 1 ? "s" : ""}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {onglet === "boite" && (
        <div className="carte" style={{ padding:0, overflow:"hidden" }}>
          {messages.length === 0 ? (
            <div style={{ textAlign:"center", padding:"3rem", color:"var(--texte-sec)" }}>
              <div style={{ fontSize:40, marginBottom:12 }}>📭</div>
              <div style={{ fontSize:15, fontWeight:600, marginBottom:6 }}>Aucun message envoyé</div>
              <div style={{ fontSize:13 }}>Rédigez votre premier message dans l'onglet "Rédiger"</div>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Objet</th>
                    <th>Destinataires</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {messages.map(m => (
                    <tr key={m.id} style={{ opacity: m.lu ? 0.7 : 1 }}>
                      <td style={{ fontSize:12.5, whiteSpace:"nowrap" }}>{new Date(m.date).toLocaleDateString("fr-FR", { day:"2-digit", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit" })}</td>
                      <td>
                        <span className="badge" style={{ background: m.type==="groupe"?"var(--vert-clair)":"#e0f2fe", color: m.type==="groupe"?"var(--vert)":"#0891b2" }}>
                          {m.type==="groupe" ? "👥 Groupé" : "👤 Individuel"}
                        </span>
                      </td>
                      <td style={{ fontWeight:600, fontSize:13.5 }}>{m.objet}</td>
                      <td style={{ fontSize:12.5, color:"var(--texte-sec)" }}>{m.destinataires.length} destinataire{m.destinataires.length>1?"s":""}</td>
                      <td>
                        <div style={{ display:"flex", gap:5 }}>
                          <button onClick={() => { setDetailMsg(m.id); markLu(m.id); }}
                            style={{ border:"none", background:"var(--vert-clair)", color:"var(--vert)", borderRadius:7, padding:"5px 10px", fontSize:12, fontWeight:600 }}>
                            Voir
                          </button>
                          <button onClick={() => deleteMessage(m.id)}
                            style={{ border:"none", background:"var(--danger-clair)", color:"var(--danger)", borderRadius:7, padding:"5px 8px" }}>
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modal détail message */}
      {msgDetail && (
        <div className="modal-fond" onClick={() => setDetailMsg(null)}>
          <div className="modal" style={{ maxWidth:520 }} onClick={e => e.stopPropagation()}>
            <div style={{ padding:"1.25rem 1.5rem", borderBottom:"1px solid var(--bordure)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <h2 className="syne" style={{ fontSize:16, fontWeight:700 }}>Détail du message</h2>
              <button onClick={() => setDetailMsg(null)} style={{ border:"none", background:"none", color:"var(--texte-sec)" }}><X size={20} /></button>
            </div>
            <div style={{ padding:"1.5rem" }}>
              <div style={{ marginBottom:"1rem" }}>
                <div style={{ fontSize:11.5, fontWeight:700, color:"var(--texte-sec)", textTransform:"uppercase", letterSpacing:"0.4px", marginBottom:4 }}>Objet</div>
                <div style={{ fontSize:16, fontWeight:700 }}>{msgDetail.objet}</div>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:"1rem" }}>
                <div style={{ background:"var(--fond)", borderRadius:9, padding:"10px 12px" }}>
                  <div style={{ fontSize:11, fontWeight:700, color:"var(--texte-sec)", textTransform:"uppercase" }}>Type</div>
                  <div style={{ fontSize:13.5, fontWeight:600, marginTop:3 }}>{msgDetail.type === "groupe" ? "👥 Groupé" : "👤 Individuel"}</div>
                </div>
                <div style={{ background:"var(--fond)", borderRadius:9, padding:"10px 12px" }}>
                  <div style={{ fontSize:11, fontWeight:700, color:"var(--texte-sec)", textTransform:"uppercase" }}>Destinataires</div>
                  <div style={{ fontSize:13.5, fontWeight:600, marginTop:3 }}>{msgDetail.destinataires.length} membre{msgDetail.destinataires.length>1?"s":""}</div>
                </div>
                <div style={{ background:"var(--fond)", borderRadius:9, padding:"10px 12px" }}>
                  <div style={{ fontSize:11, fontWeight:700, color:"var(--texte-sec)", textTransform:"uppercase" }}>Envoyé le</div>
                  <div style={{ fontSize:13.5, fontWeight:600, marginTop:3 }}>{new Date(msgDetail.date).toLocaleDateString("fr-FR", { day:"2-digit", month:"long", year:"numeric" })}</div>
                </div>
                <div style={{ background:"var(--fond)", borderRadius:9, padding:"10px 12px" }}>
                  <div style={{ fontSize:11, fontWeight:700, color:"var(--texte-sec)", textTransform:"uppercase" }}>Expéditeur</div>
                  <div style={{ fontSize:13, fontWeight:600, marginTop:3 }}>{msgDetail.expediteur}</div>
                </div>
              </div>
              <div>
                <div style={{ fontSize:11.5, fontWeight:700, color:"var(--texte-sec)", textTransform:"uppercase", marginBottom:8 }}>Contenu</div>
                <div style={{ background:"var(--fond)", borderRadius:10, padding:"12px 14px", fontSize:13.5, lineHeight:1.7, whiteSpace:"pre-wrap" }}>{msgDetail.contenu}</div>
              </div>

              {/* Boutons envoi direct */}
              <div style={{ marginTop:"1.25rem", padding:"1rem", background:"var(--vert-pale)", borderRadius:12, border:"1px solid var(--vert-clair)" }}>
                <div style={{ fontSize:12, fontWeight:700, color:"var(--vert)", textTransform:"uppercase", letterSpacing:"0.4px", marginBottom:10 }}>
                  📤 Envoyer directement
                </div>
                {(() => {
                  const dest = msgDetail.destinataires.length > 0
                    ? msgDetail.destinataires
                    : adherents.map(a => a.id);
                  const texte = msgDetail.objet + "\n\n" + msgDetail.contenu + "\n\n— " + msgDetail.expediteur + " (JN1000)";

                  if (msgDetail.type === "individuel" && dest.length === 1) {
                    const a = adherents.find(x => x.id === dest[0]);
                    if (!a) return null;
                    const num = a.contact.replace(/[\s\-\+]/g, "").replace(/^00/, "").replace(/^0/, "225");
                    return (
                      <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
                        <a href={"https://wa.me/" + num + "?text=" + encodeURIComponent(texte)}
                          target="_blank" rel="noreferrer"
                          style={{ display:"inline-flex", alignItems:"center", gap:7, background:"#25D366", color:"white", padding:"10px 18px", borderRadius:10, fontSize:13.5, fontWeight:700, textDecoration:"none", boxShadow:"0 2px 8px rgba(37,211,102,0.30)" }}>
                          💬 WhatsApp — {a.nom} {a.prenoms}
                        </a>
                        <a href={"sms:" + a.contact.replace(/\s/g,"") + "?body=" + encodeURIComponent(texte)}
                          style={{ display:"inline-flex", alignItems:"center", gap:7, background:"#4285f4", color:"white", padding:"10px 18px", borderRadius:10, fontSize:13.5, fontWeight:700, textDecoration:"none" }}>
                          📱 SMS
                        </a>
                      </div>
                    );
                  }

                  // Groupe
                  return (
                    <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                      <div style={{ fontSize:12.5, color:"var(--texte-sec)" }}>
                        {dest.length} membre{dest.length > 1 ? "s" : ""} · Les contacts s&apos;ouvrent un par un
                      </div>
                      <button
                        onClick={() => {
                          if (confirm("Envoyer via WhatsApp à " + dest.length + " membres ?")) {
                            dest.forEach((id, i) => {
                              setTimeout(() => {
                                const a = adherents.find(x => x.id === id);
                                if (a?.contact) {
                                  const n = a.contact.replace(/[\s\-\+]/g,"").replace(/^00/,"").replace(/^0/,"225");
                                  window.open("https://wa.me/" + n + "?text=" + encodeURIComponent(texte), "_blank");
                                }
                              }, i * 1500);
                            });
                          }
                        }}
                        style={{ display:"inline-flex", alignItems:"center", gap:8, background:"#25D366", color:"white", padding:"10px 18px", borderRadius:10, fontSize:13.5, fontWeight:700, border:"none", cursor:"pointer", boxShadow:"0 2px 8px rgba(37,211,102,0.30)" }}
                      >
                        💬 Envoyer à tous via WhatsApp ({dest.length})
                      </button>
                      <button
                        onClick={() => {
                          dest.forEach((id, i) => {
                            setTimeout(() => {
                              const a = adherents.find(x => x.id === id);
                              if (a?.contact) {
                                window.open("sms:" + a.contact.replace(/\s/g,"") + "?body=" + encodeURIComponent(texte), "_blank");
                              }
                            }, i * 1500);
                          });
                        }}
                        style={{ display:"inline-flex", alignItems:"center", gap:8, background:"#4285f4", color:"white", padding:"10px 18px", borderRadius:10, fontSize:13.5, fontWeight:700, border:"none", cursor:"pointer" }}
                      >
                        📱 Envoyer à tous via SMS ({dest.length})
                      </button>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="toast" style={{ background:"var(--vert)", color:"white" }}>✓ {toast}</div>}
    </div>
  );
}
