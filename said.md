# Guía didáctica: Cuentero — tu primera app en React Native

Sep 20, 2026 · @Someone

**Estudiante:** Said

---

## Objetivos de aprendizaje

Al terminar esta guía el estudiante habrá construido y tendrá corriendo en su propio celular una aplicación móvil que guarda cuentos de la selva de forma permanente, sin internet y sin servidor.

### Objetivos específicos

- Crear y ejecutar un proyecto de React Native con Expo en un dispositivo físico.
- Construir interfaces móviles con componentes nativos y estilos de React Native.
- Manejar estado local con los hooks `useState` y `useEffect`.
- Navegar entre pantallas y pasar parámetros con `expo-router`.
- Persistir datos en una base de datos SQLite embebida en el dispositivo.
- Implementar las cuatro operaciones CRUD contra esa base de datos.
- Exportar los datos a un archivo como respaldo.

### A quién va dirigida

Estudiantes que ya escriben JavaScript básico (variables, funciones, arreglos, map, funciones flecha) y entienden HTML. No se requiere experiencia previa en React ni en desarrollo móvil.

### Duración estimada

| Bloque | Contenido | Tiempo |
| --- | --- | --- |
| Sesión 1 | Conceptos + Pasos 1 a 3 | 3 horas |
| Sesión 2 | Pasos 4 a 6 | 3 horas |
| Trabajo autónomo | Tareas finales | 6 a 8 horas |

Modalidad sugerida: taller guiado en laboratorio, el docente proyecta y los estudiantes replican en su propia máquina.

---

## Qué vamos a construir: Cuentero

Cuentero es un archivo personal de cuentos de la selva amazónica: el usuario escribe, guarda, edita y borra relatos que quedan almacenados dentro del celular y siguen ahí aunque cierre la app o se quede sin internet.

Elegimos este dominio a propósito. Un bloc de notas genérico no motiva a nadie; un archivo de tradición oral amazónica sí, y técnicamente es el mismo ejercicio.

### Las dos pantallas

```mermaid
flowchart LR
  A[Lista de cuentos] -->|toca un cuento| B[Editor]
  A -->|botón +| B
  B -->|guardar| A
  B -->|borrar| A
```

- **Lista:** todos los cuentos ordenados del más reciente al más antiguo, con título y fecha. Un botón flotante `+` crea uno nuevo.
- **Editor:** campo de título, campo de cuerpo, botón de guardar y botón de borrar.

### Alcance de la versión 0

- **Lo que SÍ entra:** crear, listar, editar, borrar y exportar.
- **Lo que NO entra** (y es deliberado): búsqueda, etiquetas, audio, fotos, inicio de sesión, servidor, sincronización en la nube. Todo eso está en las tareas finales para quien quiera ir más lejos.

> Regla del taller: una app pequeña terminada enseña más que una app grande a medio hacer.

---

## Requisitos previos

No se necesita Android Studio ni emulador. La app corre en el celular del propio estudiante mediante la aplicación Expo Go.

### Conocimientos

- JavaScript: variables, funciones flecha, arreglos, map, desestructuración, async/await.
- Nociones de HTML y CSS (para entender la analogía con los componentes y los estilos).
- Manejo básico de terminal: `cd`, ejecutar comandos.

### Software en la computadora

| Herramienta | Versión | Para qué sirve | Cómo verificar |
| --- | --- | --- | --- |
| Node.js | 20 LTS o superior | Ejecutar las herramientas de Expo | `node -v` |
| npm | Viene con Node | Instalar paquetes | `npm -v` |
| Visual Studio Code | Última | Editar el código | — |
| Git | Última | Entregar la tarea | `git --version` |

### En el celular

- Instalar **Expo Go** desde Play Store (Android) o App Store (iOS).
- El celular y la computadora deben estar en la **misma red Wi-Fi**. Este punto falla más seguido de lo que parece: en laboratorios con redes separadas para docentes y alumnos, no conecta.

### Extensiones recomendadas de VS Code

- ES7+ React/Redux/React-Native snippets
- Prettier

Si el laboratorio tiene red restringida, la alternativa es el modo túnel (`npx expo start --tunnel`), más lento pero funciona a través de internet.

---

## Conceptos clave antes de escribir código

React Native no genera una página web dentro del celular. Escribimos JavaScript y el framework construye los componentes nativos reales del sistema operativo. Un `<Text>` de React Native se convierte en un `TextView` de Android o un `UILabel` de iOS.

### 1. Componente

Un componente es una función de JavaScript que devuelve interfaz. Se escribe con la primera letra en mayúscula.

```jsx
function Saludo() {
  return <Text>Hola, Iquitos</Text>;
}
```

Ese `<Text>` dentro del JavaScript se llama **JSX**: es azúcar sintáctico, no es HTML.

### 2. Los componentes no son etiquetas HTML

En React Native no existen `<div>`, `<p>` ni `<span>`. Esta es la tabla de equivalencias que los estudiantes deben memorizar:

