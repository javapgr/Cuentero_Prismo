# Guión de sustentación — Cuentero (Said)

Lee esto en voz alta. Si puedes explicarlo sin mirar, estás listo.

## 1. ¿Qué es la app?

Cuentero guarda cuentos de la selva **en el celular** con SQLite. No hay servidor ni internet.

## 2. Preguntas que te pueden hacer

### ¿Dónde se guardan los datos?
En una base SQLite (`cuentero.db`) dentro del almacenamiento privado de la app. Se crea en `app/_layout.jsx` con `SQLiteProvider` y `onInit={iniciarBD}`.

### ¿Por qué `useFocusEffect` y no `useEffect`?
Cuando guardas y haces `router.back()`, la lista **no se destruye**: queda debajo en la pila. `useEffect` con `[]` solo corre al montar. `useFocusEffect` corre cada vez que la lista vuelve a verse, y ahí vuelvo a hacer `SELECT`.

### ¿Cómo evitas inyección SQL?
Nunca concateno el texto del usuario en el SQL. Uso parámetros: `WHERE id = ?` y paso `[Number(id)]`.

### ¿Qué hace cada método de SQLite?
- `getAllAsync` → lista (muchas filas)
- `getFirstAsync` → un cuento o `null`
- `runAsync` → INSERT / UPDATE / DELETE

## 3. Tareas (di archivo + idea)

| Tarea | En una frase | Archivo |
| --- | --- | --- |
| T1 | El título muestra `Cuentero (cuentos.length)` | `app/index.jsx` |
| T2 | Cuento palabras con `cuerpo.trim().split(/\s+/)` | `app/cuento/[id].jsx` |
| T3 | Preview: primeras 80 letras + `numberOfLines={2}` | `app/index.jsx` |
| T4 | Si hay cambios, `beforeRemove` + Alert antes de salir | `app/cuento/[id].jsx` |
| T5 | Tres cuentos semilla + exportar a Markdown | `_layout.jsx` + `ajustes.jsx` |
| T6 | Busco con `WHERE titulo LIKE ?` y `%texto%` | `app/index.jsx` |
| T7 | Columna `favorito`, estrella, orden `favorito DESC` | `_layout.jsx` + `index.jsx` |
| T8 | Tablas `etiqueta` y `cuento_etiqueta` | `_layout.jsx` + editor + lista |
| T9 | `useColorScheme()` cambia colores claro/oscuro | `src/theme` + pantallas |
| T10 | Tras 3 s sin escribir, guarda solo (`setTimeout`) | `app/cuento/[id].jsx` |
| T11 | Audio con `expo-audio`, ruta en columna `audio` | editor |
| T12 | Tabla `lugar` y pantalla `/lugares` | `_layout.jsx` + `lugares.jsx` |
| T13 | Importar Markdown (partir por `---`) | `ajustes.jsx` |
| T14 | APK con `eas build -p android --profile preview` | `eas.json` |

## 4. Flujo en una frase

Usuario escribe → `setState` redibuja → Guardar → `runAsync` en SQLite → `router.back()` → `useFocusEffect` vuelve a listar.
