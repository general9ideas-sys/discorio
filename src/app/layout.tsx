import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Disco Río Fiesta — Vinilos y clásicos a orillas del Paraná",
  description:
    "Disco Río Fiesta: DJs en vinilo, clásicos de todos los tiempos y atardeceres sobre el río Paraná en Posadas, Misiones.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <div className="noise" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