| En web | En React Native | Nota |
| --- | --- | --- |
| `<div>` | `<View>` | Contenedor. No puede contener texto directo. |
| `<p>`, `<span>`, `<h1>` | `<Text>` | Todo texto visible va dentro de un `<Text>`. |
| `<input>` | `<TextInput>` | |
| `<button>` | `<Pressable>` | |
| `<ul>` con muchos ítems | `<FlatList>` | Optimizada: solo dibuja lo que se ve en pantalla. |
| `<img>` | `<Image>` | |

El error número uno del principiante es escribir texto suelto dentro de un `<View>`. Eso revienta la app con el mensaje *Text strings must be rendered within a Text component*.

### 3. Props

Las props son los datos que un componente recibe de quien lo usa. Son de solo lectura.

```jsx
function Saludo({ nombre }) {
  return <Text>Hola, {nombre}</Text>;
}

// Uso:
<Saludo nombre="Said" />
```

### 4. Estado (`useState`)

El estado es la memoria del componente. Cuando el estado cambia, React vuelve a dibujar la pantalla automáticamente.

```jsx
const [titulo, setTitulo] = useState('');
```

- `titulo` es el valor actual.
- `setTitulo` es la única forma válida de cambiarlo.
- `useState('')` define el valor inicial.

Nunca se modifica el valor directamente (`titulo = 'algo'` no hace nada visible). Siempre se usa la función `setTitulo`.

### 5. Efectos (`useEffect`)

Sirve para ejecutar código que no es dibujar: leer la base de datos, pedir datos a una API, arrancar un temporizador.

```jsx
useEffect(() => {
  cargarCuentos();
}, []);
```

El arreglo vacío `[]` al final significa "ejecútalo una sola vez, cuando el componente aparece". Si se olvida ese arreglo, el efecto se ejecuta en cada dibujado y se genera un bucle infinito.

### 6. Estilos

No hay archivos CSS. Los estilos son objetos de JavaScript, en camelCase.

```jsx
const styles = StyleSheet.create({
  tarjeta: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    borderRadius: 12,
  },
});
```

Diferencias importantes con CSS: no hay unidades (los números son píxeles independientes de densidad), todo es Flexbox por defecto, y `flexDirection` es `column` por defecto, no `row`.

### 7. El ciclo mental completo

```mermaid
flowchart LR
  A[Usuario toca algo] --> B[Se llama setEstado]
  B --> C[React redibuja]
  C --> D[Pantalla actualizada]
  D --> A
```

Si el estudiante entiende este ciclo, entiende React. Todo lo demás son detalles.

---

## Paso 1 — Crear el proyecto y verlo en el celular

**Meta del paso:** que el estudiante vea en su celular una pantalla que dice "Cuentero" y que al cambiar el texto en la computadora, el celular se actualice solo.

### 1.1 Crear el proyecto

En la terminal, dentro de la carpeta donde guardas tus proyectos:

```bash
npx create-expo-app@latest cuentero --template blank
cd cuentero
```

La plantilla `blank` entrega un proyecto vacío, sin el código de ejemplo que trae la plantilla por defecto. Es mejor para aprender: empezamos desde cero y no hay nada que borrar.

### 1.2 Instalar las dependencias del taller

```bash
npx expo install expo-router expo-sqlite react-native-safe-area-context react-native-screens expo-linking expo-constants expo-status-bar
```

Se usa `npx expo install` y no `npm install`. La diferencia importa: `expo install` elige la versión de cada paquete compatible con la versión del SDK de Expo del proyecto. Con `npm install` se instala la última versión de todo y la app falla con errores difíciles de leer.

### 1.3 Activar expo-router

Expo Router usa enrutamiento por archivos: cada archivo dentro de la carpeta `app/` se convierte en una pantalla, igual que en Next.js.

Primero, en `package.json`, cambia el punto de entrada:

```json
"main": "expo-router/entry"
```

Luego, en `app.json`, dentro de `expo`, agrega el esquema:

```json
"scheme": "cuentero"
```

### 1.4 Crear la estructura de carpetas

Borra `App.js` si existe y crea esta estructura:

```text
cuentero/
├── app/
│   ├── _layout.jsx      ← envoltura común de todas las pantallas
│   └── index.jsx        ← pantalla de lista (ruta "/")
├── app.json
└── package.json
```

**`app/_layout.jsx`**

```jsx
import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#1b4332' },
        headerTintColor: '#fff',
      }}
    />
  );
}
```

Un `Stack` es una pila de pantallas: cada pantalla nueva se apila encima de la anterior y el botón "atrás" desapila. Es la navegación estándar de cualquier app móvil.

**`app/index.jsx`**

