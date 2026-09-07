"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

// Igual que en /fortaleza: todo el cálculo ocurre en el navegador. Esta
// página no usa fetch, no guarda nada en localStorage/cookies y la
// contraseña del modo 1 nunca se imprime en consola ni se envía a ningún
// lado (ni siquiera mediante un <form>).

interface EntropyFlags {
  lower: boolean;
  upper: boolean;
  number: boolean;
  symbol: boolean;
}

// Mismos tamaños aproximados de alfabeto que usa /fortaleza, para que la
// estimación sea consistente en toda la aplicación.
const CLASS_SIZES = { lower: 26, upper: 26, number: 10, symbol: 32 } as const;

function alphabetSizeFromFlags(flags: EntropyFlags): number {
  let size = 0;
  if (flags.lower) size += CLASS_SIZES.lower;
  if (flags.upper) size += CLASS_SIZES.upper;
  if (flags.number) size += CLASS_SIZES.number;
  if (flags.symbol) size += CLASS_SIZES.symbol;
  return size;
}

function detectFlags(password: string): EntropyFlags {
  return {
    lower: /[a-z]/.test(password),
    upper: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    symbol: /[^A-Za-z0-9]/.test(password),
  };
}

function log2(value: number): number {
  return Math.log(value) / Math.LN2;
}

// H = L × log2(N). Sin longitud o sin alfabeto no hay nada que calcular
// (evita log2(0), que sería -Infinity).
function computeEntropyBits(length: number, alphabetSize: number): number {
  if (length <= 0 || alphabetSize <= 0) return 0;
  return length * log2(alphabetSize);
}

// N^L crecería demasiado rápido para representarse como número normal
// (Math.pow se iría a Infinity mucho antes de L=128), así que en vez de
// calcular las combinaciones exactas mostramos el exponente en base 10:
// combinaciones ≈ 10^X, con X = H / log2(10).
function combinationsExponent(entropyBits: number): number {
  if (entropyBits <= 0) return 0;
  return entropyBits / log2(10);
}

type EntropyTier =
  | "Muy baja"
  | "Baja"
  | "Moderada"
  | "Alta"
  | "Muy alta"
  | "Extremadamente alta";

function tierForEntropy(bits: number): EntropyTier {
  if (bits < 28) return "Muy baja";
  if (bits < 36) return "Baja";
  if (bits < 60) return "Moderada";
  if (bits < 80) return "Alta";
  if (bits < 128) return "Muy alta";
  return "Extremadamente alta";
}

const TIER_STYLES: Record<EntropyTier, { bar: string; badge: string }> = {
  "Muy baja": {
    bar: "bg-red-500",
    badge: "border-red-500/40 bg-red-500/10 text-red-300",
  },
  Baja: {
    bar: "bg-orange-500",
    badge: "border-orange-500/40 bg-orange-500/10 text-orange-300",
  },
  Moderada: {
    bar: "bg-yellow-500",
    badge: "border-yellow-500/40 bg-yellow-500/10 text-yellow-300",
  },
  Alta: {
    bar: "bg-lime-500",
    badge: "border-lime-500/40 bg-lime-500/10 text-lime-300",
  },
  "Muy alta": {
    bar: "bg-emerald-500",
    badge: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
  },
  "Extremadamente alta": {
    bar: "bg-cyan-400",
    badge: "border-cyan-400/40 bg-cyan-400/10 text-cyan-300",
  },
};

function describeAlphabet(flags: EntropyFlags): string {
  const parts: string[] = [];
  if (flags.lower) parts.push(`${CLASS_SIZES.lower} minúsculas`);
  if (flags.upper) parts.push(`${CLASS_SIZES.upper} mayúsculas`);
  if (flags.number) parts.push(`${CLASS_SIZES.number} números`);
  if (flags.symbol) parts.push(`~${CLASS_SIZES.symbol} símbolos`);
  if (parts.length === 0) return "No hay ningún tipo de carácter seleccionado.";
  return `Alfabeto estimado: ${parts.join(" + ")}.`;
}

const CHARSET_LABELS: { key: keyof EntropyFlags; label: string }[] = [
  { key: "lower", label: "Minúsculas (a-z)" },
  { key: "upper", label: "Mayúsculas (A-Z)" },
  { key: "number", label: "Números (0-9)" },
  { key: "symbol", label: "Símbolos ASCII (~32)" },
];

