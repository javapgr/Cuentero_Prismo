import { View, Text, Pressable, Alert, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { useTema } from '../src/theme';

function parsearMarkdown(texto) {
  const bloques = texto.split(/\n\s*---\s*\n/);
  const cuentos = [];
  for (const bloque of bloques) {
    const limpio = bloque.trim();
    if (!limpio) continue;
    const match = limpio.match(/^#\s+(.+?)\n(?:\((.+?)\)\n)?\n?([\s\S]*)$/);
    if (!match) continue;
    cuentos.push({
      titulo: match[1].trim(),
      creado: match[2] || new Date().toISOString().slice(0, 10),
      cuerpo: (match[3] || '').trim(),
    });
  }
  return cuentos;
}

export default function Ajustes() {
  const db = useSQLiteContext();
  const { c } = useTema();

  async function exportar() {
    const cuentos = await db.getAllAsync(
      'SELECT titulo, cuerpo, creado FROM cuento ORDER BY creado ASC'
    );
    if (cuentos.length === 0) {
      Alert.alert('Nada que exportar', 'Todavía no has escrito ningún cuento.');
      return;
    }
    const texto = cuentos
      .map((x) => `# ${x.titulo}\n(${x.creado.slice(0, 10)})\n\n${x.cuerpo}`)
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

  async function importar() {
    try {
      const resultado = await DocumentPicker.getDocumentAsync({
        type: ['text/markdown', 'text/plain', '*/*'],
        copyToCacheDirectory: true,
      });
      if (resultado.canceled || !resultado.assets?.length) return;
      const uri = resultado.assets[0].uri;
      const archivo = new File(uri);
      const texto = await archivo.text();
      const cuentos = parsearMarkdown(texto);
      if (!cuentos.length) {
        Alert.alert(
          'Formato',
          'No encontré cuentos. Usa el mismo formato del export (# título + ---).'
        );
        return;
      }
      const ahora = new Date().toISOString();
      let insertados = 0;
      for (const cu of cuentos) {
        await db.runAsync(
          'INSERT INTO cuento (titulo, cuerpo, creado, editado, favorito) VALUES (?, ?, ?, ?, 0)',
          [cu.titulo, cu.cuerpo, ahora, ahora]
        );
        insertados += 1;
      }
      Alert.alert('Importado', `Se agregaron ${insertados} cuento(s).`);
    } catch (e) {
      Alert.alert('Error', e.message || 'No se pudo importar el archivo.');
    }
  }

  return (
    <View style={[styles.contenedor, { backgroundColor: c.fondo }]}>
      <Stack.Screen options={{ title: 'Ajustes' }} />
      <Pressable
        style={[styles.boton, { backgroundColor: c.primario }]}
        onPress={exportar}
      >
        <Text style={[styles.botonTexto, { color: c.primarioTexto }]}>
          Exportar todos mis cuentos
        </Text>
      </Pressable>
      <Pressable
        style={[styles.boton, { backgroundColor: c.chip }]}
        onPress={importar}
      >
        <Text style={[styles.botonTexto, { color: c.texto }]}>
          Importar desde Markdown
        </Text>
      </Pressable>
      <Text style={[styles.nota, { color: c.muted }]}>
        Exporta o importa un archivo Markdown con tus cuentos (separados por ---).
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, padding: 16, gap: 12 },
  boton: {
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  botonTexto: { fontWeight: '600' },
  nota: { fontSize: 13, lineHeight: 19 },
});