```jsx
import { View, Text, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';

export default function Lista() {
  return (
    <View style={styles.contenedor}>
      <Stack.Screen options={{ title: 'Cuentero' }} />
      <Text style={styles.titulo}>Mis cuentos de la selva</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: '#f7f5f0', padding: 16 },
  titulo: { fontSize: 20, fontWeight: '600', color: '#1b4332' },
});
```

`flex: 1` significa "ocupa todo el espacio disponible". Sin eso, el fondo solo pinta el alto del contenido.

### 1.5 Ejecutar

```bash
npx expo start
```

Aparece un código QR en la terminal. Se escanea con la cámara (iOS) o desde la app Expo Go (Android) y la app abre en el celular.

**Comprobación del paso:** cambia el texto `Mis cuentos de la selva` por otra cosa y guarda el archivo. El celular debe actualizarse en menos de dos segundos sin volver a escanear nada. A eso se le llama Fast Refresh, y es lo que hace productivo el desarrollo con Expo.

---

## Paso 2 — La pantalla de lista con datos falsos

**Meta del paso:** ver una lista de cuentos en pantalla. Todavía sin base de datos: los datos están escritos a mano en el código.

Este paso se hace primero a propósito. Diseñar la interfaz con datos falsos permite equivocarse rápido y barato; cuando después conectemos SQLite, la pantalla ya funciona y solo cambia de dónde vienen los datos.

### 2.1 El código

Reemplaza `app/index.jsx` por:

```jsx
import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';

const CUENTOS_FALSOS = [
  { id: 1, titulo: 'El chullachaqui del camino viejo', editado: '2026-09-18' },
  { id: 2, titulo: 'La yacuruna del Nanay', editado: '2026-09-15' },
  { id: 3, titulo: 'El tunchi que silbó tres veces', editado: '2026-09-11' },
];

export default function Lista() {
  return (
    <View style={styles.contenedor}>
      <Stack.Screen options={{ title: 'Cuentero' }} />
      <FlatList
        data={CUENTOS_FALSOS}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        ListEmptyComponent={
          <Text style={styles.vacio}>Todavía no hay cuentos.</Text>
        }
        renderItem={({ item }) => (
          <Pressable style={styles.tarjeta}>
            <Text style={styles.tarjetaTitulo}>{item.titulo}</Text>
            <Text style={styles.tarjetaFecha}>{item.editado}</Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: '#f7f5f0' },
  tarjeta: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e8e2d5',
  },
  tarjetaTitulo: { fontSize: 16, fontWeight: '600', color: '#1b4332' },
  tarjetaFecha: { fontSize: 12, color: '#7a8b7f', marginTop: 4 },
  vacio: { textAlign: 'center', color: '#7a8b7f', marginTop: 40 },
});
```

### 2.2 Qué hace cada propiedad de FlatList

| Propiedad | Qué hace | Por qué importa |
| --- | --- | --- |
| `data` | El arreglo a mostrar | Es la fuente de la lista |
| `renderItem` | Función que dibuja un elemento | Recibe `{ item }` y devuelve JSX |
| `keyExtractor` | Devuelve un id único por fila | Sin él React no sabe qué fila cambió y aparecen advertencias |
| `ListEmptyComponent` | Qué mostrar si no hay datos | La app se ve terminada aun estando vacía |
| `contentContainerStyle` | Estilos del contenido interno | El padding va aquí, no en `style` |

### 2.3 Por qué FlatList y no map

Con `map` se dibujan los 500 cuentos aunque solo se vean 8 en pantalla, y la app se pone lenta. `FlatList` solo monta las filas visibles y va reciclando conforme el usuario desplaza. Es el componente que se usa en producción.

**Comprobación del paso:** se ven tres tarjetas con título y fecha, y la lista se desplaza si se agregan más elementos al arreglo. Al tocar una tarjeta todavía no pasa nada: eso es el paso 3.

---

## Paso 3 — Navegación entre pantallas

**Meta del paso:** al tocar una tarjeta se abre el editor con ese cuento; con el botón `+` se abre el editor vacío.

### 3.1 Cómo funcionan las rutas

Cada archivo en `app/` es una ruta. Los corchetes marcan un parámetro dinámico:

| Archivo | Ruta | Significado |
| --- | --- | --- |
| `app/index.jsx` | `/` | La lista |
| `app/cuento/[id].jsx` | `/cuento/7` | El editor del cuento 7 |
| `app/cuento/[id].jsx` | `/cuento/nuevo` | El editor vacío |

Usamos la palabra `nuevo` como id especial en lugar de crear otra pantalla. Así el editor es un solo archivo que se comporta de dos maneras según el parámetro que reciba.

### 3.2 Agregar la navegación a la lista

Envuelve el contenido de `renderItem` con `useRouter` y agrega el botón flotante:

