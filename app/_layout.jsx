import { Stack } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite';
import { Suspense } from 'react';
import { ActivityIndicator, View } from 'react-native';

const CUENTOS_SEMILLA = [
  {
    titulo: 'El chullachaqui del camino viejo',
    cuerpo:
      'Dicen que en el camino que baja a la quebrada, cuando la luna está baja, aparece un hombre con un pie torcido. No llama a gritos: silba suave, como quien invita a seguirlo. Mi abuelo contaba que quien lo sigue se pierde entre los árboles y regresa días después sin recordar el rumbo. Por eso, si oyes un silbido y no ves a nadie conocido, no contestes: sigue tu camino y no mires atrás.',
  },
  {
    titulo: 'La yacuruna del Nanay',
    cuerpo:
      'En las orillas del Nanay, cuando el río crece, sale la yacuruna. Tiene cabello largo como lianas y vive bajo el agua en pueblos que solo ven los pescadores en sueños. Una noche, una joven oyó cantar desde la corriente. Quiso acercarse, pero su madre la detuvo: “Ese canto no es de este mundo”. Al amanecer encontraron solo huellas húmedas en la arena, que el sol borró antes del mediodía.',
  },
  {
    titulo: 'El tunchi que silbó tres veces',
    cuerpo:
      'Cuando el tunchi silba una vez, es aviso. Si silba dos, ya está cerca. Si silba tres, alguien de la casa debe encender la lámpara y rezar en voz baja. En Belén contaban que una familia oyó los tres silbidos y no abrió la puerta. Al día siguiente, el perro no quiso salir al patio. Desde entonces, cada vez que la noche se pone demasiado quieta, alguien dice: “Escucha… no sea el tunchi”.',
  },
];

async function iniciarBD(db) {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS cuento (
      id       INTEGER PRIMARY KEY AUTOINCREMENT,
      titulo   TEXT NOT NULL,
      cuerpo   TEXT NOT NULL DEFAULT '',
      creado   TEXT NOT NULL,
      editado  TEXT NOT NULL,
      favorito INTEGER NOT NULL DEFAULT 0
    );
  `);

  const columnas = await db.getAllAsync('PRAGMA table_info(cuento)');
  const tieneFavorito = columnas.some((c) => c.name === 'favorito');
  if (!tieneFavorito) {
    await db.runAsync(
      'ALTER TABLE cuento ADD COLUMN favorito INTEGER NOT NULL DEFAULT 0'
    );
  }

  const fila = await db.getFirstAsync('SELECT COUNT(*) AS total FROM cuento');
  if (fila?.total === 0) {
    const ahora = new Date().toISOString();
    for (const cuento of CUENTOS_SEMILLA) {
      await db.runAsync(
        'INSERT INTO cuento (titulo, cuerpo, creado, editado, favorito) VALUES (?, ?, ?, ?, 0)',
        [cuento.titulo, cuento.cuerpo, ahora, ahora]
      );
    }
  }
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
