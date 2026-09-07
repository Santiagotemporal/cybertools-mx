"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

// Toda la lógica de esta página corre en el navegador: no hay fetch, no se
// guarda nada en localStorage/cookies y la contraseña nunca se imprime en
// consola ni se envía a ningún sitio. El análisis vive solo en el estado de
// React mientras el usuario escribe, y desaparece al salir de la página.

const COMMON_PASSWORDS = [
  "password",
  "contrasena",
  "admin",
  "letmein",
  "123456",
  "1234567",
  "12345678",
  "123456789",
  "qwerty",
  "iloveyou",
  "welcome",
  "monkey",
  "dragon",
  "football",
  "baseball",
  "abc123",
  "111111",
  "000000",
  "123123",
  "admin123",
  "trustno1",
];

const KEYBOARD_PATTERNS = [
  "qwerty",
  "qwertz",
  "azerty",
  "asdfgh",
  "zxcvbn",
  "1qaz2wsx",
  "qazwsx",
];

// Aproximación del tamaño de un conjunto "razonable" de símbolos ASCII
// imprimibles (!@#$%... etc.), solo para el cálculo de entropía.
const SYMBOL_ALPHABET_SIZE = 32;

function stripAccents(value: string): string {
  // \p{Diacritic} (con flag u) evita tener que escribir literalmente el
  // rango Unicode de marcas combinadas en el código fuente.
  return value.normalize("NFD").replace(/\p{Diacritic}/gu, "");
}

function longestRepeatedRun(password: string): number {
  const chars = Array.from(password);
  let longest = chars.length > 0 ? 1 : 0;
  let current = longest;
  for (let i = 1; i < chars.length; i++) {
    current = chars[i] === chars[i - 1] ? current + 1 : 1;
    longest = Math.max(longest, current);
  }
  return longest;
}

// Detecta corridas de 3+ caracteres consecutivos en el código Unicode
// (sirve tanto para "abc"/"abcd" como para "123"/"1234", ascendente o
// descendente) sin necesitar una lista de secuencias.
function hasSequentialRun(password: string, minRun = 3): boolean {
  const codes = Array.from(password.toLowerCase(), (ch) => ch.codePointAt(0) ?? 0);
  let ascRun = 1;
  let descRun = 1;
  for (let i = 1; i < codes.length; i++) {
    ascRun = codes[i] === codes[i - 1] + 1 ? ascRun + 1 : 1;
    descRun = codes[i] === codes[i - 1] - 1 ? descRun + 1 : 1;
    if (ascRun >= minRun || descRun >= minRun) return true;
  }
  return false;
}

function matchesKeyboardPattern(normalized: string): boolean {
  return KEYBOARD_PATTERNS.some((pattern) => normalized.includes(pattern));
}

function matchCommonPassword(password: string): {
  matched: boolean;
  exact: boolean;
} {
  const normalized = stripAccents(password.toLowerCase());
  const exact = COMMON_PASSWORDS.includes(normalized);
  const matched =
    exact || COMMON_PASSWORDS.some((word) => normalized.includes(word));
  return { matched, exact };
}

function log2(value: number): number {
  return Math.log(value) / Math.LN2;
}

function estimateEntropyBits(
  password: string,
  flags: { lower: boolean; upper: boolean; number: boolean; symbol: boolean }
): number {
  if (password.length === 0) return 0;

  let alphabetSize = 0;
  if (flags.lower) alphabetSize += 26;
  if (flags.upper) alphabetSize += 26;
  if (flags.number) alphabetSize += 10;
  if (flags.symbol) alphabetSize += SYMBOL_ALPHABET_SIZE;
  if (alphabetSize === 0) return 0;

  return password.length * log2(alphabetSize);
}

type StrengthLabel = "Muy débil" | "Débil" | "Aceptable" | "Fuerte" | "Muy fuerte";

interface PasswordAnalysis {
  score: number;
  label: StrengthLabel;
  entropy: number;
  positives: string[];
  warnings: string[];
}

function labelForScore(score: number): StrengthLabel {
  if (score < 20) return "Muy débil";
  if (score < 40) return "Débil";
  if (score < 60) return "Aceptable";
  if (score < 80) return "Fuerte";
  return "Muy fuerte";
}