```jsx
import { useRouter, Stack } from 'expo-router';

export default function Lista() {
  const router = useRouter();

  return (
    <View style={styles.contenedor}>
      <Stack.Screen options={{ title: 'Cuentero' }} />
      <FlatList
        data={CUENTOS_FALSOS}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        renderItem={({ item }) => (
          <Pressable
            style={styles.tarjeta}
            onPress={() => router.push(`/cuento/${item.id}`)}
          >
            <Text style={styles.tarjetaTitulo}>{item.titulo}</Text>
            <Text style={styles.tarjetaFecha}>{item.editado}</Text>
          </Pressable>
        )}
      />
      <Pressable style={styles.boton} onPress={() => router.push('/cuento/nuevo')}>
        <Text style={styles.botonTexto}>+</Text>
      </Pressable>
    </View>
  );
}
```

Estilos adicionales:

```jsx
boton: {
  position: 'absolute',
  right: 20,
  bottom: 28,
  width: 56,
  height: 56,
  borderRadius: 28,
  backgroundColor: '#1b4332',
  alignItems: 'center',
  justifyContent: 'center',
  elevation: 4,
},
botonTexto: { color: '#fff', fontSize: 28, lineHeight: 30 },
```

### 3.3 La pantalla editor

Crea `app/cuento/[id].jsx`:

```jsx
import { useState } from 'react';
import {
  View,
  TextInput,
  Pressable,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';

export default function Editor() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const esNuevo = id === 'nuevo';
  const [titulo, setTitulo] = useState('');
  const [cuerpo, setCuerpo] = useState('');

  function guardar() {
    console.log('Por guardar:', { id, titulo, cuerpo });
    router.back();
  }

  return (
    <KeyboardAvoidingView
      style={styles.contenedor}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Stack.Screen options={{ title: esNuevo ? 'Nuevo cuento' : 'Editar cuento' }} />
      <TextInput
        style={styles.titulo}
        placeholder="Título del cuento"
        value={titulo}
        onChangeText={setTitulo}
      />
      <TextInput
        style={styles.cuerpo}
        placeholder="Había una vez, en la quebrada..."
        value={cuerpo}
        onChangeText={setCuerpo}
        multiline
        textAlignVertical="top"
      />
      <Pressable style={styles.guardar} onPress={guardar}>
        <Text style={styles.guardarTexto}>Guardar</Text>
      </Pressable>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: '#f7f5f0', padding: 16, gap: 12 },
  titulo: {
    fontSize: 18,
    fontWeight: '600',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e8e2d5',
  },
  cuerpo: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e8e2d5',
  },
  guardar: {
    backgroundColor: '#1b4332',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  guardarTexto: { color: '#fff', fontWeight: '600' },
});
```

### 3.4 Los tres conceptos nuevos de este paso

- `useLocalSearchParams` lee los parámetros de la ruta. Si la URL es `/cuento/7`, entonces `id` vale `"7"` — siempre texto, nunca número. Hay que convertirlo con `Number(id)` cuando se use en SQL.
- `router.push` apila una pantalla nueva; `router.back()` regresa a la anterior.
- `KeyboardAvoidingView` levanta el contenido cuando aparece el teclado. Sin esto, en iOS el teclado tapa el campo donde se está escribiendo.

**Comprobación del paso:** navega de la lista al editor y de regreso. Al tocar "Guardar" aparece el objeto en la consola de la terminal y la app regresa a la lista. Todavía no guarda nada real.

---

## Paso 4 — La base de datos SQLite

**Meta del paso:** crear una base de datos dentro del celular y dejarla disponible para todas las pantallas.

### 4.1 Qué es SQLite aquí

SQLite es un motor de base de datos relacional que no corre como servidor: la base entera es un archivo dentro del almacenamiento privado de la app. Nadie más lo ve, no necesita internet, y el SQL es el mismo que ya conocen.

Es el mismo motor que usan WhatsApp, Chrome y Android para sus datos locales.

### 4.2 El esquema

```sql
CREATE TABLE IF NOT EXISTS cuento (
  id      INTEGER PRIMARY KEY AUTOINCREMENT,
  titulo  TEXT NOT NULL,
  cuerpo  TEXT NOT NULL DEFAULT '',
  creado  TEXT NOT NULL,
  editado TEXT NOT NULL
);
```

Dos decisiones de diseño que conviene explicar en clase:

- `IF NOT EXISTS` permite que el código de creación se ejecute en cada arranque sin romper nada.
- Las fechas van como `TEXT` en formato ISO (`2026-09-20T14:32:00.000Z`). SQLite no tiene tipo fecha, y el formato ISO tiene la propiedad de que ordenar alfabéticamente equivale a ordenar cronológicamente.

### 4.3 Conectar la base a la app

Modifica `app/_layout.jsx`:

```jsx
import { Stack } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite';
import { Suspense } from 'react';
import { ActivityIndicator, View } from 'react-native';

async function iniciarBD(db) {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS cuento (
      id      INTEGER PRIMARY KEY AUTOINCREMENT,
      titulo  TEXT NOT NULL,
      cuerpo  TEXT NOT NULL DEFAULT '',
      creado  TEXT NOT NULL,
      editado TEXT NOT NULL
    );
  `);
}

