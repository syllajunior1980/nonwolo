"use client";
import { useStore } from "@/lib/store";
import { Users, Home, CreditCard, TrendingUp, AlertTriangle, Globe, MapPin, ArrowRight } from "lucide-react";

export default function TableauDeBord() {
  const { adherents, villages, setActiveTab } = useStore();
  const total    = adherents.length;
  const payes    = adherents.filter(a => a.paye).length;
  const nonPayes = total - payes;
  const montant  = payes * 1000;
  const continents = [...new Set(adherents.map(a => a.continent))];
  const pays       = [...new Set(adherents.map(a => a.pays))];
  const taux       = total ? Math.round(payes / total * 100) : 0;

  const parVillage = villages.map(v => ({
    ...v, count: adherents.filter(a => a.village === v.nom).length,
  })).sort((a, b) => b.count - a.count);

  const enRetard = adherents.filter(a => !a.paye);

  const parContinent = (["Afrique","Europe","Amérique du Nord","Amérique du Sud","Asie","Océanie"] as const)
    .map(c => ({ nom: c, count: adherents.filter(a => a.continent === c).length }))
    .filter(c => c.count > 0);

  const stats = [
    { titre: "Total adhérents",   val: total,                             sous: `dans ${pays.length} pays`,            icone: Users,         couleur: "var(--or)",      fond: "var(--or-pale)" },
    { titre: "Cotisations payées", val: payes,                             sous: `${taux}% du total`,                   icone: CreditCard,    couleur: "#4ade80",        fond: "rgba(74,222,128,0.1)" },
    { titre: "En attente",         val: nonPayes,                          sous: "cotisations impayées",                icone: AlertTriangle, couleur: "var(--alerte)",  fond: "var(--alerte-pale)" },
    { titre: "Montant collecté",   val: montant.toLocaleString("fr")+" F", sous: "FCFA collectés",                      icone: TrendingUp,    couleur: "var(--or-clair)",fond: "var(--or-pale)" },
    { titre: "Villages",           val: villages.length,                   sous: "villages représentés",                icone: Home,          couleur: "#a78bfa",        fond: "rgba(167,139,250,0.1)" },
    { titre: "Présence mondiale",  val: continents.length,                 sous: `continents · ${pays.length} pays`,    icone: Globe,         couleur: "#38bdf8",        fond: "rgba(56,189,248,0.1)" },
  ];

  return (
    <div>
      {/* En-tête */}
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
          <div style={{ width: 4, height: 32, background: "var(--or)", borderRadius: 99 }} />
          <div>
            <h1 className="titre" style={{ fontSize: 32, fontWeight: 700, color: "var(--texte)", lineHeight: 1 }}>
              Tableau de bord
            </h1>
          </div>
        </div>
        <p style={{ color: "var(--texte-sec)", fontSize: 13.5, marginLeft: 16, letterSpacing: "0.2px" }}>
          Mouvement 1000 Jeunes pour le Nonwolo — Vue d'ensemble
        </p>
      </div>

      {/* Grille de stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(175px, 1fr))", gap: "1rem", marginBottom: "1.75rem" }}>
        {stats.map((c, i) => {
          const Ic = c.icone;
          return (
            <div key={i} className="stat-carte">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: c.fond, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Ic size={17} color={c.couleur} />
                </div>
                <span style={{ fontSize: 10.5, fontWeight: 600, color: "var(--texte-ter)", textTransform: "uppercase", letterSpacing: "0.6px" }}>
                  {c.titre}
                </span>
              </div>
              <div style={{ fontSize: 28, fontWeight: 700, color: c.couleur, lineHeight: 1, marginBottom: 6 }}>{c.val}</div>
              <div style={{ fontSize: 11.5, color: "var(--texte-ter)" }}>{c.sous}</div>
            </div>
          );
        })}
      </div>

      {/* Barre collecte globale */}
      <div className="carte" style={{ marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 12 }}>
          <div>
            <div className="titre" style={{ fontSize: 16, fontWeight: 600, color: "var(--texte)", marginBottom: 2 }}>
              Progression des cotisations
            </div>
            <div style={{ fontSize: 12, color: "var(--texte-ter)" }}>Objectif : {(total * 1000).toLocaleString("fr")} FCFA</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: "var(--or)", lineHeight: 1 }}>{taux}%</div>
            <div style={{ fontSize: 11, color: "var(--texte-ter)" }}>{payes}/{total} adhérents</div>
          </div>
        </div>
        <div className="barre-fond">
          <div className="barre-remplie" style={{ width: `${taux}%` }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 11.5 }}>
          <span style={{ color: "#4ade80", fontWeight: 600 }}>✓ {payes} payé{payes > 1 ? "s" : ""}</span>
          <span style={{ color: "var(--alerte)", fontWeight: 600 }}>⏳ {nonPayes} en attente</span>
        </div>
      </div>

      {/* Deux colonnes : villages + continents */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
        {/* Par village */}
        <div className="carte">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
            <h2 style={{ fontWeight: 600, fontSize: 13.5, display: "flex", alignItems: "center", gap: 8, color: "var(--texte)" }}>
              <MapPin size={15} color="var(--or)" />
              Adhérents par village
            </h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {parVillage.map(v => (
              <div key={v.id}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ fontSize: 13, fontWeight: 500, color: "var(--texte)" }}>{v.nom}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "var(--or)" }}>{v.count}</span>
                </div>
                <div className="barre-fond" style={{ height: 4 }}>
                  <div className="barre-remplie" style={{ width: `${total ? v.count / total * 100 : 0}%`, height: 4 }} />
                </div>
              </div>
            ))}
            {parVillage.length === 0 && <p style={{ color: "var(--texte-ter)", fontSize: 13 }}>Aucune donnée</p>}
          </div>
        </div>

        {/* Par continent */}
        <div className="carte">
          <h2 style={{ fontWeight: 600, fontSize: 13.5, display: "flex", alignItems: "center", gap: 8, color: "var(--texte)", marginBottom: "1.25rem" }}>
            <Globe size={15} color="var(--or)" />
            Répartition mondiale
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {parContinent.length === 0
              ? <p style={{ color: "var(--texte-ter)", fontSize: 13 }}>Aucune donnée</p>
              : parContinent.map(c => (
                <div key={c.nom} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "10px 14px",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid var(--bordure)",
                  borderRadius: 10,
                }}>
                  <span style={{ fontSize: 13, fontWeight: 500, color: "var(--texte)" }}>{c.nom}</span>
                  <span className="badge" style={{ background: "var(--or-pale)", color: "var(--or)", border: "1px solid var(--or-bordure)" }}>
                    {c.count} membre{c.count > 1 ? "s" : ""}
                  </span>
                </div>
              ))
            }
          </div>
        </div>
      </div>

      {/* Cotisations en retard */}
      {enRetard.length > 0 && (
        <div className="carte" style={{ borderLeft: "3px solid var(--alerte)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
            <h2 style={{ fontWeight: 600, fontSize: 13.5, display: "flex", alignItems: "center", gap: 8, color: "var(--alerte)" }}>
              <AlertTriangle size={15} />
              Cotisations en retard ({enRetard.length})
            </h2>
            <button className="btn-secondaire" style={{ fontSize: 12, padding: "6px 14px" }} onClick={() => setActiveTab("messagerie")}>
              Envoyer un rappel <ArrowRight size={13} />
            </button>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {enRetard.map(a => (
              <div key={a.id} style={{
                display: "flex", alignItems: "center", gap: 8,
                background: "var(--alerte-pale)",
                border: "1px solid rgba(217,119,6,0.2)",
                borderRadius: 10, padding: "8px 12px",
              }}>
                <div style={{
                  width: 30, height: 30, borderRadius: "50%",
                  background: "var(--alerte)", color: "white",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, fontWeight: 700, flexShrink: 0,
                }}>
                  {(a.nom[0] + a.prenoms[0]).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--texte)" }}>{a.nom} {a.prenoms}</div>
                  <div style={{ fontSize: 11, color: "var(--texte-ter)" }}>{a.pays}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