function EntropyBreakdown({
  length,
  flags,
}: {
  length: number;
  flags: EntropyFlags;
}) {
  const alphabetSize = alphabetSizeFromFlags(flags);
  const entropy = computeEntropyBits(length, alphabetSize);
  const tier = tierForEntropy(entropy);
  const style = TIER_STYLES[tier];
  const exponent = combinationsExponent(entropy);

  return (
    <div className="mt-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold">{entropy.toFixed(2)}</span>
          <span className="text-zinc-500">bits</span>
        </div>
        <span
          className={`rounded-full border px-4 py-1.5 text-sm font-semibold ${style.badge}`}
        >
          {tier}
        </span>
      </div>

      {/* Decorativa: el valor y la categoría ya están en texto arriba. */}
      <div
        aria-hidden="true"
        className="mt-4 h-3 w-full overflow-hidden rounded-full bg-zinc-800"
      >
        <div
          className={`h-full rounded-full transition-all ${style.bar}`}
          style={{ width: `${Math.min(100, (entropy / 128) * 100)}%` }}
        />
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
        <div>
          <dt className="text-zinc-500">Longitud (L)</dt>
          <dd className="font-mono text-zinc-100">{length}</dd>
        </div>
        <div>
          <dt className="text-zinc-500">Alfabeto (N)</dt>
          <dd className="font-mono text-zinc-100">{alphabetSize}</dd>
        </div>
        <div>
          <dt className="text-zinc-500">Fórmula</dt>
          <dd className="font-mono text-zinc-100">H = L × log2(N)</dd>
        </div>
        <div>
          <dt className="text-zinc-500">Combinaciones (aprox.)</dt>
          <dd className="font-mono text-zinc-100">
            {alphabetSize > 0 ? `≈ 10^${exponent.toFixed(2)}` : "—"}
          </dd>
        </div>
      </dl>

      <p className="mt-4 text-sm text-zinc-400">
        {describeAlphabet(flags)} Con {length} caracteres:{" "}
        <span className="font-mono text-zinc-200">
          H = {length} × log2({alphabetSize}) ≈ {entropy.toFixed(2)} bits
        </span>
        . No es un número exacto de combinaciones: es un exponente
        aproximado para que la magnitud sea legible.
      </p>
    </div>
  );
}

