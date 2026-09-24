# Cuentero

Archivo personal de cuentos de la selva amazónica.

App móvil con React Native y Expo. Los cuentos se guardan en SQLite dentro del celular (sin internet ni servidor).

**Estudiante:** Said  
**Repo:** https://github.com/javapgr/Cuentero_Prismo

## Interfaces de usuario

### 1. Lista (`/`)

Pantalla principal al abrir la app.

- Título **Cuentero (N)** con contador de cuentos (**T1**)
- Buscador por título en SQL (**T6**)
- Chips de etiquetas míticas para filtrar (**T8**)
- Tarjetas con título, vista previa (~80 letras) (**T3**) y fecha
- Estrella de favorito; los favoritos van primero (**T7**)
- Botón **+** para crear un cuento nuevo
- Accesos en la cabecera: **Lugares** y **Ajustes**

### 2. Editor (`/cuento/[id]` o `/cuento/nuevo`)

- Campos de título y cuerpo
- Contador de palabras en vivo (**T2**)
- Si hay cambios y tocas atrás: alerta para descartar (**T4**)
- Autoguardado a los 3 segundos sin tocar Guardar (**T10**)
- Chips de etiquetas (**T8**)
- Selector de lugar (**T12**)
- Grabar / reproducir audio oral (**T11**, `expo-audio`)
- Botones Guardar y Borrar

### 3. Ajustes (`/ajustes`)

- Exportar todos los cuentos a Markdown (**T5**)
- Importar desde un archivo Markdown (**T13**)
- **Tema Claro / Oscuro / Sistema** (**T9**) — *pendiente de activar en código si aún no ves los botones; di “dale en Agent mode”*

### 4. Lugares (`/lugares`)

- Cuentos agrupados por comunidad, río y quebrada (**T12**)

## Tareas resueltas

### Nivel 1
T1 · T2 · T3 · T4 · T5

### Nivel 2
T6 · T7 · T8 · T9 · T10

### Nivel 3
T11 · T12 · T13 · T14 (config EAS; generar APK con el comando de abajo)

## Ejecutar

```bash
npm install --legacy-peer-deps
npx expo start -c
```

Escanea el QR con Expo Go.

## Publicar APK (T14)

```bash
npx eas-cli@latest login
npm run build:apk
```

## Capturas

Pon pantallazos del celular en `docs/capturas/` (lista, editor, ajustes, favorito, lugares).

## Sustentación

Lee [`SUSTENTACION.md`](SUSTENTACION.md) antes de explicar mañana.