export default function Layout() {
  return (
    <Suspense
      fallback={
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <ActivityIndicator size="large" />
        </View>
      }
    >
      <SQLiteProvider databaseName="cuentero.db" onInit={iniciarBD} useSuspense>
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: '#1b4332' },
            headerTintColor: '#fff',
          }}
        />
      </SQLiteProvider>
    </Suspense>
  );
}
```

### 4.4 Qué hace cada pieza

| Pieza | Función |
| --- | --- |
| `SQLiteProvider` | Abre la base una sola vez y la comparte con todas las pantallas |
| `databaseName` | Nombre del archivo físico dentro del celular |
| `onInit` | Se ejecuta al abrir: aquí se crean las tablas |
| `useSuspense` | Hace que las pantallas esperen a que la base esté lista |
| `Suspense` + `fallback` | Qué mostrar mientras tanto |
| `PRAGMA journal_mode = WAL` | Modo de escritura más rápido y seguro ante cierres inesperados |

Este patrón es el mismo de la inyección de dependencias: la conexión se crea una vez arriba y se consume abajo con `useSQLiteContext()`, sin variables globales regadas por el proyecto.

**Comprobación del paso:** la app sigue funcionando igual que antes. Si no arroja errores, la base ya existe. Es un paso invisible, y conviene avisarlo para que nadie crea que algo falló.

---

## Paso 5 — Guardar, editar y borrar de verdad

**Meta del paso:** que los cuentos sobrevivan al cierre de la app. Aquí está el 80% del aprendizaje del taller.

### 5.1 La lista lee de la base

Reemplaza el arreglo falso por consultas reales en `app/index.jsx`:

```jsx
import { useState, useCallback } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { Stack, useRouter, useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';

export default function Lista() {
  const db = useSQLiteContext();
  const router = useRouter();
  const [cuentos, setCuentos] = useState([]);

  useFocusEffect(
    useCallback(() => {
      let activo = true;
      async function cargar() {
        const filas = await db.getAllAsync(
          'SELECT id, titulo, editado FROM cuento ORDER BY editado DESC'
        );
        if (activo) setCuentos(filas);
      }
      cargar();
      return () => {
        activo = false;
      };
    }, [db])
  );

  return (
    <View style={styles.contenedor}>
      <Stack.Screen options={{ title: 'Cuentero' }} />
      <FlatList
        data={cuentos}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        ListEmptyComponent={
          <Text style={styles.vacio}>
            Todavía no hay cuentos. Toca + para escribir el primero.
          </Text>
        }
        renderItem={({ item }) => (
          <Pressable
            style={styles.tarjeta}
            onPress={() => router.push(`/cuento/${item.id}`)}
          >
            <Text style={styles.tarjetaTitulo}>{item.titulo}</Text>
            <Text style={styles.tarjetaFecha}>
              {new Date(item.editado).toLocaleDateString('es-PE')}
            </Text>
          </Pressable>
        )}
      />
      <Pressable style={styles.boton} onPress={() => router.push('/cuento/nuevo')}>
        <Text style={styles.botonTexto}>+</Text>
      </Pressable>
    </View>
  );
}
```

**Por qué `useFocusEffect` y no `useEffect`:** `useEffect` con `[]` se ejecuta una sola vez, al montar la pantalla. Pero cuando el usuario guarda un cuento y regresa con `router.back()`, la lista no se vuelve a montar: sigue viva debajo en la pila. Con `useEffect` el cuento nuevo no aparecería y el estudiante creería que no se guardó. `useFocusEffect` se dispara cada vez que la pantalla vuelve a tomar el foco.

La variable `activo` evita actualizar el estado de un componente que ya se desmontó, un error clásico que ensucia la consola con advertencias.

### 5.2 El editor carga, guarda y borra

Reemplaza `app/cuento/[id].jsx`:

```jsx
import { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  Pressable,
  Text,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';

export default function Editor() {
  const db = useSQLiteContext();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const esNuevo = id === 'nuevo';
  const [titulo, setTitulo] = useState('');
  const [cuerpo, setCuerpo] = useState('');

  // LEER: si el cuento existe, traerlo de la base
  useEffect(() => {
    if (esNuevo) return;
    async function cargar() {
      const fila = await db.getFirstAsync(
        'SELECT titulo, cuerpo FROM cuento WHERE id = ?',
        [Number(id)]
      );
      if (fila) {
        setTitulo(fila.titulo);
        setCuerpo(fila.cuerpo);
      }
    }
    cargar();
  }, [id, esNuevo, db]);

  // CREAR o ACTUALIZAR
  async function guardar() {
    const limpio = titulo.trim();
    if (!limpio) {
      Alert.alert('Falta el título', 'Todo cuento necesita un nombre.');
      return;
    }
    const ahora = new Date().toISOString();
    if (esNuevo) {
      await db.runAsync(
        'INSERT INTO cuento (titulo, cuerpo, creado, editado) VALUES (?, ?, ?, ?)',
        [limpio, cuerpo, ahora, ahora]
      );
    } else {
      await db.runAsync(
        'UPDATE cuento SET titulo = ?, cuerpo = ?, editado = ? WHERE id = ?',
        [limpio, cuerpo, ahora, Number(id)]
      );
    }
    router.back();
  }

  // BORRAR
  function confirmarBorrado() {
    Alert.alert('Borrar cuento', 'Esta acción no se puede deshacer.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Borrar',
        style: 'destructive',
        onPress: async () => {
          await db.runAsync('DELETE FROM cuento WHERE id = ?', [Number(id)]);
          router.back();
        },
      },
    ]);
  }

  return (
    <KeyboardAvoidingView
      style={styles.contenedor}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Stack.Screen options={{ title: esNuevo ? 'Nuevo cuento' : 'Editar cuento' }} />
      <TextInput
        style={styles.titulo}
        placeholder="Título del cuento"
        value={titulo}
        onChangeText={setTitulo}
      />
      <TextInput
        style={styles.cuerpo}
        placeholder="Había una vez, en la quebrada..."
        value={cuerpo}
        onChangeText={setCuerpo}
        multiline
        textAlignVertical="top"
      />
      <Pressable style={styles.guardar} onPress={guardar}>
        <Text style={styles.guardarTexto}>Guardar</Text>
      </Pressable>
      {!esNuevo && (
        <Pressable onPress={confirmarBorrado}>
          <Text style={styles.borrar}>Borrar este cuento</Text>
        </Pressable>
      )}
    </KeyboardAvoidingView>
  );
}
```

Agrega a los estilos:

```jsx
borrar: { textAlign: 'center', color: '#a4161a', paddingVertical: 10 },
```

### 5.3 Los tres métodos de expo-sqlite

| Método | Devuelve | Cuándo se usa |
| --- | --- | --- |
| `getAllAsync(sql, params)` | Arreglo de filas | Listar muchos registros |
| `getFirstAsync(sql, params)` | Una fila o `null` | Traer un registro por id |
| `runAsync(sql, params)` | `{ changes, lastInsertRowId }` | INSERT, UPDATE, DELETE |

### 5.4 Los signos de interrogación no son opcionales

Nunca se arma el SQL concatenando texto:

```jsx
// MAL — inyección SQL y se rompe con comillas en el texto
await db.runAsync(`SELECT * FROM cuento WHERE titulo = '${titulo}'`);

