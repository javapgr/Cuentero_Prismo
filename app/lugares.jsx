import { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
  TextInput,
  Alert,
} from 'react-native';
import { Stack, useFocusEffect, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useTema } from '../src/theme';

export default function Lugares() {
  const db = useSQLiteContext();
  const { c } = useTema();
  const router = useRouter();
  const [grupos, setGrupos] = useState([]);
  const [recarga, setRecarga] = useState(0);
  const [formulario, setFormulario] = useState(false);
  const [comunidad, setComunidad] = useState('');
  const [rio, setRio] = useState('');
  const [quebrada, setQuebrada] = useState('');
  const [guardando, setGuardando] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let activo = true;
      async function cargar() {
        const lugares = await db.getAllAsync(
          'SELECT id, comunidad, rio, quebrada FROM lugar ORDER BY comunidad ASC'
        );
        const data = [];
        for (const lugar of lugares) {
          const cuentos = await db.getAllAsync(
            'SELECT id, titulo FROM cuento WHERE lugar_id = ? ORDER BY titulo ASC',
            [lugar.id]
          );
          data.push({ ...lugar, cuentos });
        }
        const sinLugar = await db.getAllAsync(
          'SELECT id, titulo FROM cuento WHERE lugar_id IS NULL ORDER BY titulo ASC'
        );
        if (sinLugar.length) {
          data.push({
            id: 0,
            comunidad: 'Sin lugar asignado',
            rio: '',
            quebrada: '',
            cuentos: sinLugar,
          });
        }
        if (activo) setGrupos(data);
      }
      cargar();
      return () => {
        activo = false;
      };
    }, [db, recarga])
  );

  function cerrarFormulario() {
    setFormulario(false);
    setComunidad('');
    setRio('');
    setQuebrada('');
  }

  async function guardarLugar() {
    const nombre = comunidad.trim();
    if (!nombre) {
      Alert.alert('Falta la comunidad', 'Escribe el nombre del lugar.');
      return;
    }
    setGuardando(true);
    try {
      await db.runAsync(
        'INSERT INTO lugar (comunidad, rio, quebrada) VALUES (?, ?, ?)',
        [nombre, rio.trim(), quebrada.trim()]
      );
      cerrarFormulario();
      setRecarga((n) => n + 1);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <View style={[styles.contenedor, { backgroundColor: c.fondo }]}>
      <Stack.Screen options={{ title: 'Lugares' }} />
      <FlatList
        data={grupos}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 32 }}
        ListHeaderComponent={
          formulario ? (
            <View
              style={[
                styles.bloque,
                { backgroundColor: c.tarjeta, borderColor: c.borde },
              ]}
            >
              <Text style={[styles.titulo, { color: c.texto }]}>Nuevo lugar</Text>
              <TextInput
                value={comunidad}
                onChangeText={setComunidad}
                placeholder="Comunidad"
                placeholderTextColor={c.muted}
                style={[
                  styles.campo,
                  { color: c.texto, backgroundColor: c.inputFondo, borderColor: c.borde },
                ]}
              />
              <TextInput
                value={rio}
                onChangeText={setRio}
                placeholder="Río"
                placeholderTextColor={c.muted}
                style={[
                  styles.campo,
                  { color: c.texto, backgroundColor: c.inputFondo, borderColor: c.borde },
                ]}
              />
              <TextInput
                value={quebrada}
                onChangeText={setQuebrada}
                placeholder="Quebrada"
                placeholderTextColor={c.muted}
                style={[
                  styles.campo,
                  { color: c.texto, backgroundColor: c.inputFondo, borderColor: c.borde },
                ]}
              />
              <View style={styles.fila}>
                <Pressable
                  onPress={cerrarFormulario}
                  style={[styles.accion, { borderColor: c.borde, borderWidth: 1 }]}
                >
                  <Text style={{ color: c.texto }}>Cancelar</Text>
                </Pressable>
                <Pressable
                  onPress={guardarLugar}
                  disabled={guardando}
                  style={[styles.accion, { backgroundColor: c.primario }]}
                >
                  <Text style={{ color: c.primarioTexto }}>
                    {guardando ? 'Guardando…' : 'Guardar'}
                  </Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <Pressable
              onPress={() => setFormulario(true)}
              style={[styles.accion, { backgroundColor: c.primario, alignSelf: 'flex-start' }]}
            >
              <Text style={{ color: c.primarioTexto, fontWeight: '600' }}>
                Agregar lugar
              </Text>
            </Pressable>
          )
        }
        ListEmptyComponent={
          <Text style={{ color: c.muted, textAlign: 'center', marginTop: 40 }}>
            No hay lugares todavía.
          </Text>
        }
        renderItem={({ item }) => (
          <View
            style={[
              styles.bloque,
              { backgroundColor: c.tarjeta, borderColor: c.borde },
            ]}
          >
            <Text style={[styles.titulo, { color: c.texto }]}>
              {item.comunidad}
            </Text>
            {(item.rio || item.quebrada) && (
              <Text style={{ color: c.muted, marginBottom: 8 }}>
                {[item.rio && `Río ${item.rio}`, item.quebrada]
                  .filter(Boolean)
                  .join(' · ')}
              </Text>
            )}
            {item.cuentos.length === 0 ? (
              <Text style={{ color: c.muted }}>Sin cuentos en este lugar.</Text>
            ) : (
              item.cuentos.map((cu) => (
                <Pressable
                  key={cu.id}
                  onPress={() => router.push(`/cuento/${cu.id}`)}
                  style={{ paddingVertical: 6 }}
                >
                  <Text style={{ color: c.texto }}>{cu.titulo}</Text>
                </Pressable>
              ))
            )}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1 },
  bloque: { borderRadius: 12, padding: 16, borderWidth: 1 },
  titulo: { fontSize: 17, fontWeight: '600', marginBottom: 4 },
  campo: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    marginTop: 10,
  },
  fila: { flexDirection: 'row', gap: 10, marginTop: 12 },
  accion: { borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10 },
});
