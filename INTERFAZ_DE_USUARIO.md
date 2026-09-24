# Interfaz de usuario — Cuentero

Estudiante: Said

Este documento describe cómo se ve y se usa la app, pantalla por pantalla. Después hay una comparación entre lo que pide la guía (`said.md`) y lo que hay ahora en el proyecto.

---

## 1. Pantallas de la app

### 1.1 Lista de cuentos (inicio)

Ruta: `/`  
Archivo: `app/index.jsx`

Al abrir la app se ve:

- Cabecera verde con el título `Cuentero (N)`, donde N es cuántos cuentos hay.
- A la derecha: enlaces a **Lugares** y **Ajustes**.
- Un campo de búsqueda arriba (“Buscar por título…”).
- Una fila de chips: Todas, chullachaqui, yacuruna, sachamama, tunchi, bufeo colorado.
- Lista de tarjetas. Cada tarjeta muestra:
  - título
  - un trozo del cuerpo (vista previa)
  - fecha
  - estrella ★ / ☆ para favorito
- Botón flotante `+` abajo a la derecha para crear un cuento nuevo.

Si no hay cuentos (o el filtro no encuentra nada), aparece un texto vacío en el centro.

**Tareas que se notan aquí:** T1, T3, T6, T7, T8.

---

### 1.2 Editor de cuento

Ruta: `/cuento/nuevo` o `/cuento/[id]`  
Archivo: `app/cuento/[id].jsx`

Al tocar una tarjeta o el `+` se abre el editor:

- Campo de título
- Campo grande de cuerpo (multilínea)
- Debajo: contador de palabras (se actualiza al escribir)
- Si hay cambios sin guardar y tocas atrás, sale una alerta preguntando si descartas
- Si dejas de escribir unos 3 segundos, intenta guardar solo (autoguardado)
- Sección **Etiquetas** (chips para marcar seres míticos)
- Sección **Lugar** (Belén, Padre Cocha, o sin lugar)
- Sección **Audio oral** (Grabar / Reproducir)
- Botón **Guardar**
- Si el cuento ya existe: enlace **Borrar este cuento**

**Tareas que se notan aquí:** T2, T4, T8, T10, T11, T12.

---

### 1.3 Ajustes

Ruta: `/ajustes`  
Archivo: `app/ajustes.jsx`

Desde la lista, tocas Ajustes. Ahí está:

- **Exportar todos mis cuentos** → genera un `.md` y abre compartir
- **Importar desde Markdown** → eliges un archivo y lo vuelve a meter en la base

Nota: el modo oscuro de la app sigue al tema del celular (`useColorScheme`). Todavía no hay botones dentro de Ajustes para forzar Claro / Oscuro a mano (eso lo quiero agregar después).

**Tareas que se notan aquí:** T5, T13 (y T9 a nivel de colores en toda la app).

---

### 1.4 Lugares

Ruta: `/lugares`  
Archivo: `app/lugares.jsx`

Agrupa los cuentos por lugar (comunidad, río, quebrada). Si un cuento no tiene lugar, cae en “Sin lugar asignado”. Al tocar un título se abre el editor.

**Tarea:** T12.

---

## 2. Flujo básico de uso

1. Abres la lista.
2. Creas o editas un cuento.
3. Guardas (o esperas el autoguardado).
4. Vuelves a la lista (se refresca sola).
5. Si quieres, exportas desde Ajustes o miras por Lugares / etiquetas / favoritos.

Los datos quedan en SQLite dentro del celular (`cuentero.db`). No hay servidor.

---

## 3. Análisis: guía `said.md` vs lo que tenemos ahora

### 3.1 Lo que la guía pide en la versión 0 (pasos 1 a 6)

| Lo de la guía | ¿Lo tenemos? | Comentario |
| --- | --- | --- |
| Proyecto Expo + Expo Router | Sí | Carpetas `app/`, entry de expo-router |
| Lista + editor | Sí | Igual que el flujo de la guía |
| SQLite CRUD | Sí | `SQLiteProvider`, INSERT/UPDATE/DELETE/SELECT |
| Exportar a Markdown | Sí | Pantalla Ajustes |
| Misma red / Expo Go | Depende del lab | A veces hay que usar `--tunnel` |

En general la app base de la guía está cubierta.

### 3.2 Tareas nivel 1 (obligatorias)

| Tarea | Guía | Proyecto |
| --- | --- | --- |
| T1 Contador | En la cabecera | Sí: `Cuentero (N)` |
| T2 Palabras | En el editor | Sí |
| T3 Vista previa | 80 letras / 2 líneas | Sí |
| T4 Confirmar salida | Si hay cambios | Sí (`beforeRemove` + Alert) |
| T5 Tres cuentos + export | Escribir y exportar | Semilla de 3 cuentos + export + archivo `cuentos.md` |

### 3.3 Tareas nivel 2 (elegir dos; nosotros hicimos más)

| Tarea | Guía | Proyecto |
| --- | --- | --- |
| T6 Buscador SQL | `LIKE ?` | Sí |
| T7 Favoritos | Columna + estrella | Sí |
| T8 Etiquetas | Tablas + filtro | Sí |
| T9 Modo oscuro | `useColorScheme` | Parcial: colores cambian con el sistema, **falta UI para elegir tema a mano** |
| T10 Autoguardado | 3 s inactividad | Sí |

### 3.4 Tareas nivel 3 (extra)

| Tarea | Guía | Proyecto |
| --- | --- | --- |
| T11 Audio | Dice `expo-av` | Hecho con `expo-audio` (en Expo Go / SDK 57 `expo-av` fallaba). Misma idea: grabar y guardar la ruta |
| T12 Lugar | Tabla + pantalla | Sí (`lugares.jsx`) |
| T13 Importar MD | Leer export | Sí (DocumentPicker) |
| T14 APK | `eas build` | Solo está `eas.json` y el script; **todavía no generé el APK** |

### 3.5 Entrega (lo que pide el formato de la guía)

| Requisito | Estado |
| --- | --- |
| Repo público | Sí: `javapgr/Cuentero_Prismo` (la guía sugería nombre `cuentero-said`) |
| README con nombre, tareas, capturas, cómo correr | Parcial: falta meter capturas reales del celular |
| `cuentos.md` con los tres cuentos | Sí |
| Sin `node_modules` en el repo | Sí (`.gitignore`) |
| Sustentación | Pendiente (en clase) |

### 3.6 Conclusión corta

La app ya hace lo de la guía y casi todas las tareas. Lo más flojo ahora mismo es:

1. No poder cambiar claro/oscuro desde la interfaz (solo sigue al celular).
2. Falta sacar capturas en un celular real y pegarlas en `docs/capturas/`.
3. T14 (APK) no está corrido todavía.

Cuando revise el código, voy a fijarme sobre todo en poder explicar SQLite, `useFocusEffect` y el buscador con `LIKE`, que es lo que más suelen preguntar.
