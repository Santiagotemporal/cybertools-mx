import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

// Ícono generado por código (Satori/ImageResponse), sin binarios ni
// diseño externo: reemplaza el favicon genérico de Next.js por un
// monograma simple acorde a la identidad visual del sitio (blanco sobre
// zinc oscuro).
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#09090b",
          color: "#ffffff",
          fontSize: 20,
          fontWeight: 700,
          fontFamily: "system-ui, sans-serif",
          borderRadius: 6,
        }}
      >
        C
      </div>
    ),
    { ...size }
  );
}
