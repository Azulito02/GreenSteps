import React from 'react';
import { StyleSheet, View, Text, Image } from 'react-native';

export default function GreenSteps() {
  return (
    <View style={styles.container}>
      <Image source={require('../IMAGENES/logo0.png')} style={styles.logo} />
      <Text style={styles.text}>Green Steps</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start', // Alinea los elementos en la parte superior
    alignItems: 'flex-start', // Alinea los elementos a la izquierda
    padding: 10, // Añade un poco de espacio alrededor del contenido
  },
  logo: {
    width: 50, // Ajusta el tamaño del logo según necesites
    height: 50,
    marginBottom: 10, // Añade un margen debajo del logo para separarlo del texto
  },
  text: {
    fontSize: 18, // Ajusta el tamaño de la fuente según necesites
  },
});
