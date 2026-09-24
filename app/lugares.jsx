import { useCallback, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Pressable } from 'react-native';
import { Stack, useFocusEffect, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useTema } from '../src/theme';

export default function Lugares() {
  const db = useSQLiteContext();
  const { c } = useTema();
  const router = useRouter();
  const [grupos, setGrupos] = useState([]);

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
    }, [db])
  );

  return (
    <View style={[styles.contenedor, { backgroundColor: c.fondo }]}>
      <Stack.Screen options={{ title: 'Lugares' }} />
      <FlatList
        data={grupos}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ padding: 16, gap: 16 }}
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
});
