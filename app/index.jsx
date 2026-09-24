import { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Stack, useRouter, useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useTema } from '../src/theme';

export default function Lista() {
  const db = useSQLiteContext();
  const router = useRouter();
  const { c } = useTema();
  const [cuentos, setCuentos] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [etiquetas, setEtiquetas] = useState([]);
  const [filtroEtiqueta, setFiltroEtiqueta] = useState(null);

  useFocusEffect(
    useCallback(() => {
      let activo = true;
      async function cargar() {
        const tags = await db.getAllAsync(
          'SELECT id, nombre FROM etiqueta ORDER BY nombre ASC'
        );
        const texto = busqueda.trim();
        let filas;
        if (filtroEtiqueta) {
          if (texto) {
            filas = await db.getAllAsync(
              `SELECT c.id, c.titulo, c.cuerpo, c.editado, c.favorito
               FROM cuento c
               INNER JOIN cuento_etiqueta ce ON ce.cuento_id = c.id
               WHERE ce.etiqueta_id = ? AND c.titulo LIKE ?
               ORDER BY c.favorito DESC, c.editado DESC`,
              [filtroEtiqueta, `%${texto}%`]
            );
          } else {
            filas = await db.getAllAsync(
              `SELECT c.id, c.titulo, c.cuerpo, c.editado, c.favorito
               FROM cuento c
               INNER JOIN cuento_etiqueta ce ON ce.cuento_id = c.id
               WHERE ce.etiqueta_id = ?
               ORDER BY c.favorito DESC, c.editado DESC`,
              [filtroEtiqueta]
            );
          }
        } else if (texto) {
          filas = await db.getAllAsync(
            `SELECT id, titulo, cuerpo, editado, favorito
             FROM cuento
             WHERE titulo LIKE ?
             ORDER BY favorito DESC, editado DESC`,
            [`%${texto}%`]
          );
        } else {
          filas = await db.getAllAsync(
            `SELECT id, titulo, cuerpo, editado, favorito
             FROM cuento
             ORDER BY favorito DESC, editado DESC`
          );
        }
        if (activo) {
          setEtiquetas(tags);
          setCuentos(filas);
        }
      }
      cargar();
      return () => {
        activo = false;
      };
    }, [db, busqueda, filtroEtiqueta])
  );

  async function alternarFavorito(item) {
    const nuevo = item.favorito ? 0 : 1;
    await db.runAsync('UPDATE cuento SET favorito = ? WHERE id = ?', [
      nuevo,
      item.id,
    ]);
    setCuentos((prev) =>
      [...prev.map((x) => (x.id === item.id ? { ...x, favorito: nuevo } : x))].sort(
        (a, b) =>
          b.favorito - a.favorito ||
          String(b.editado).localeCompare(String(a.editado))
      )
    );
  }

  function vistaPrevia(cuerpo) {
    const texto = (cuerpo || '').replace(/\s+/g, ' ').trim();
    if (texto.length <= 80) return texto;
    return `${texto.slice(0, 80)}…`;
  }

  return (
    <View style={[styles.contenedor, { backgroundColor: c.fondo }]}>
      <Stack.Screen
        options={{
          title: `Cuentero (${cuentos.length})`,
          headerRight: () => (
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <Pressable onPress={() => router.push('/lugares')}>
                <Text style={{ color: '#fff', fontSize: 15 }}>Lugares</Text>
              </Pressable>
              <Pressable onPress={() => router.push('/ajustes')}>
                <Text style={{ color: '#fff', fontSize: 15 }}>Ajustes</Text>
              </Pressable>
            </View>
          ),
        }}
      />
      <TextInput
        style={[
          styles.buscador,
          {
            backgroundColor: c.inputFondo,
            borderColor: c.borde,
            color: c.texto,
          },
        ]}
        placeholder="Buscar por título…"
        placeholderTextColor={c.muted}
        value={busqueda}
        onChangeText={setBusqueda}
      />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
      >
        <Pressable
          style={[
            styles.chip,
            {
              backgroundColor: !filtroEtiqueta ? c.chipActivo : c.chip,
            },
          ]}
          onPress={() => setFiltroEtiqueta(null)}
        >
          <Text
            style={{
              color: !filtroEtiqueta ? c.chipTextoActivo : c.texto,
              fontSize: 13,
            }}
          >
            Todas
          </Text>
        </Pressable>
        {etiquetas.map((e) => {
          const activo = filtroEtiqueta === e.id;
          return (
            <Pressable
              key={e.id}
              style={[
                styles.chip,
                { backgroundColor: activo ? c.chipActivo : c.chip },
              ]}
              onPress={() => setFiltroEtiqueta(activo ? null : e.id)}
            >
              <Text
                style={{
                  color: activo ? c.chipTextoActivo : c.texto,
                  fontSize: 13,
                }}
              >
                {e.nombre}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
      <FlatList
        data={cuentos}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 96 }}
        ListEmptyComponent={
          <Text style={[styles.vacio, { color: c.muted }]}>
            {busqueda.trim() || filtroEtiqueta
              ? 'Ningún cuento coincide con el filtro.'
              : 'Todavía no hay cuentos. Toca + para escribir el primero.'}
          </Text>
        }
        renderItem={({ item }) => (
          <View
            style={[
              styles.tarjeta,
              { backgroundColor: c.tarjeta, borderColor: c.borde },
            ]}
          >
            <View style={styles.tarjetaCabecera}>
              <Pressable
                style={{ flex: 1 }}
                onPress={() => router.push(`/cuento/${item.id}`)}
              >
                <Text style={[styles.tarjetaTitulo, { color: c.texto }]}>
                  {item.titulo}
                </Text>
              </Pressable>
              <Pressable onPress={() => alternarFavorito(item)} hitSlop={8}>
                <Text style={[styles.estrella, { color: c.estrella }]}>
                  {item.favorito ? '★' : '☆'}
                </Text>
              </Pressable>
            </View>
            <Pressable onPress={() => router.push(`/cuento/${item.id}`)}>
              {!!item.cuerpo && (
                <Text
                  style={[styles.tarjetaPreview, { color: c.preview }]}
                  numberOfLines={2}
                >
                  {vistaPrevia(item.cuerpo)}
                </Text>
              )}
              <Text style={[styles.tarjetaFecha, { color: c.muted }]}>
                {new Date(item.editado).toLocaleDateString('es-PE')}
              </Text>
            </Pressable>
          </View>
        )}
      />
      <Pressable
        style={[styles.boton, { backgroundColor: c.primario }]}
        onPress={() => router.push('/cuento/nuevo')}
      >
        <Text style={[styles.botonTexto, { color: c.primarioTexto }]}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1 },
  buscador: {
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    fontSize: 15,
  },
  chips: { paddingHorizontal: 16, paddingTop: 10, gap: 8 },
  chip: { borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6 },
  tarjeta: { borderRadius: 12, padding: 16, borderWidth: 1 },
  tarjetaCabecera: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  tarjetaTitulo: { flex: 1, fontSize: 16, fontWeight: '600' },
  estrella: { fontSize: 22, lineHeight: 24 },
  tarjetaPreview: { fontSize: 13, marginTop: 6, lineHeight: 18 },
  tarjetaFecha: { fontSize: 12, marginTop: 6 },
  vacio: { textAlign: 'center', marginTop: 40 },
  boton: {
    position: 'absolute',
    right: 20,
    bottom: 28,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  botonTexto: { fontSize: 28, lineHeight: 30 },
});
