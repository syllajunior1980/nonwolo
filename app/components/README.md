# 🎨 Nouveau Design AJRN — Instructions d'installation

## Fichiers à remplacer dans votre projet

Copiez chaque fichier dans le bon dossier de votre projet `D:\Nonwolo\ajrn\` :

### 📁 app/ (racine du dossier app)
| Fichier livré | Destination |
|---|---|
| `globals.css` | `app/globals.css` |
| `layout.tsx`  | `app/layout.tsx`  |
| `page.tsx`    | `app/page.tsx`    |

### 📁 app/components/
| Fichier livré | Destination |
|---|---|
| `Sidebar.tsx`       | `app/components/Sidebar.tsx`       |
| `TableauDeBord.tsx` | `app/components/TableauDeBord.tsx` |
| `Adherents.tsx`     | `app/components/Adherents.tsx`     |
| `Villages.tsx`      | `app/components/Villages.tsx`      |
| `Cotisations.tsx`   | `app/components/Cotisations.tsx`   |
| `Messagerie.tsx`    | `app/components/Messagerie.tsx`    |

## Commandes après remplacement

```bash
cd D:\Nonwolo\ajrn
git add .
git commit -m "Nouveau design dark/or JN1000"
git push
```

Vercel redéploie automatiquement ✅

## Ce qui a changé

- **Fond** : Noir profond au lieu de gris clair
- **Accent** : Or chaud `#c9a84c` au lieu de vert
- **Police** : Outfit + Cormorant Garamond (élégant)
- **Sidebar** : Logo JN1000 + photo du directeur en bas
- **Nom** : "Mouvement 1000 Jeunes pour le Nonwolo" partout
- **Cartes** : Bordure subtile, hover animé
- **Tableaux** : Fond sombre, survol doré
- **Boutons** : Or sur fond sombre
