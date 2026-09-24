import { useState, useCallback } from 'react';
import { View, Text, TextInput, FlatList, Pressable, StyleSheet } from 'react-native';
import { Stack, useRouter, useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';

export default function Lista() {
  const db = useSQLiteContext();
  const router = useRouter();
  const [cuentos, setCuentos] = useState([]);
  const [busqueda, setBusqueda] = useState('');

  useFocusEffect(
    useCallback(() => {
      let activo = true;
      async function cargar() {
        const texto = busqueda.trim();
        let filas;
        if (texto) {
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
        if (activo) setCuentos(filas);
      }
      cargar();
      return () => {
        activo = false;
      };
    }, [db, busqueda])
  );

  async function alternarFavorito(item) {
    const nuevo = item.favorito ? 0 : 1;
    await db.runAsync('UPDATE cuento SET favorito = ? WHERE id = ?', [
      nuevo,
      item.id,
    ]);
    setCuentos((prev) =>
      [...prev.map((c) => (c.id === item.id ? { ...c, favorito: nuevo } : c))].sort(
        (a, b) => b.favorito - a.favorito || String(b.editado).localeCompare(String(a.editado))
      )
    );
  }

  function vistaPrevia(cuerpo) {
    const texto = (cuerpo || '').replace(/\s+/g, ' ').trim();
    if (texto.length <= 80) return texto;
    return `${texto.slice(0, 80)}…`;
  }

  return (
    <View style={styles.contenedor}>
      <Stack.Screen
        options={{
          title: `Cuentero (${cuentos.length})`,
          headerRight: () => (
            <Pressable onPress={() => router.push('/ajustes')}>
              <Text style={{ color: '#fff', fontSize: 16 }}>Ajustes</Text>
            </Pressable>
          ),
        }}
      />
      <TextInput
        style={styles.buscador}
        placeholder="Buscar por título…"
        value={busqueda}
        onChangeText={setBusqueda}
        clearButtonMode="while-editing"
      />
      <FlatList
        data={cuentos}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 96 }}
        ListEmptyComponent={
          <Text style={styles.vacio}>
            {busqueda.trim()
              ? 'Ningún cuento coincide con la búsqueda.'
              : 'Todavía no hay cuentos. Toca + para escribir el primero.'}
          </Text>
        }
        renderItem={({ item }) => (
          <View style={styles.tarjeta}>
            <View style={styles.tarjetaCabecera}>
              <Pressable
                style={{ flex: 1 }}
                onPress={() => router.push(`/cuento/${item.id}`)}
              >
                <Text style={styles.tarjetaTitulo}>{item.titulo}</Text>
              </Pressable>
              <Pressable onPress={() => alternarFavorito(item)} hitSlop={8}>
                <Text style={styles.estrella}>{item.favorito ? '★' : '☆'}</Text>
              </Pressable>
            </View>
            <Pressable onPress={() => router.push(`/cuento/${item.id}`)}>
              {!!item.cuerpo && (
                <Text style={styles.tarjetaPreview} numberOfLines={2}>
                  {vistaPrevia(item.cuerpo)}
                </Text>
              )}
              <Text style={styles.tarjetaFecha}>
                {new Date(item.editado).toLocaleDateString('es-PE')}
              </Text>
            </Pressable>
          </View>
        )}
      />
      <Pressable style={styles.boton} onPress={() => router.push('/cuento/nuevo')}>
        <Text style={styles.botonTexto}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: '#f7f5f0' },
  buscador: {
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#e8e2d5',
    fontSize: 15,
  },
  tarjeta: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e8e2d5',
  },
  tarjetaCabecera: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  tarjetaTitulo: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#1b4332',
  },
  estrella: { fontSize: 22, color: '#c9a227', lineHeight: 24 },
  tarjetaPreview: {
    fontSize: 13,
    color: '#5c6b61',
    marginTop: 6,
    lineHeight: 18,
  },
  tarjetaFecha: { fontSize: 12, color: '#7a8b7f', marginTop: 6 },
  vacio: { textAlign: 'center', color: '#7a8b7f', marginTop: 40 },
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
});
