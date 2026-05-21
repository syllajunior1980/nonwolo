"use client";
import { useStore } from "@/lib/store";
import { Users, Home, CreditCard, TrendingUp, AlertTriangle, Globe, MapPin } from "lucide-react";

export default function TableauDeBord() {
  const { adherents, villages, setActiveTab } = useStore();
  const total = adherents.length;
  const payes = adherents.filter(a => a.paye).length;
  const nonPayes = total - payes;
  const montant = payes * 1000;
  const continents = [...new Set(adherents.map(a => a.continent))];
  const pays = [...new Set(adherents.map(a => a.pays))];

  const parVillage = villages.map(v => ({
    ...v,
    count: adherents.filter(a => a.village === v.nom).length
  })).sort((a, b) => b.count - a.count);

  const enRetard = adherents.filter(a => !a.paye);

  const parContinent = (["Afrique","Europe","Amérique du Nord","Amérique du Sud","Asie","Océanie"] as const).map(c => ({
    nom: c,
    count: adherents.filter(a => a.continent === c).length
  })).filter(c => c.count > 0);

  return (
    <div>
      <div style={{ marginBottom: "1.75rem" }}>
        <h1 className="syne" style={{ fontSize: 26, fontWeight: 800, color: "var(--vert-fonce)", marginBottom: 4 }}>Tableau de bord</h1>
        <p style={{ color: "var(--texte-sec)", fontSize: 14 }}>Vue d'ensemble de l'Association des Jeunes Ressortissants du Nonwolo</p>
      </div>

      {/* Cartes stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
        {[
          { titre: "Total adhérents", val: total, sous: `dans ${pays.length} pays`, icone: Users, couleur: "var(--vert)", fond: "var(--vert-clair)" },
          { titre: "Cotisations payées", val: payes, sous: `${total ? Math.round(payes/total*100) : 0}% du total`, icone: CreditCard, couleur: "#16a34a", fond: "#dcfce7" },
          { titre: "En attente", val: nonPayes, sous: "cotisations impayées", icone: AlertTriangle, couleur: "#d97706", fond: "#fffbeb" },
          { titre: "Montant collecté", val: montant.toLocaleString("fr") + " F", sous: "FCFA collectés", icone: TrendingUp, couleur: "var(--vert-fonce)", fond: "var(--vert-clair)" },
          { titre: "Villages", val: villages.length, sous: "villages représentés", icone: Home, couleur: "#7c3aed", fond: "#ede9fe" },
          { titre: "Présence mondiale", val: continents.length, sous: `continents · ${pays.length} pays`, icone: Globe, couleur: "#0891b2", fond: "#e0f2fe" },
        ].map((c, i) => {
          const Ic = c.icone;
          return (
            <div key={i} className="carte" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 11.5, fontWeight: 600, color: "var(--texte-sec)", textTransform: "uppercase", letterSpacing: "0.4px" }}>{c.titre}</span>
                <div style={{ width: 34, height: 34, borderRadius: 9, background: c.fond, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Ic size={16} color={c.couleur} />
                </div>
              </div>
              <div style={{ fontSize: 26, fontWeight: 700, color: "var(--vert-fonce)", lineHeight: 1 }}>{c.val}</div>
              <div style={{ fontSize: 12, color: "var(--texte-sec)" }}>{c.sous}</div>
            </div>
          );
        })}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
        {/* Par village */}
        <div className="carte">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
            <h2 style={{ fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", gap: 7 }}><MapPin size={15} color="var(--vert)" /> Adhérents par village</h2>
          </div>
          {parVillage.map(v => (
            <div key={v.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 3 }}>{v.nom}</div>
                <div style={{ height: 6, background: "#e5e7eb", borderRadius: 99, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${total ? v.count / total * 100 : 0}%`, background: "var(--vert-moyen)", borderRadius: 99, transition: "width 0.5s ease" }} />
                </div>
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--vert)", minWidth: 20, textAlign: "right" }}>{v.count}</span>
            </div>
          ))}
        </div>

        {/* Par continent */}
        <div className="carte">
          <h2 style={{ fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", gap: 7, marginBottom: "1rem" }}><Globe size={15} color="var(--vert)" /> Répartition mondiale</h2>
          {parContinent.length === 0 ? (
            <p style={{ color: "var(--texte-sec)", fontSize: 13 }}>Aucune donnée</p>
          ) : parContinent.map(c => (
            <div key={c.nom} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 9, padding: "8px 10px", background: "var(--vert-pale)", borderRadius: 9 }}>
              <span style={{ fontSize: 13, fontWeight: 500 }}>{c.nom}</span>
              <span className="badge" style={{ background: "var(--vert-clair)", color: "var(--vert)" }}>{c.count} adhérent{c.count > 1 ? "s" : ""}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Cotisations en retard */}
      {enRetard.length > 0 && (
        <div className="carte" style={{ borderLeft: "4px solid var(--alerte)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
            <h2 style={{ fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", gap: 7, color: "var(--alerte)" }}>
              <AlertTriangle size={15} /> Cotisations en retard ({enRetard.length})
            </h2>
            <button className="btn-secondaire" style={{ fontSize: 12, padding: "6px 12px" }} onClick={() => setActiveTab("messagerie")}>
              Envoyer un rappel
            </button>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {enRetard.map(a => (
              <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 7, background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 9, padding: "6px 10px" }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--alerte)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700 }}>
                  {(a.nom[0] + a.prenoms[0]).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 600 }}>{a.nom} {a.prenoms}</div>
                  <div style={{ fontSize: 11, color: "var(--texte-sec)" }}>{a.pays}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
