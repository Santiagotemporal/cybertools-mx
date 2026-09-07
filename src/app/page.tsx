import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <section className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-24">
        <div className="max-w-3xl">
          <span className="mb-6 inline-block rounded-full border border-zinc-700 px-4 py-2 text-sm text-zinc-300">
            Herramientas gratuitas de privacidad y ciberseguridad
          </span>

          <h1 className="text-5xl font-bold tracking-tight sm:text-7xl">
            CyberTools MX
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-400 sm:text-xl">
            Utilidades simples para crear contraseñas seguras, analizar su
            fortaleza y entender conceptos básicos de seguridad digital.
            Siempre que sea posible, el procesamiento ocurre directamente en
            tu navegador.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <a
              href="#herramientas"
              className="rounded-xl bg-white px-6 py-3 font-semibold text-black transition hover:bg-zinc-200"
            >
              Ver herramientas
            </a>

            <a
              href="#privacidad"
              className="rounded-xl border border-zinc-700 px-6 py-3 font-semibold text-zinc-200 transition hover:bg-zinc-900"
            >
              Cómo protegemos tu privacidad
            </a>
          </div>
        </div>

        <section
          id="herramientas"
          className="mt-24 grid gap-5 md:grid-cols-3"
        >
          <Link
            href="/generador"
            className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 transition hover:border-zinc-700 hover:bg-zinc-900"
          >
            <div className="mb-4 text-3xl">🔐</div>
            <h2 className="text-xl font-semibold">Generador de contraseñas</h2>
            <p className="mt-3 text-zinc-400">
              Crea contraseñas aleatorias y configurables directamente desde
              tu navegador.
            </p>
          </Link>

          <article className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
            <div className="mb-4 text-3xl">🛡️</div>
            <h2 className="text-xl font-semibold">Medidor de fortaleza</h2>
            <p className="mt-3 text-zinc-400">
              Analiza características básicas de una contraseña y detecta
              posibles debilidades.
            </p>
          </article>

          <article className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
            <div className="mb-4 text-3xl">📊</div>
            <h2 className="text-xl font-semibold">Calculadora de entropía</h2>
            <p className="mt-3 text-zinc-400">
              Aprende cuánta incertidumbre tiene una contraseña y por qué eso
              importa para su seguridad.
            </p>
          </article>
        </section>

        <section
          id="privacidad"
          className="mt-20 rounded-2xl border border-zinc-800 bg-zinc-900/30 p-8"
        >
          <h2 className="text-2xl font-semibold">
            Tus contraseñas no deberían salir de tu dispositivo
          </h2>

          <p className="mt-4 max-w-3xl leading-7 text-zinc-400">
            Las herramientas que desarrollaremos estarán diseñadas para
            procesar información sensible localmente en el navegador cuando
            sea técnicamente posible. No necesitamos conocer tu contraseña
            para ayudarte a evaluarla.
          </p>
        </section>
      </section>
    </main>
  );
}