function analyzePassword(password: string): PasswordAnalysis {
  if (password.length === 0) {
    return { score: 0, label: "Muy débil", entropy: 0, positives: [], warnings: [] };
  }

  const length = password.length;
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);
  const classCount = [hasLower, hasUpper, hasNumber, hasSymbol].filter(Boolean)
    .length;

  const uniqueChars = new Set(Array.from(password)).size;
  const diversityRatio = uniqueChars / length;

  const longestRun = longestRepeatedRun(password);
  const sequential =
    hasSequentialRun(password) ||
    matchesKeyboardPattern(stripAccents(password.toLowerCase()));
  const { matched: commonMatch, exact: commonExact } =
    matchCommonPassword(password);

  const positives: string[] = [];
  const warnings: string[] = [];
  let score = 0;

  // La longitud es, con diferencia, el factor que más dificulta un ataque
  // de fuerza bruta: se premia de forma creciente y cada carácter por
  // debajo del mínimo recomendado (8) resta puntos de forma proporcional
  // en vez de una penalización fija, para que 4 caracteres pese mucho más
  // que 7.
  score += Math.min(length, 20) * 2;
  if (length < 8) {
    score -= (8 - length) * 8;
    warnings.push("La contraseña es muy corta (menos de 8 caracteres).");
  } else {
    positives.push(`Tiene ${length} caracteres.`);
  }
  if (length >= 16) {
    score += 10;
    positives.push("Longitud alta: dificulta mucho los ataques de fuerza bruta.");
  }

  if (hasLower) {
    score += 10;
    positives.push("Incluye letras minúsculas.");
  } else {
    warnings.push("No incluye letras minúsculas.");
  }
  if (hasUpper) {
    score += 10;
    positives.push("Incluye letras mayúsculas.");
  } else {
    warnings.push("No incluye letras mayúsculas.");
  }
  if (hasNumber) {
    score += 10;
    positives.push("Incluye números.");
  } else {
    warnings.push("No incluye números.");
  }
  if (hasSymbol) {
    score += 15;
    positives.push("Incluye símbolos.");
  } else {
    warnings.push("No incluye símbolos.");
  }
  if (classCount >= 3) {
    positives.push("Buena diversidad de tipos de carácter.");
  }

  if (diversityRatio >= 0.7) {
    score += 10;
    positives.push("Pocos caracteres se repiten.");
  } else if (diversityRatio < 0.5) {
    score -= 10;
    warnings.push("Muchos caracteres se repiten, lo que reduce la variedad real.");
  }

  if (longestRun >= 4) {
    score -= 20;
    warnings.push(
      `Contiene ${longestRun} caracteres idénticos seguidos (como "aaaa" o "1111").`
    );
  }

  if (sequential) {
    score -= 20;
    warnings.push(
      'Contiene una secuencia obvia (como "abc", "123" o un patrón de teclado como "qwerty").'
    );
  }

  if (commonMatch) {
    score -= commonExact ? 35 : 20;
    warnings.push(
      "Contiene una palabra o patrón extremadamente común en filtraciones de contraseñas reales."
    );
  }

  // Techos de seguridad: estos patrones son tan predecibles para un
  // atacante que no deben poder "compensarse" solo alargando la
  // contraseña o sumando símbolos.
  if (commonExact) score = Math.min(score, 15);
  else if (commonMatch) score = Math.min(score, 45);
  if (longestRun >= 6 || longestRun >= length) score = Math.min(score, 25);

  score = Math.round(Math.max(0, Math.min(100, score)));

  const entropy = estimateEntropyBits(password, {
    lower: hasLower,
    upper: hasUpper,
    number: hasNumber,
    symbol: hasSymbol,
  });

  return { score, label: labelForScore(score), entropy, positives, warnings };
}

const TIER_STYLES: Record<StrengthLabel, { bar: string; badge: string }> = {
  "Muy débil": {
    bar: "bg-red-500",
    badge: "border-red-500/40 bg-red-500/10 text-red-300",
  },
  Débil: {
    bar: "bg-orange-500",
    badge: "border-orange-500/40 bg-orange-500/10 text-orange-300",
  },
  Aceptable: {
    bar: "bg-yellow-500",
    badge: "border-yellow-500/40 bg-yellow-500/10 text-yellow-300",
  },
  Fuerte: {
    bar: "bg-lime-500",
    badge: "border-lime-500/40 bg-lime-500/10 text-lime-300",
  },
  "Muy fuerte": {
    bar: "bg-emerald-500",
    badge: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
  },
};

