import { useState, useEffect, useRef } from 'react';
import {
  TextInput,
  Pressable,
  Text,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  View,
  ScrollView,
} from 'react-native';
import {
  Stack,
  useLocalSearchParams,
  useRouter,
  useNavigation,
} from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { Audio } from 'expo-av';
import { useTema } from '../../src/theme';

function contarPalabras(texto) {
  const limpio = (texto || '').trim();
  if (!limpio) return 0;
  return limpio.split(/\s+/).filter(Boolean).length;
}

export default function Editor() {
  const db = useSQLiteContext();
  const router = useRouter();
  const navigation = useNavigation();
  const { c } = useTema();
  const { id } = useLocalSearchParams();
  const esNuevo = id === 'nuevo';
  const [titulo, setTitulo] = useState('');
  const [cuerpo, setCuerpo] = useState('');
  const [tituloOriginal, setTituloOriginal] = useState('');
  const [cuerpoOriginal, setCuerpoOriginal] = useState('');
  const [listo, setListo] = useState(esNuevo);
  const [etiquetas, setEtiquetas] = useState([]);
  const [seleccionadas, setSeleccionadas] = useState([]);
  const [lugares, setLugares] = useState([]);
  const [lugarId, setLugarId] = useState(null);
  const [audioUri, setAudioUri] = useState(null);
  const [grabando, setGrabando] = useState(false);
  const [cuentoId, setCuentoId] = useState(esNuevo ? null : Number(id));
  const permitiendoSalir = useRef(false);
  const recordingRef = useRef(null);
  const soundRef = useRef(null);

  const hayCambios =
    listo && (titulo !== tituloOriginal || cuerpo !== cuerpoOriginal);

  useEffect(() => {
    async function meta() {
      const tags = await db.getAllAsync(
        'SELECT id, nombre FROM etiqueta ORDER BY nombre ASC'
      );
      const locs = await db.getAllAsync(
        'SELECT id, comunidad, rio, quebrada FROM lugar ORDER BY comunidad ASC'
      );
      setEtiquetas(tags);
      setLugares(locs);
    }
    meta();
  }, [db]);

  useEffect(() => {
    if (esNuevo) {
      setListo(true);
      return;
    }
    async function cargar() {
      const fila = await db.getFirstAsync(
        'SELECT titulo, cuerpo, audio, lugar_id FROM cuento WHERE id = ?',
        [Number(id)]
      );
      if (fila) {
        setTitulo(fila.titulo);
        setCuerpo(fila.cuerpo);
        setTituloOriginal(fila.titulo);
        setCuerpoOriginal(fila.cuerpo);
        setAudioUri(fila.audio || null);
        setLugarId(fila.lugar_id || null);
      }
      const links = await db.getAllAsync(
        'SELECT etiqueta_id FROM cuento_etiqueta WHERE cuento_id = ?',
        [Number(id)]
      );
      setSeleccionadas(links.map((l) => l.etiqueta_id));
      setCuentoId(Number(id));
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

  // T10: autoguardado tras 3 s de inactividad
  useEffect(() => {
    if (!listo || !hayCambios) return;
    const timer = setTimeout(() => {
      guardar({ silencioso: true });
    }, 3000);
    return () => clearTimeout(timer);
  }, [titulo, cuerpo, listo, hayCambios, seleccionadas, lugarId, audioUri]);

  async function guardarEtiquetas(idCuento) {
    await db.runAsync('DELETE FROM cuento_etiqueta WHERE cuento_id = ?', [
      idCuento,
    ]);
    for (const eid of seleccionadas) {
      await db.runAsync(
        'INSERT INTO cuento_etiqueta (cuento_id, etiqueta_id) VALUES (?, ?)',
        [idCuento, eid]
      );
    }
  }

  async function guardar({ silencioso = false } = {}) {
    const limpio = titulo.trim();
    if (!limpio) {
      if (!silencioso) {
        Alert.alert('Falta el título', 'Todo cuento necesita un nombre.');
      }
      return;
    }
    const ahora = new Date().toISOString();
    let idActual = cuentoId;
    if (!idActual) {
      const resultado = await db.runAsync(
        `INSERT INTO cuento (titulo, cuerpo, creado, editado, favorito, audio, lugar_id)
         VALUES (?, ?, ?, ?, 0, ?, ?)`,
        [limpio, cuerpo, ahora, ahora, audioUri, lugarId]
      );
      idActual = resultado.lastInsertRowId;
      setCuentoId(idActual);
      await guardarEtiquetas(idActual);
      setTituloOriginal(limpio);
      setCuerpoOriginal(cuerpo);
      permitiendoSalir.current = true;
      router.replace(`/cuento/${idActual}`);
      return;
    }

    await db.runAsync(
      `UPDATE cuento SET titulo = ?, cuerpo = ?, editado = ?, audio = ?, lugar_id = ?
       WHERE id = ?`,
      [limpio, cuerpo, ahora, audioUri, lugarId, idActual]
    );
    await guardarEtiquetas(idActual);
    setTituloOriginal(limpio);
    setCuerpoOriginal(cuerpo);
    if (!silencioso) {
      permitiendoSalir.current = true;
      router.back();
    }
  }

  function confirmarBorrado() {
    Alert.alert('Borrar cuento', 'Esta acción no se puede deshacer.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Borrar',
        style: 'destructive',
        onPress: async () => {
          await db.runAsync('DELETE FROM cuento_etiqueta WHERE cuento_id = ?', [
            Number(id),
          ]);
          await db.runAsync('DELETE FROM cuento WHERE id = ?', [Number(id)]);
          permitiendoSalir.current = true;
          router.back();
        },
      },
    ]);
  }

  function toggleEtiqueta(eid) {
    setSeleccionadas((prev) =>
      prev.includes(eid) ? prev.filter((x) => x !== eid) : [...prev, eid]
    );
  }

  async function toggleGrabacion() {
    try {
      if (grabando && recordingRef.current) {
        await recordingRef.current.stopAndUnloadAsync();
        const uri = recordingRef.current.getURI();
        recordingRef.current = null;
        setGrabando(false);
        setAudioUri(uri);
        return;
      }
      const permiso = await Audio.requestPermissionsAsync();
      if (!permiso.granted) {
        Alert.alert('Permiso', 'Necesito acceso al micrófono para grabar.');
        return;
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      await recording.startAsync();
      recordingRef.current = recording;
      setGrabando(true);
    } catch (e) {
      Alert.alert('Audio', e.message || 'No se pudo grabar.');
      setGrabando(false);
    }
  }

  async function reproducir() {
    if (!audioUri) return;
    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }
      const { sound } = await Audio.Sound.createAsync({ uri: audioUri });
      soundRef.current = sound;
      await sound.playAsync();
    } catch (e) {
      Alert.alert('Audio', e.message || 'No se pudo reproducir.');
    }
  }

  useEffect(() => {
    return () => {
      if (soundRef.current) soundRef.current.unloadAsync();
      if (recordingRef.current) recordingRef.current.stopAndUnloadAsync();
    };
  }, []);

  const palabras = contarPalabras(cuerpo);

  return (
    <KeyboardAvoidingView
      style={[styles.contenedor, { backgroundColor: c.fondo }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Stack.Screen
        options={{ title: esNuevo && !cuentoId ? 'Nuevo cuento' : 'Editar cuento' }}
      />
      <ScrollView contentContainerStyle={{ gap: 12, paddingBottom: 24 }}>
        <TextInput
          style={[
            styles.titulo,
            {
              backgroundColor: c.inputFondo,
              borderColor: c.borde,
              color: c.texto,
            },
          ]}
          placeholder="Título del cuento"
          placeholderTextColor={c.muted}
          value={titulo}
          onChangeText={setTitulo}
        />
        <TextInput
          style={[
            styles.cuerpo,
            {
              backgroundColor: c.inputFondo,
              borderColor: c.borde,
              color: c.texto,
            },
          ]}
          placeholder="Había una vez, en la quebrada..."
          placeholderTextColor={c.muted}
          value={cuerpo}
          onChangeText={setCuerpo}
          multiline
          textAlignVertical="top"
        />
        <Text style={[styles.palabras, { color: c.muted }]}>
          {palabras} {palabras === 1 ? 'palabra' : 'palabras'}
          {hayCambios ? ' · autoguardado en 3 s…' : ''}
        </Text>

        <Text style={[styles.seccion, { color: c.texto }]}>Etiquetas</Text>
        <View style={styles.fila}>
          {etiquetas.map((e) => {
            const on = seleccionadas.includes(e.id);
            return (
              <Pressable
                key={e.id}
                onPress={() => toggleEtiqueta(e.id)}
                style={[
                  styles.chip,
                  { backgroundColor: on ? c.chipActivo : c.chip },
                ]}
              >
                <Text
                  style={{
                    color: on ? c.chipTextoActivo : c.texto,
                    fontSize: 13,
                  }}
                >
                  {e.nombre}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={[styles.seccion, { color: c.texto }]}>Lugar</Text>
        <View style={styles.fila}>
          <Pressable
            onPress={() => setLugarId(null)}
            style={[
              styles.chip,
              { backgroundColor: !lugarId ? c.chipActivo : c.chip },
            ]}
          >
            <Text
              style={{
                color: !lugarId ? c.chipTextoActivo : c.texto,
                fontSize: 13,
              }}
            >
              Sin lugar
            </Text>
          </Pressable>
          {lugares.map((l) => {
            const on = lugarId === l.id;
            return (
              <Pressable
                key={l.id}
                onPress={() => setLugarId(l.id)}
                style={[
                  styles.chip,
                  { backgroundColor: on ? c.chipActivo : c.chip },
                ]}
              >
                <Text
                  style={{
                    color: on ? c.chipTextoActivo : c.texto,
                    fontSize: 13,
                  }}
                >
                  {l.comunidad}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={[styles.seccion, { color: c.texto }]}>Audio oral</Text>
        <View style={styles.fila}>
          <Pressable
            style={[styles.miniBoton, { backgroundColor: c.primario }]}
            onPress={toggleGrabacion}
          >
            <Text style={{ color: c.primarioTexto, fontWeight: '600' }}>
              {grabando ? 'Detener' : 'Grabar'}
            </Text>
          </Pressable>
          {!!audioUri && (
            <Pressable
              style={[styles.miniBoton, { backgroundColor: c.chip }]}
              onPress={reproducir}
            >
              <Text style={{ color: c.texto, fontWeight: '600' }}>
                Reproducir
              </Text>
            </Pressable>
          )}
        </View>

        <Pressable
          style={[styles.guardar, { backgroundColor: c.primario }]}
          onPress={() => guardar({ silencioso: false })}
        >
          <Text style={[styles.guardarTexto, { color: c.primarioTexto }]}>
            Guardar
          </Text>
        </Pressable>
        {!!cuentoId && (
          <Pressable onPress={confirmarBorrado}>
            <Text style={[styles.borrar, { color: c.peligro }]}>
              Borrar este cuento
            </Text>
          </Pressable>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, padding: 16 },
  titulo: {
    fontSize: 18,
    fontWeight: '600',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
  },
  cuerpo: {
    minHeight: 180,
    fontSize: 15,
    lineHeight: 22,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
  },
  palabras: { fontSize: 13, textAlign: 'right' },
  seccion: { fontSize: 14, fontWeight: '600', marginTop: 4 },
  fila: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6 },
  miniBoton: {
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  guardar: {
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  guardarTexto: { fontWeight: '600' },
  borrar: { textAlign: 'center', paddingVertical: 10 },
});
