# Bryan Henao Coach — Landing Page

Landing en Next.js 14 (App Router) + TypeScript + TailwindCSS para el entrenador
personal y online Bryan David Henao.

## Requisitos
- Node.js 18.17+

## Instalación

```bash
npm install
npm run dev
```

Abrir http://localhost:3000

## Build de producción

```bash
npm run build
npm run start
```

## Estructura

```
app/
 ├─ layout.tsx      Layout raíz, fuentes (Space Grotesk / Inter / JetBrains Mono) y metadata
 ├─ page.tsx        Ensambla todas las secciones
 └─ globals.css     Estilos base + fondo con glow radial
components/
 ├─ Navbar.tsx
 ├─ Hero.tsx
 ├─ About.tsx
 ├─ StatsBar.tsx
 ├─ Plans.tsx
 ├─ Testimonials.tsx
 ├─ Process.tsx
 ├─ FinalCta.tsx
 └─ Footer.tsx
tailwind.config.ts  Paleta de color de marca (lime, blue, bg-void, etc.)
```

## Pendiente de reemplazar con datos reales
- Precios de los planes Personal / Online
- Número de WhatsApp (actualmente `wa.me/573115000926` de ejemplo)
- Testimonios (nombres, fotos, resultados) — actualmente son de ejemplo
- Estadísticas del hero y de la barra de stats (+200 clientes, 92%, etc.)

---
Desarrollado por: Jorge Méndez - Programandoweb
Correo: lic.jorgemendez@gmail.com
Celular: 3115000926
Website: Programandoweb.net
Proyecto: Ivoolve
