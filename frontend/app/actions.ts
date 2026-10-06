/**
 * Archivo legado.
 *
 * La autenticación y las operaciones del dashboard ahora se ejecutan desde
 * componentes cliente mediante `lib/session.ts`, `lib/auth.ts` y
 * `lib/api/fit.ts`. Mantener aquí las antiguas Server Actions hacía que Next.js
 * intentara importar APIs eliminadas como `createSession` y `requireTrainer`.
 *
 * Ningún módulo actual importa este archivo; se conserva vacío para evitar
 * referencias accidentales al flujo anterior.
 */
export {};
