"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

type CharsetKey = "lower" | "upper" | "numbers" | "symbols";

const CHARSETS: Record<CharsetKey, string> = {
  lower: "abcdefghijklmnopqrstuvwxyz",
  upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  numbers: "0123456789",
  symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?",
};

const CHARSET_LABELS: { key: CharsetKey; label: string }[] = [
  { key: "lower", label: "Minúsculas (a-z)" },
  { key: "upper", label: "Mayúsculas (A-Z)" },
  { key: "numbers", label: "Números (0-9)" },
  { key: "symbols", label: "Símbolos (!@#$...)" },
];

const MIN_LENGTH = 8;
const MAX_LENGTH = 64;
const DEFAULT_LENGTH = 16;
const DEFAULT_SELECTED: Record<CharsetKey, boolean> = {
  lower: true,
  upper: true,
  numbers: true,
  symbols: false,
};

function buildCharset(selection: Record<CharsetKey, boolean>): string {
  return CHARSET_LABELS.filter(({ key }) => selection[key])
    .map(({ key }) => CHARSETS[key])
    .join("");
}

/**
 * Devuelve un entero aleatorio uniforme en [0, max) usando
 * crypto.getRandomValues, descartando valores fuera de rango
 * para evitar sesgo de módulo.
 */
function secureRandomInt(max: number): number {
  if (max <= 0) return 0;

  const array = new Uint32Array(1);
  // Mayor múltiplo de `max` que cabe en 32 bits, para rechazo uniforme.
  const limit = Math.floor(0xffffffff / max) * max;

  let value: number;
  do {
    crypto.getRandomValues(array);
    value = array[0];
  } while (value >= limit);

  return value % max;
}

function generatePassword(length: number, charset: string): string {
  if (!charset || length <= 0) return "";

  let result = "";
  for (let i = 0; i < length; i++) {
    const index = secureRandomInt(charset.length);
    result += charset[index];
  }

  return result;
}

export default function GeneradorPage() {
  const [length, setLength] = useState(DEFAULT_LENGTH);
  const [selected, setSelected] = useState<Record<CharsetKey, boolean>>(
    DEFAULT_SELECTED
  );
  const [password, setPassword] = useState("");
  const [copied, setCopied] = useState(false);

  const charset = useMemo(() => buildCharset(selected), [selected]);
  const hasCharset = charset.length > 0;

  const regenerate = useCallback(() => {
    setPassword(hasCharset ? generatePassword(length, charset) : "");
  }, [charset, hasCharset, length]);

  // Genera la primera contraseña una vez montado en el navegador. El
  // cálculo se difiere a un callback (en vez de llamarse de forma
  // síncrona en el cuerpo del efecto) para no ejecutar crypto durante
  // el renderizado en el servidor ni provocar un desajuste de hidratación.
  useEffect(() => {
    const id = setTimeout(() => regenerate(), 0);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!copied) return;
    const timeout = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(timeout);
  }, [copied]);

  function toggleOption(key: CharsetKey) {
    const nextSelected = { ...selected, [key]: !selected[key] };
    setSelected(nextSelected);

    const nextCharset = buildCharset(nextSelected);
    setPassword(nextCharset ? generatePassword(length, nextCharset) : "");
  }

  function handleLengthChange(value: number) {
    const clamped = Math.min(MAX_LENGTH, Math.max(MIN_LENGTH, value));
    setLength(clamped);
    setPassword(hasCharset ? generatePassword(clamped, charset) : "");
  }

  async function handleCopy() {
    if (!password) return;
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
    } catch {
      setCopied(false);
    }
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
          🔐 Generador de contraseñas
        </span>

        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Genera contraseñas seguras
        </h1>

        <p className="mt-4 max-w-xl text-lg leading-7 text-zinc-400">
          Todo ocurre localmente en tu navegador usando{" "}
          <code className="rounded bg-zinc-900 px-1.5 py-0.5 text-zinc-200">
            crypto.getRandomValues()
          </code>
          . Tu contraseña nunca se envía a ningún servidor.
        </p>

        {/* Resultado */}
        <div className="mt-10 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
          {hasCharset ? (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="break-all font-mono text-lg text-zinc-100 sm:text-xl">
                {password}
              </p>
              <div className="flex shrink-0 gap-3">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="rounded-xl bg-white px-5 py-2.5 font-semibold text-black transition hover:bg-zinc-200"
                >
                  {copied ? "¡Copiada!" : "Copiar"}
                </button>
                <button
                  type="button"
                  onClick={regenerate}
                  className="rounded-xl border border-zinc-700 px-5 py-2.5 font-semibold text-zinc-200 transition hover:bg-zinc-800"
                >
                  Generar otra
                </button>
              </div>
            </div>
          ) : (
            <p className="text-zinc-400">
              Selecciona al menos un tipo de carácter para generar una
              contraseña.
            </p>
          )}
        </div>

        {/* Configuración */}
        <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6">
          <div className="flex items-center justify-between">
            <label htmlFor="length" className="font-semibold text-zinc-200">
              Longitud
            </label>
            <span className="font-mono text-zinc-300">{length}</span>
          </div>

          <input
            id="length"
            type="range"
            min={MIN_LENGTH}
            max={MAX_LENGTH}
            value={length}
            onChange={(e) => handleLengthChange(Number(e.target.value))}
            className="mt-3 w-full accent-white"
          />

          <div className="mt-1 flex justify-between text-xs text-zinc-500">
            <span>{MIN_LENGTH}</span>
            <span>{MAX_LENGTH}</span>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {CHARSET_LABELS.map(({ key, label }) => (
              <label
                key={key}
                className="flex cursor-pointer items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3 transition hover:border-zinc-700"
              >
                <input
                  type="checkbox"
                  checked={selected[key]}
                  onChange={() => toggleOption(key)}
                  className="h-4 w-4 accent-white"
                />
                <span className="text-sm text-zinc-200">{label}</span>
              </label>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