// BIEN — parámetros vinculados
await db.getFirstAsync('SELECT * FROM cuento WHERE titulo = ?', [titulo]);
```

Aquí hay dos razones, y ambas son buen material de clase. La primera es seguridad: es la misma inyección SQL que se estudia en cualquier curso de base de datos. La segunda es práctica e inmediata: un cuento amazónico va a contener apóstrofes ("la quebrada d'antes") y sin parámetros la consulta revienta.

### 5.5 El ciclo completo de datos

```mermaid
flowchart TD
  A[Usuario escribe] --> B[setTitulo actualiza el estado]
  B --> C[Toca Guardar]
  C --> D[runAsync escribe en SQLite]
  D --> E[router.back regresa a la lista]
  E --> F[useFocusEffect vuelve a consultar]
  F --> G[setCuentos redibuja la lista]
```

**Comprobación del paso:** crear un cuento, cerrar la app por completo (no minimizarla: sacarla de las apps recientes), volver a abrirla y verificar que el cuento sigue ahí. Ese es el momento en que los estudiantes entienden qué significa persistencia.

---

## Paso 6 — Exportar los cuentos (respaldo)

**Meta del paso:** poder sacar todos los cuentos de la app en un archivo de texto y compartirlo por WhatsApp, correo o Drive.

Este paso no es decorativo. Una app con almacenamiento local y sin exportación es una app que algún día borra el trabajo del usuario: basta con desinstalarla, cambiar de celular o limpiar los datos. Enseñar esto forma el criterio de que los datos del usuario son suyos y debe poder llevárselos.

### 6.1 Instalar

```bash
npx expo install expo-file-system expo-sharing
```

### 6.2 Crear la pantalla de ajustes

Crea `app/ajustes.jsx`:

```jsx
import { View, Text, Pressable, Alert, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export default function Ajustes() {
  const db = useSQLiteContext();

  async function exportar() {
    const cuentos = await db.getAllAsync(
      'SELECT titulo, cuerpo, creado FROM cuento ORDER BY creado ASC'
    );
    if (cuentos.length === 0) {
      Alert.alert('Nada que exportar', 'Todavía no has escrito ningún cuento.');
      return;
    }
    const texto = cuentos
      .map((c) => `# ${c.titulo}\n(${c.creado.slice(0, 10)})\n\n${c.cuerpo}`)
      .join('\n\n---\n\n');
    const ruta = FileSystem.documentDirectory + 'cuentos.md';
    await FileSystem.writeAsStringAsync(ruta, texto);
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(ruta);
    } else {
      Alert.alert('Guardado', `Archivo creado en: ${ruta}`);
    }
  }

  return (
    <View style={styles.contenedor}>
      <Stack.Screen options={{ title: 'Ajustes' }} />
      <Pressable style={styles.boton} onPress={exportar}>
        <Text style={styles.botonTexto}>Exportar todos mis cuentos</Text>
      </Pressable>
      <Text style={styles.nota}>
        Se genera un archivo Markdown con todos tus cuentos y se abre el menú para
        compartirlo.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: '#f7f5f0', padding: 16, gap: 12 },
  boton: {
    backgroundColor: '#1b4332',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  botonTexto: { color: '#fff', fontWeight: '600' },
  nota: { color: '#7a8b7f', fontSize: 13, lineHeight: 19 },
});
```

### 6.3 Llegar a ajustes desde la lista

Agrega un botón en la cabecera de `app/index.jsx`:

```jsx
<Stack.Screen
  options={{
    title: 'Cuentero',
    headerRight: () => (
      <Pressable onPress={() => router.push('/ajustes')}>
        <Text style={{ color: '#fff', fontSize: 16 }}>Ajustes</Text>
      </Pressable>
    ),
  }}
