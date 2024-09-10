import React from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons'; // npm install @expo/vector-icons


export default function GreenSteps() {
  return (
    <View style={styles.container}>
      <Image source={require('../IMAGENES/logo2.png')} style={styles.logo} />
      <Text style={styles.text}>Green Steps</Text>

      {/* Barra de navegación */}
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.navButton}>
          <MaterialIcons name="home" size={24} color="white" />
          <Text style={styles.navText}>Inicio</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton}>
          <MaterialIcons name="report" size={24} color="white" />
          <Text style={styles.navText}>Reportar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton}>
          <MaterialIcons name="map" size={24} color="white" />
          <Text style={styles.navText}>Mapa</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton}>
          <MaterialIcons name="settings" size={24} color="white" />
          <Text style={styles.navText}>Ajustes</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start', 
    alignItems: 'flex-start', 
    padding: 10, 
  },
  logo: {
    width: 50, 
    height: 50,
    marginBottom: 10, 
  },
  text: {
    fontSize: 18, 
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#008000',
    height: 60,
    width: '110%', 
    position: 'absolute',
    bottom: 0,
  },
  navButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  navText: {
    color: 'white',
    fontSize: 12,
  },
});