export default function EntropiaPage() {
  const [mode, setMode] = useState<"password" | "theoretical">("password");

  // Modo 1: analizar una contraseña real, siempre local.
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const hasPassword = password.length > 0;
  // Longitud "visual": Array.from cuenta puntos de código Unicode, no
  // unidades UTF-16, así que un emoji no se cuenta como 2 caracteres.
  const passwordLength = useMemo(() => Array.from(password).length, [password]);
  const passwordFlags = useMemo(() => detectFlags(password), [password]);

  // Modo 2: calculadora teórica, sin ninguna contraseña de por medio.
  const [theoLength, setTheoLength] = useState(16);
  const [theoFlags, setTheoFlags] = useState<EntropyFlags>({
    lower: true,
    upper: true,
    number: true,
    symbol: true,
  });
  const hasTheoAlphabet =
    theoFlags.lower || theoFlags.upper || theoFlags.number || theoFlags.symbol;

  function toggleTheoFlag(key: keyof EntropyFlags) {
    setTheoFlags((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function handleTheoLengthChange(value: number) {
    const clamped = Math.min(128, Math.max(1, value));
    setTheoLength(clamped);
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <section className="mx-auto flex min-h-screen max-w-3xl flex-col px-6 py-16">
        <Link
          href="/"
          className="mb-10 inline-flex w-fit items-center gap-2 text-sm text-zinc-400 transition hover:text-white"
        >
          ← Volver a inicio
        </Link>

        <span className="mb-4 inline-block w-fit rounded-full border border-zinc-700 px-4 py-2 text-sm text-zinc-300">
          📊 Calculadora de entropía
        </span>

        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Calcula la entropía de una contraseña
        </h1>

        <p className="mt-4 max-w-xl text-lg leading-7 text-zinc-400">
          Estima cuánta incertidumbre (en bits) tiene una contraseña,
          analizando una que escribas o configurando una hipotética. Todo
          ocurre en tu navegador: esta página no usa fetch, no guarda nada
          en localStorage ni en cookies, y tu contraseña nunca se imprime en
          consola ni se envía a ningún lado.
        </p>

        {/* Selector de modo */}
        <div className="mt-8 inline-flex w-fit rounded-xl border border-zinc-800 bg-zinc-900/50 p-1">
          <button
            type="button"
            onClick={() => setMode("password")}
            aria-pressed={mode === "password"}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              mode === "password"
                ? "bg-white text-black"
                : "text-zinc-300 hover:bg-zinc-800"
            }`}
          >
            Analizar mi contraseña
          </button>
          <button
            type="button"
            onClick={() => setMode("theoretical")}
            aria-pressed={mode === "theoretical"}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              mode === "theoretical"
                ? "bg-white text-black"
                : "text-zinc-300 hover:bg-zinc-800"
            }`}
          >
            Calculadora teórica
          </button>
        </div>

        {mode === "password" ? (
          <>
            {/* Entrada */}
            <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
              <label
                htmlFor="entropy-password-input"
                className="font-semibold text-zinc-200"
              >
                Contraseña a analizar
              </label>

              {/* Un <div>, no un <form>: no hay envío de datos por ningún medio. */}
              <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                <input
                  id="entropy-password-input"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  placeholder="Escribe una contraseña para analizarla"
                  className="flex-1 rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-2.5 font-mono text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-zinc-500"
                />

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-pressed={showPassword}
                    aria-label={
                      showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                    }
                    className="rounded-xl border border-zinc-700 px-4 py-2.5 font-semibold text-zinc-200 transition hover:bg-zinc-800"
                  >
                    {showPassword ? "Ocultar" : "Mostrar"}
                  </button>

                  <button
                    type="button"
                    onClick={() => setPassword("")}
                    disabled={!hasPassword}
                    className="rounded-xl border border-zinc-700 px-4 py-2.5 font-semibold text-zinc-200 transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Limpiar
                  </button>
                </div>
              </div>
            </div>

            {/* Resultado */}
            <div
              className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6"
              aria-live="polite"
            >
              {hasPassword ? (
                <EntropyBreakdown length={passwordLength} flags={passwordFlags} />
              ) : (
                <p className="text-zinc-400">
                  Escribe una contraseña arriba para ver su entropía estimada
                  en tiempo real.
                </p>
              )}
            </div>
          </>
        ) : (
          <>
            {/* Configuración teórica */}
            <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="theo-length"
                  className="font-semibold text-zinc-200"
                >
                  Longitud
                </label>
                <span className="font-mono text-zinc-300">{theoLength}</span>
              </div>

              <input
                id="theo-length"
                type="range"
                min={1}
                max={128}
                value={theoLength}
                onChange={(e) => handleTheoLengthChange(Number(e.target.value))}
                className="mt-3 w-full accent-white"
              />

              <div className="mt-1 flex justify-between text-xs text-zinc-500">
                <span>1</span>
                <span>128</span>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {CHARSET_LABELS.map(({ key, label }) => (
                  <label
                    key={key}
                    className="flex cursor-pointer items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3 transition hover:border-zinc-700"
                  >
                    <input
                      type="checkbox"
                      checked={theoFlags[key]}
                      onChange={() => toggleTheoFlag(key)}
                      className="h-4 w-4 accent-white"
                    />
                    <span className="text-sm text-zinc-200">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Resultado */}
            <div
              className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6"
              aria-live="polite"
            >
              {hasTheoAlphabet ? (
                <EntropyBreakdown length={theoLength} flags={theoFlags} />
              ) : (
                <p className="text-zinc-400">
                  Selecciona al menos un tipo de carácter para calcular la
                  entropía teórica.
                </p>
              )}
            </div>
          </>
        )}

        {/* Advertencia */}
        <div className="mt-8 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-6">
          <h2 className="flex items-center gap-2 font-semibold text-amber-300">
            <span aria-hidden="true">⚠️</span> Advertencia importante
          </h2>
          <p className="mt-2 text-sm leading-6 text-zinc-300">
            La entropía calculada con <span className="font-mono">H = L × log2(N)</span>{" "}
            supone que cada carácter fue elegido de forma independiente y
            aproximadamente uniforme. Una contraseña humana como{" "}
            <span className="font-mono">Password123!</span> puede tener una
            entropía teórica alta según esta fórmula, pero ser mucho más
            predecible en un ataque real, porque reutiliza palabras y
            patrones comunes en vez de caracteres verdaderamente al azar.
          </p>
        </div>

        {/* Educativo */}
        <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6">
          <h2 className="text-lg font-semibold">
            ¿Qué es un bit de entropía?
          </h2>
          <p className="mt-3 text-sm leading-6 text-zinc-400">
            Cada bit adicional duplica el número de posibilidades que
            alguien tendría que probar bajo un modelo de selección al azar.
            Por eso la entropía crece en una escala logarítmica, no lineal:
          </p>
          <ul className="mt-3 space-y-1 text-sm text-zinc-400">
            <li>
              <span className="font-mono text-zinc-200">20 bits</span> ≈ 2²⁰
              ≈ 1 millón de posibilidades
            </li>
            <li>
              <span className="font-mono text-zinc-200">40 bits</span> ≈ 2⁴⁰
              ≈ 1.1 × 10¹² posibilidades
            </li>
            <li>
              <span className="font-mono text-zinc-200">80 bits</span> ≈ 2⁸⁰
              ≈ 1.2 × 10²⁴ posibilidades
            </li>
          </ul>
          <p className="mt-3 text-sm leading-6 text-zinc-500">
            No indicamos cuánto tardaría alguien en probar todas esas
            combinaciones: eso depende del algoritmo de hash usado, el
            hardware del atacante, límites de intentos y otros factores del
            sistema real, no solo de la contraseña.
          </p>
        </div>

        <p className="mt-6 text-xs leading-5 text-zinc-500">
          Las categorías (Muy baja a Extremadamente alta) son una guía
          educativa basada en la fórmula anterior, no una certificación de
          que una contraseña sea &quot;segura&quot;.
        </p>
      </section>
    </main>
  );
}
