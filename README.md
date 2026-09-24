# Cuentero

Archivo personal de cuentos de la selva amazónica.

App móvil con React Native y Expo. Guarda, edita y exporta cuentos en SQLite dentro del celular (sin internet ni servidor).

**Estudiante:** Said

## Tareas resueltas

### Nivel 1
- T1 Contador de cuentos
- T2 Contador de palabras
- T3 Vista previa en tarjetas
- T4 Confirmar salida sin guardar
- T5 Tres cuentos + exportar (`cuentos.md`)

### Nivel 2
- T6 Buscador SQL
- T7 Favoritos
- T8 Etiquetas míticas
- T9 Modo oscuro (`useColorScheme`)
- T10 Autoguardado 3 s

### Nivel 3
- T11 Audio oral (`expo-av`)
- T12 Lugares
- T13 Importar Markdown
- T14 APK con EAS (`eas.json` + comando abajo)

## Ejecutar

```bash
npm install --legacy-peer-deps
npx expo start
```

Escanea el QR con Expo Go.

## Publicar APK (T14)

```bash
npx eas-cli@latest login
npx eas-cli@latest build -p android --profile preview
```

## Capturas

Coloca pantallazos del celular en `docs/capturas/` (lista, editor, ajustes, favorito).

## Sustentación

Lee [`SUSTENTACION.md`](SUSTENTACION.md) antes de explicar mañana.

## Repo

https://github.com/javapgr/Cuentero_Prismo
