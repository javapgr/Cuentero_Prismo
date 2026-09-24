import { useState, useEffect, useRef } from 'react';
import {
  TextInput,
  Pressable,
  Text,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter, useNavigation } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';

function contarPalabras(texto) {
  const limpio = (texto || '').trim();
  if (!limpio) return 0;
  return limpio.split(/\s+/).filter(Boolean).length;
}

export default function Editor() {
  const db = useSQLiteContext();
  const router = useRouter();
  const navigation = useNavigation();
  const { id } = useLocalSearchParams();
  const esNuevo = id === 'nuevo';
  const [titulo, setTitulo] = useState('');
  const [cuerpo, setCuerpo] = useState('');
  const [tituloOriginal, setTituloOriginal] = useState('');
  const [cuerpoOriginal, setCuerpoOriginal] = useState('');
  const [listo, setListo] = useState(esNuevo);
  const permitiendoSalir = useRef(false);

  const hayCambios =
    listo && (titulo !== tituloOriginal || cuerpo !== cuerpoOriginal);

  useEffect(() => {
    if (esNuevo) {
      setListo(true);
      return;
    }
    async function cargar() {
      const fila = await db.getFirstAsync(
        'SELECT titulo, cuerpo FROM cuento WHERE id = ?',
        [Number(id)]
      );
      if (fila) {
        setTitulo(fila.titulo);
        setCuerpo(fila.cuerpo);
        setTituloOriginal(fila.titulo);
        setCuerpoOriginal(fila.cuerpo);
      }
      setListo(true);
    }
    cargar();
  }, [id, esNuevo, db]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (permitiendoSalir.current || !hayCambios) return;
      e.preventDefault();
      Alert.alert(
        'Salir sin guardar',
        'Tienes cambios sin guardar. ¿Deseas descartarlos?',
        [
          { text: 'Seguir editando', style: 'cancel' },
          {
            text: 'Descartar',
            style: 'destructive',
            onPress: () => {
              permitiendoSalir.current = true;
              navigation.dispatch(e.data.action);
            },
          },
        ]
      );
    });
    return unsubscribe;
  }, [navigation, hayCambios]);

  async function guardar() {
    const limpio = titulo.trim();
    if (!limpio) {
      Alert.alert('Falta el título', 'Todo cuento necesita un nombre.');
      return;
    }
    const ahora = new Date().toISOString();
    if (esNuevo) {
      await db.runAsync(
        'INSERT INTO cuento (titulo, cuerpo, creado, editado, favorito) VALUES (?, ?, ?, ?, 0)',
        [limpio, cuerpo, ahora, ahora]
      );
    } else {
      await db.runAsync(
        'UPDATE cuento SET titulo = ?, cuerpo = ?, editado = ? WHERE id = ?',
        [limpio, cuerpo, ahora, Number(id)]
      );
    }
    permitiendoSalir.current = true;
    setTituloOriginal(limpio);
    setCuerpoOriginal(cuerpo);
    router.back();
  }

  function confirmarBorrado() {
    Alert.alert('Borrar cuento', 'Esta acción no se puede deshacer.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Borrar',
        style: 'destructive',
        onPress: async () => {
          await db.runAsync('DELETE FROM cuento WHERE id = ?', [Number(id)]);
          permitiendoSalir.current = true;
          router.back();
        },
      },
    ]);
  }

  const palabras = contarPalabras(cuerpo);

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
      <Text style={styles.palabras}>
        {palabras} {palabras === 1 ? 'palabra' : 'palabras'}
      </Text>
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
  palabras: {
    fontSize: 13,
    color: '#7a8b7f',
    textAlign: 'right',
  },
  guardar: {
    backgroundColor: '#1b4332',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  guardarTexto: { color: '#fff', fontWeight: '600' },
  borrar: { textAlign: 'center', color: '#a4161a', paddingVertical: 10 },
});
