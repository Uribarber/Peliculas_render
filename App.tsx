
import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';

import Peliculas from './Peliculas';
import Catalogos from './Catalogos';

export default function App() {
  const [pantalla, setPantalla] = useState<
    'peliculas' | 'catalogos'
  >('peliculas');

  return (
    <SafeAreaView style={styles.contenedor}>
      <StatusBar barStyle="light-content" />

      <View style={styles.menu}>
        <Text style={styles.logo}>🎬 MI APLICACIÓN</Text>

        <View style={styles.botones}>
          <Pressable
            style={[
              styles.boton,
              pantalla === 'peliculas' && styles.activo,
            ]}
            onPress={() => setPantalla('peliculas')}
          >
            <Text style={styles.textoBoton}>
              🎬 Películas
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.boton,
              pantalla === 'catalogos' && styles.activo,
            ]}
            onPress={() => setPantalla('catalogos')}
          >
            <Text style={styles.textoBoton}>
              🛍 Catálogos
            </Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.contenido}>
        {pantalla === 'peliculas' ? (
          <Peliculas />
        ) : (
          <Catalogos />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: '#090B13',
  },
  menu: {
    padding: 15,
    backgroundColor: '#151A27',
  },
  logo: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  botones: {
    flexDirection: 'row',
    gap: 10,
  },
  boton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: '#293244',
    borderRadius: 10,
    alignItems: 'center',
  },
  activo: {
    backgroundColor: '#E83152',
  },
  textoBoton: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  contenido: {
    flex: 1,
  },
});
