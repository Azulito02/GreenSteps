import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Image, ImageBackground, TouchableOpacity} from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
       <ImageBackground
        source={require('./IMAGENES/atras.png')}
        style={styles.background}
      >
      <Image 
        source={require('./IMAGENES/logo0.png')} 
        style={styles.logo}
      />
      <Text style={styles.texto}>
        Green
        <Text style={styles.textBlue}>Step</Text>
        </Text>
        </ImageBackground>

        <View style={styles.topContent}>
        <Text style={styles.topText}> Inicia sesión para descubrir cómo tus acciones diarias pueden marcar la diferencia. Juntos, podemos crear un futuro más verde y sostenible</Text>
      </View>

      <View style={styles.bottomContent}>
        <TouchableOpacity style={styles.button} onPress={() => alert('Botón con fondo presionado')}>
          <Text style={styles.buttonText}>Inicio</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  background: {
    width: '100%',     // Ocupa todo el ancho de la pantalla
    height: '80%',     // Ocupa la mitad superior de la pantalla
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',  // Posiciona la imagen en la parte superior
    top: 0,                // Ancla la imagen en la parte superior
    left: 0,
  },

  logo: {
    width: 250,
    height: 250,
    marginTop: 220,
  },
  texto: {
    fontSize: 50,
    fontWeight: 'bold',
    marginTop: 50,
    color: 'turquoise',
  },
  textBlue: {
    fontSize: 50,
    fontWeight: 'bold',
    marginTop: 50,
    color: 'blue',
},
topContent: {
  marginTop: '120%',  // Desplaza el texto debajo de la imagen de fondo
  justifyContent: 'center',
  alignItems: 'center',
},
topText: {
  fontSize: 15,
  color: 'black',
},
bottomContent: {
  position: 'absolute',
  bottom: 70,
  width: '100%',
  justifyContent: 'center',
  alignItems: 'center',
},
button: {
  backgroundColor: '#F9DBAE',  // Fondo verde del botón
  paddingVertical: 15,
  paddingHorizontal: 85,
  borderRadius: 10,
},
buttonText: {
  color: 'blue',  // Color del texto del botón
  fontSize: 32,
  fontWeight: 'bold',
},
});
