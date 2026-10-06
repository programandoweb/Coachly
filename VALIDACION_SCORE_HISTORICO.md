# Validación del score histórico

## Flujo implementado

1. Las series marcadas durante el entrenamiento se guardan temporalmente en `fit_workout_sets`.
2. Al finalizar el cronómetro mediante `PUT /api/v1/fit/routines/{routine}/workout-session`:
   - se fija `ended_at` y `duration_seconds`;
   - cada serie se copia de forma inmutable a `fit_workout_session_results`;
   - se calcula el score del ejercicio y se actualiza `fit_client_exercise_scores`;
   - se elimina únicamente el progreso temporal de `fit_workout_sets`.
3. Al volver a asignar un ejercicio al mismo cliente, se busca por nombre normalizado (`press-banca`, por ejemplo) y Laravel devuelve `last_score`.
4. El frontend muestra el último score y precarga los pesos/repeticiones de la sesión anterior sin marcar las series como completadas.

## Score almacenado

- volumen total: suma de `peso x repeticiones`;
- mejor peso;
- mejores repeticiones;
- estimación de 1RM;
- número de series completadas;
- detalle de peso y repeticiones de cada serie;
- fecha y sesión donde se obtuvo.

## Verificaciones realizadas

- Sintaxis de todos los archivos PHP: correcta.
- TypeScript: sin errores.
- Compilación de producción de Next.js: correcta.
- No se usa PATCH; el cierre continúa mediante PUT.
- El progreso activo se limpia sólo después de crear el historial.
- El score se resuelve por cliente y nombre normalizado del ejercicio, incluso en una rutina nueva.
