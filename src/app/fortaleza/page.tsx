import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { SITE_URL } from "@/lib/site-config";
import FortalezaClient from "./FortalezaClient";

const TITLE = "Medidor de fortaleza de contraseñas";
const DESCRIPTION =
  "Analiza las características y patrones de una contraseña directamente en tu navegador, sin enviarla al servidor, y recibe explicaciones concretas de qué la debilita.";
const URL = `${SITE_URL}/fortaleza`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: URL },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: URL,
  },
  twitter: {
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function FortalezaPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: TITLE,
          url: URL,
          description: DESCRIPTION,
          applicationCategory: "SecurityApplication",
          operatingSystem: "Cualquiera (funciona en el navegador)",
          isAccessibleForFree: true,
          inLanguage: "es-MX",
        }}
      />
      <FortalezaClient />
    </>
  );
}
