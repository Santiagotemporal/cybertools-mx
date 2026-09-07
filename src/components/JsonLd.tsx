// Inyecta un bloque JSON-LD estático (datos propios del sitio, nunca
// entrada del usuario) como <script type="application/ld+json">, que es
// el mecanismo estándar recomendado por Next.js para structured data.
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
