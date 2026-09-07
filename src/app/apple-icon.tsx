import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// Mismo monograma que icon.tsx, en el tamaño que usan los dispositivos
// Apple para el ícono de "agregar a inicio".
export default function AppleIcon() {
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
          fontSize: 96,
          fontWeight: 700,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        C
      </div>
    ),
    { ...size }
  );
}
