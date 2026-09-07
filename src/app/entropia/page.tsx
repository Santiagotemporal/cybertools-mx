import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { SITE_URL } from "@/lib/site-config";
import EntropiaClient from "./EntropiaClient";

const TITLE = "Calculadora de entropía de contraseñas";
const DESCRIPTION =
  "Calcula una estimación educativa de la entropía y las combinaciones posibles de una contraseña, analizando una real o configurando una hipotética.";
const URL = `${SITE_URL}/entropia`;

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

export default function EntropiaPage() {
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
      <EntropiaClient />
    </>
  );
}
