# CyberTools MX

Herramientas gratuitas de privacidad y ciberseguridad que funcionan
directamente en tu navegador. Siempre que es técnicamente posible, tus
contraseñas nunca salen de tu dispositivo: no hay `fetch`, no se guardan en
`localStorage` ni en cookies, y no se imprimen en la consola.

**Sitio en producción:** https://cybertools-mx.vercel.app

## Herramientas actuales

- **Generador de contraseñas** (`/generador`) — genera contraseñas
  criptográficamente aleatorias con `crypto.getRandomValues()`, garantizando
  al menos un carácter de cada categoría seleccionada.
- **Medidor de fortaleza** (`/fortaleza`) — analiza longitud, variedad de
  caracteres, repeticiones, secuencias obvias y coincidencias con
  contraseñas filtradas comúnmente, todo localmente.
- **Calculadora de entropía** (`/entropia`) — estima los bits de entropía de
  una contraseña real o de una hipotética configurable, con una advertencia
  clara sobre los límites del modelo.

## Stack

- [Next.js](https://nextjs.org) (App Router)
- [TypeScript](https://www.typescriptlang.org)
- [Tailwind CSS](https://tailwindcss.com)

## Privacidad

El procesamiento de contraseñas ocurre en el navegador del usuario. Las
páginas de herramientas son Client Components que no usan `fetch`,
`localStorage`, cookies ni `console.log` sobre datos sensibles, y no envían
nada mediante formularios.

## Desarrollo

```bash
npm.cmd install
npm.cmd run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Build de producción

```bash
npm.cmd run build
npm.cmd run start
```

## Lint

```bash
npm.cmd run lint
```

## SEO técnico

- `src/app/sitemap.ts` genera `/sitemap.xml` con las páginas públicas.
- `src/app/robots.ts` genera `/robots.txt` permitiendo el rastreo completo.
- `src/app/manifest.ts` genera `/manifest.webmanifest`.
- `src/app/icon.tsx` y `src/app/apple-icon.tsx` generan el favicon por código.
- La URL base del sitio vive en un solo lugar: `src/lib/site-config.ts`.

## Despliegue

Desplegado en el plan gratuito de [Vercel](https://vercel.com), rama de
producción `main`.