/>
```

### 6.4 Conceptos nuevos

- `FileSystem.documentDirectory` es la carpeta privada de la app dentro del celular. Solo esta app puede leerla.
- `Sharing.shareAsync` abre la hoja de compartir del sistema operativo, la misma que aparece al compartir una foto.
- Elegimos Markdown y no JSON porque el archivo debe poder leerlo una persona, no solo un programa. El usuario final de Cuentero es alguien que escribe cuentos.

**Comprobación del paso:** exportar, enviarse el archivo por WhatsApp a uno mismo, abrirlo y ver los cuentos completos.

---

## Errores comunes y cómo resolverlos

Esta tabla conviene proyectarla durante el taller. Casi todos los bloqueos del laboratorio están aquí.

| Síntoma | Causa | Solución |
| --- | --- | --- |
| Text strings must be rendered within a Text component | Hay texto suelto dentro de un `<View>` | Envolver todo texto en `<Text>` |
| El QR no conecta | Celular y PC en redes distintas | Misma Wi-Fi, o `npx expo start --tunnel` |
| Pantalla blanca al abrir | Error de sintaxis o falta `export default` | Revisar la terminal: el error real está ahí |
| Unable to resolve module | Paquete no instalado o servidor desactualizado | `npx expo install <paquete>` y reiniciar con `npx expo start -c` |
| La lista no se actualiza al volver | Se usó `useEffect` en vez de `useFocusEffect` | Cambiar a `useFocusEffect` (ver 5.1) |
| Los cuentos desaparecen al reiniciar | Se guardó en estado, no en la base | Verificar que `runAsync` realmente se ejecuta |
| no such table: cuento | `onInit` no corrió o cambió el esquema | Desinstalar la app del celular y volver a abrir |
| El teclado tapa el campo | Falta `KeyboardAvoidingView` | Ver 3.3 |
| Cannot read property of undefined | `getFirstAsync` devolvió `null` | Validar con `if (fila)` antes de usarla |
| Cambié el CREATE TABLE y no pasa nada | `IF NOT EXISTS` no altera tablas ya creadas | Desinstalar la app, o aprender migraciones (tarea avanzada) |

### Cómo leer un error en React Native

Enséñales este método, sirve para toda la carrera:

1. Leer la primera línea roja, no el bloque entero. El resto suele ser ruido interno del framework.
2. Buscar el nombre de un archivo propio en el rastro de la pila. Ese es el lugar del problema, no `node_modules`.
3. Mirar la terminal donde corre `npx expo start`: ahí aparecen los `console.log` y errores que la pantalla del celular resume.
4. Si nada funciona, el martillo grande: `npx expo start -c` (limpia la caché) y, en último caso, desinstalar la app del celular.

---

## Tareas para los alumnos

Las tareas están en tres niveles. El nivel 1 es obligatorio para todos; el 2 se elige; el 3 es para quien quiera destacar.

### Nivel 1 — Obligatorio (todos)

Cada tarea de este nivel se resuelve con lo enseñado en la guía. Sin ayuda externa debería tomar entre 30 y 60 minutos cada una.

- [ ] **T1. Contador de cuentos.** Mostrar en la cabecera de la lista cuántos cuentos hay guardados. Pista: `cuentos.length`.
- [ ] **T2. Contador de palabras.** En el editor, mostrar debajo del cuerpo cuántas palabras lleva escritas el cuento, actualizándose mientras se escribe.
- [ ] **T3. Vista previa en la tarjeta.** Que cada tarjeta de la lista muestre las primeras 80 letras del cuerpo del cuento debajo del título. Pista: `numberOfLines={2}` en `<Text>`.
- [ ] **T4. Confirmar salida sin guardar.** Si el usuario modificó el texto y toca atrás, preguntarle si desea descartar los cambios.
- [ ] **T5. Tres cuentos propios.** Escribir tres cuentos reales de la selva dentro de la app —recopilados de familiares, vecinos o de la tradición del lugar de origen del estudiante— y exportarlos.

### Nivel 2 — Elegir dos

Requieren investigar en la documentación de Expo. Ese es exactamente el objetivo: que el estudiante aprenda a leer documentación oficial.

- [ ] **T6. Buscador.** Un `TextInput` arriba de la lista que filtre por título. Debe filtrarse en SQL, no en JavaScript. Pista: `WHERE titulo LIKE ?` con `%texto%`.
- [ ] **T7. Marcar favoritos.** Agregar una columna `favorito INTEGER DEFAULT 0`, un botón de estrella en cada tarjeta, y que los favoritos aparezcan primero.
- [ ] **T8. Etiquetas de seres míticos.** Nueva tabla `etiqueta` y tabla puente `cuento_etiqueta`. Permitir asignar etiquetas (chullachaqui, yacuruna, sachamama, tunchi, bufeo colorado) y filtrar la lista por etiqueta.
- [ ] **T9. Modo oscuro.** Detectar el tema del sistema con `useColorScheme()` y adaptar todos los colores de la app.
- [ ] **T10. Autoguardado.** Que el cuento se guarde solo cada 3 segundos de inactividad, sin tocar el botón. Pista: `setTimeout` dentro de un `useEffect` con limpieza.

### Nivel 3 — Reto abierto (opcional, puntaje extra)

- [ ] **T11. Audio de la versión oral.** Grabar audio con `expo-av`, guardar la ruta del archivo en la tabla `cuento` y poder reproducirlo desde el editor. Es la funcionalidad que más valor cultural le da a la app.
- [ ] **T12. Lugar del cuento.** Tabla `lugar` (comunidad, río, quebrada) relacionada con `cuento`, y una pantalla que agrupe los cuentos por lugar de origen.
- [ ] **T13. Importar desde archivo.** Leer un archivo Markdown exportado previamente y volver a cargarlo en la base. Cierra el ciclo del respaldo.
- [ ] **T14. Publicar la app.** Generar un APK instalable con `eas build -p android --profile preview` y compartirlo con un compañero para que lo instale en su celular.

---

## Reglas de entrega

- El trabajo es individual. Se puede consultar entre compañeros, pero el código se escribe solo.
- Está permitido usar IA para consultar dudas, no para generar el trabajo completo. En la sustentación se preguntará por cualquier línea del código: quien no pueda explicar lo que entregó, no aprueba.
- Cada tarea entregada debe incluir una captura de pantalla de la funcionalidad corriendo en un celular real.

---

## Evaluación y entrega

### Rúbrica (escala vigesimal)

| Criterio | Qué se evalúa | Puntos |
| --- | --- | --- |
| App base funcionando | Los seis pasos completos, corriendo en celular real | 6 |
| Tareas de nivel 1 | Las cinco tareas obligatorias resueltas | 5 |
| Tareas de nivel 2 | Dos tareas a elección, correctas y funcionales | 4 |
| Calidad del código | Nombres claros, sin código muerto, estilos ordenados, SQL parametrizado | 2 |
| Sustentación | Explica su código y responde preguntas sobre cualquier línea | 3 |
| Nivel 3 | Reto abierto resuelto | +2 extra |

Nota máxima sin puntaje extra: 20. El puntaje extra no compensa la ausencia de la sustentación.

### Escala de logro

| Rango | Nivel | Descripción |
| --- | --- | --- |
| 18 – 20 | Destacado | App completa, código limpio, domina lo que escribió |
| 14 – 17 | Logrado | Funciona todo lo obligatorio, explica su código |
| 11 – 13 | En proceso | App base funciona, tareas incompletas |
| 0 – 10 | En inicio | La app no corre o no puede explicar el código entregado |

### Formato de entrega

- Repositorio en GitHub, público, llamado `cuentero-said`, con un `README.md` que incluya: nombre del estudiante (**Said**), qué tareas resolvió, capturas de pantalla y los pasos para ejecutar el proyecto.
- El archivo `cuentos.md` exportado desde la app con los tres cuentos de la tarea T5.
- **Importante:** el repositorio no debe incluir la carpeta `node_modules`. Verificar que el archivo `.gitignore` la contenga.
- Enviar el enlace del repositorio por el aula virtual.

### Plazos sugeridos

| Hito | Cuándo |
| --- | --- |
| Taller presencial (sesiones 1 y 2) | Semana 1 |
| Entrega del repositorio | Fin de la semana 2 |
| Sustentación individual | Semana 3, en clase, 5 minutos por estudiante |
