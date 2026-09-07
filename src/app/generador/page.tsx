import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { SITE_URL } from "@/lib/site-config";
import GeneradorClient from "./GeneradorClient";

const TITLE = "Generador de contraseñas seguras";
const DESCRIPTION =
  "Genera contraseñas criptográficamente aleatorias con crypto.getRandomValues() directamente en tu navegador. Nunca se envían a ningún servidor.";
const URL = `${SITE_URL}/generador`;

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

export default function GeneradorPage() {
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
      <GeneradorClient />
    </>
  );
}
