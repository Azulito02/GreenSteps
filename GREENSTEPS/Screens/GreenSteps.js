import React, { useState } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, TextInput } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';

// Componente para el contenido de Inicio con imagen y un campo de texto
const HomeContent = () => {
  const [inputText, setInputText] = useState('');

  return (
    <View style={styles.contentContainer}>
      <Image source={require('../IMAGENES/logo0.png')} style={styles.contentImage} />
      <Text style={styles.contentText}>Este es el contenido de Inicio.</Text>
      <TextInput
        style={styles.input}
        placeholder="Escribe algo aquí..."
        value={inputText}
        onChangeText={setInputText}
      />
      <TouchableOpacity style={styles.button} onPress={() => alert(`Texto ingresado: ${inputText}`)}>
        <Text style={styles.buttonText}>Hacer algo</Text>
      </TouchableOpacity>
    </View>
  );
};

// Componente para el contenido de Reporte con imagen y un campo de texto
const ReportContent = () => {
  const [reportText, setReportText] = useState('');

  return (
    <View style={styles.contentContainer}>
      <Image source={require('../IMAGENES/logo0.png')} style={styles.contentImage} />
      <Text style={styles.contentText}>Formulario de Reporte</Text>
      <TextInput
        style={styles.input}
        placeholder="Describe tu reporte..."
        value={reportText}
        onChangeText={setReportText}
      />
      <TouchableOpacity style={styles.button} onPress={() => alert(`Reporte enviado: ${reportText}`)}>
        <Text style={styles.buttonText}>Enviar Reporte</Text>
      </TouchableOpacity>
    </View>
  );
};

// Componente para el contenido de Mapa con el mapa integrado
const MapContent = () => (
  <View style={styles.mapContainer}>
    <MapView
      style={styles.map}
      initialRegion={{
        latitude: 37.78825,
        longitude: -122.4324,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      }}
    >
      <Marker
        coordinate={{ latitude: 37.78825, longitude: -122.4324 }}
        title="Ubicación Ejemplo"
        description="Este es un marcador de ejemplo"
      />
    </MapView>
    <TouchableOpacity style={styles.button} onPress={() => alert('Mostrando ubicación en el mapa')}>
      <Text style={styles.buttonText}>Ver ubicación</Text>
    </TouchableOpacity>
  </View>
);

const SettingsContent = () => (
  <View style={styles.contentContainer}>
    <Text style={styles.contentText}>Configuración de la App</Text>
    <TouchableOpacity style={styles.button} onPress={() => alert('Configuración guardada')}>
      <Text style={styles.buttonText}>Guardar configuración</Text>
    </TouchableOpacity>
  </View>
);

export default function GreenSteps() {
  const [activeComponent, setActiveComponent] = useState(<HomeContent />);

  return (
    <View style={styles.container}>
      <Image source={require('../IMAGENES/logo2.png')} style={styles.logo} />
      <Text style={styles.text}>Green Steps</Text>

      {/* Aquí se mostrará el componente activo */}
      <View style={styles.contentArea}>
        {activeComponent}
      </View>

      {/* Barra de navegación */}
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.navButton} onPress={() => setActiveComponent(<HomeContent />)}>
          <MaterialIcons name="home" size={24} color="white" />
          <Text style={styles.navText}>Inicio</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={() => setActiveComponent(<ReportContent />)}>
          <MaterialIcons name="report" size={24} color="white" />
          <Text style={styles.navText}>Reportar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={() => setActiveComponent(<MapContent />)}>
          <MaterialIcons name="map" size={24} color="white" />
          <Text style={styles.navText}>Mapa</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={() => setActiveComponent(<SettingsContent />)}>
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
  contentArea: {
    flex: 1,
    width: '100%',
    paddingTop: 10,
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#008000',
    height: 60,
    width: '109%',
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
  contentContainer: {
    alignItems: 'center',
  },
  contentImage: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
  contentText: {
    fontSize: 18,
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    width: '100%',
    paddingHorizontal: 10,
  },
  button: {
    backgroundColor: '#008000',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
  },
  mapContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  map: {
    width: '100%',
    height: 200,
  },
});
