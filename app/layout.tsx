import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AJRN — Association des Jeunes Ressortissants du Nonwolo",
  description: "Plateforme de gestion des adhérents de l'AJRN — accessible partout dans le monde",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
