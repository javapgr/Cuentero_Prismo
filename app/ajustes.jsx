import { View, Text, Pressable, Alert, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { File, Paths } from 'expo-file-system';
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

    const archivo = new File(Paths.document, 'cuentos.md');
    archivo.create({ overwrite: true });
    archivo.write(texto);

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(archivo.uri);
    } else {
      Alert.alert('Guardado', `Archivo creado en: ${archivo.uri}`);
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
