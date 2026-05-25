import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mouvement 1000 Jeunes pour le Nonwolo — JN1000",
  description: "Plateforme de gestion du Mouvement 1000 Jeunes pour le Nonwolo — 58 villages, une seule vision",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
