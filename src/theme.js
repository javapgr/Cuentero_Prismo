import { useColorScheme } from 'react-native';

const claro = {
  fondo: '#f7f5f0',
  tarjeta: '#ffffff',
  borde: '#e8e2d5',
  texto: '#1b4332',
  muted: '#7a8b7f',
  preview: '#5c6b61',
  primario: '#1b4332',
  primarioTexto: '#ffffff',
  peligro: '#a4161a',
  estrella: '#c9a227',
  inputFondo: '#ffffff',
  chip: '#e8e2d5',
  chipActivo: '#1b4332',
  chipTextoActivo: '#ffffff',
};

const oscuro = {
  fondo: '#121a16',
  tarjeta: '#1c2922',
  borde: '#2f4037',
  texto: '#e8f0ea',
  muted: '#9aada2',
  preview: '#b7c7bc',
  primario: '#2d6a4f',
  primarioTexto: '#ffffff',
  peligro: '#f07178',
  estrella: '#e9c46a',
  inputFondo: '#1c2922',
  chip: '#2f4037',
  chipActivo: '#40916c',
  chipTextoActivo: '#ffffff',
};

/** T9: detecta el tema del sistema y devuelve la paleta. */
export function useTema() {
  const esquema = useColorScheme();
  const oscuroActivo = esquema === 'dark';
  return {
    oscuro: oscuroActivo,
    c: oscuroActivo ? oscuro : claro,
  };
}