export default function FortalezaClient() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const analysis = useMemo(() => analyzePassword(password), [password]);
  const hasInput = password.length > 0;
  const tier = TIER_STYLES[analysis.label];

  function handleClear() {
    setPassword("");
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
          🛡️ Medidor de fortaleza
        </span>

        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Analiza la fortaleza de tu contraseña
        </h1>

        <p className="mt-4 max-w-xl text-lg leading-7 text-zinc-400">
          El análisis ocurre completamente en tu navegador. Tu contraseña
          nunca se envía a ningún servidor, no se guarda ni se registra en
          ningún lugar: solo vive en esta pestaña mientras la escribes.
        </p>

        <p className="mt-3 max-w-xl text-sm text-zinc-500">
          ¿Necesitas una nueva contraseña?{" "}
          <Link
            href="/generador"
            className="text-zinc-300 underline underline-offset-4 hover:text-white"
          >
            Usa el generador
          </Link>
          .
        </p>

        {/* Entrada */}
        <div className="mt-10 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
          <label
            htmlFor="password-input"
            className="font-semibold text-zinc-200"
          >
            Contraseña a analizar
          </label>

          {/* Un <div>, no un <form>: no hay envío de datos por ningún medio. */}
          <div className="mt-3 flex flex-col gap-3 sm:flex-row">
            <input
              id="password-input"
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
                onClick={handleClear}
                disabled={!hasInput}
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
          {hasInput ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">{analysis.score}</span>
                  <span className="text-zinc-500">/ 100</span>
                </div>
                <span
                  className={`rounded-full border px-4 py-1.5 text-sm font-semibold ${tier.badge}`}
                >
                  {analysis.label}
                </span>
              </div>

              <div
                role="progressbar"
                aria-valuenow={analysis.score}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuetext={`${analysis.score} de 100, ${analysis.label}`}
                aria-label="Puntaje de fortaleza de la contraseña"
                className="mt-4 h-3 w-full overflow-hidden rounded-full bg-zinc-800"
              >
                <div
                  className={`h-full rounded-full transition-all ${tier.bar}`}
                  style={{ width: `${analysis.score}%` }}
                />
              </div>

              <p className="mt-4 text-sm text-zinc-400">
                Entropía estimada:{" "}
                <span className="font-mono text-zinc-200">
                  {analysis.entropy.toFixed(1)} bits
                </span>
                . Este cálculo asume una selección aproximadamente aleatoria
                de caracteres y puede sobreestimar mucho la seguridad real de
                contraseñas creadas por personas siguiendo patrones
                reconocibles.
              </p>

              {analysis.positives.length > 0 && (
                <div className="mt-5">
                  <h2 className="text-sm font-semibold text-zinc-300">
                    Puntos a favor
                  </h2>
                  <ul className="mt-2 space-y-1 text-sm text-zinc-400">
                    {analysis.positives.map((item) => (
                      <li key={item} className="flex gap-2">
                        <span aria-hidden="true" className="text-emerald-400">
                          ✓
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {analysis.warnings.length > 0 && (
                <div className="mt-5">
                  <h2 className="text-sm font-semibold text-zinc-300">
                    A mejorar
                  </h2>
                  <ul className="mt-2 space-y-1 text-sm text-zinc-400">
                    {analysis.warnings.map((item) => (
                      <li key={item} className="flex gap-2">
                        <span aria-hidden="true" className="text-amber-400">
                          ⚠
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <p className="text-zinc-400">
              Escribe una contraseña arriba para ver su análisis en tiempo
              real.
            </p>
          )}
        </div>

        <p className="mt-6 text-xs leading-5 text-zinc-500">
          Este resultado es una estimación educativa basada en reglas
          simples, no una garantía de seguridad ni un sustituto de un gestor
          de contraseñas. Un puntaje alto no significa que la contraseña sea
          inviolable.
        </p>
      </section>
    </main>
  );
}
